import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ImagePlus, Sparkles, X } from 'lucide-react';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const BrandingEditor: React.FC = () => {
	const { branding } = useSnapshot(globalStore.proxy);
	const { pending, setPending } = useSettingsContext();
	const [colorInput, setColorInput] = React.useState(branding.primaryColor);
	const [isUploading, setIsUploading] = React.useState(false);
	const [isGenerating, setIsGenerating] = React.useState(false);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Get current values (pending or saved)
	const currentLogoUrl =
		pending.logoUrl !== undefined ? pending.logoUrl : branding.logoUrl;
	const currentPrimaryColor =
		pending.primaryColor !== undefined
			? pending.primaryColor
			: branding.primaryColor;

	React.useEffect(() => {
		if (pending.primaryColor === undefined) {
			setColorInput(branding.primaryColor);
		}
	}, [branding.primaryColor, pending.primaryColor]);

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setColorInput(value);
		if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
			if (value === branding.primaryColor) {
				// Remove from pending if same as saved
				setPending((prev) => {
					const { primaryColor: _, ...rest } = prev;
					return rest;
				});
			} else {
				setPending((prev) => ({ ...prev, primaryColor: value }));
			}
		}
	};

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, ['logo']);
			setPending((prev) => ({ ...prev, logoUrl: upload.url }));
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleRemoveLogo = () => {
		if (branding.logoUrl === null) {
			// Remove from pending if same as saved
			setPending((prev) => {
				const { logoUrl: _, ...rest } = prev;
				return rest;
			});
		} else {
			setPending((prev) => ({ ...prev, logoUrl: null }));
		}
	};

	const handleGenerateThemes = async () => {
		if (!currentLogoUrl || !isValidColor) return;
		if (branding.generationCount >= 3) return;

		setIsGenerating(true);
		try {
			await globalActions.generateAIThemes(currentLogoUrl, currentPrimaryColor);
		} catch (error) {
			console.error('Failed to generate themes:', error);
			alert(error instanceof Error ? error.message : 'Failed to generate themes');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleApplyTheme = async (theme: {
		primaryColor: string;
		secondaryColor: string;
		accentColor: string;
		backgroundColor: string;
		gradientColor: string;
		textColor: string;
	}) => {
		await globalActions.applyTheme(theme);
		setColorInput(theme.primaryColor);
		// Clear only color-related pending changes, preserve logo
		setPending((prev) => {
			const { primaryColor: _, ...rest } = prev;
			return rest;
		});
	};

	const isValidColor = /^#[0-9A-Fa-f]{6}$/.test(colorInput);
	const canGenerate = !!currentLogoUrl && isValidColor && branding.generationCount < 3;

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="text-lg font-semibold">{config.brandingSection}</h2>

			{/* Logo */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					{config.logoLabel}
				</label>
				<div className="flex items-center gap-4">
					{currentLogoUrl ? (
						<div className="relative">
							<img
								src={currentLogoUrl}
								alt="Logo"
								className="h-16 w-auto rounded-lg border border-slate-200 object-contain"
							/>
							<button
								type="button"
								onClick={handleRemoveLogo}
								className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
							>
								<X className="size-3" />
							</button>
						</div>
					) : (
						<div className="flex h-16 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
							<ImagePlus className="size-6 text-slate-400" />
						</div>
					)}
					<div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleLogoUpload}
							className="hidden"
							id="logo-upload"
						/>
						<label
							htmlFor="logo-upload"
							className={cn(
								'km-btn-secondary cursor-pointer',
								isUploading && 'opacity-50'
							)}
						>
							{isUploading ? config.loading : config.uploadLogoButton}
						</label>
					</div>
				</div>
			</div>

			{/* Primary Color */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					{config.primaryColorLabel}
				</label>
				<div className="flex items-center gap-3">
					<input
						type="text"
						value={colorInput}
						onChange={handleColorChange}
						placeholder={config.primaryColorPlaceholder}
						className={cn(
							'km-input max-w-40',
							!isValidColor && colorInput && 'border-red-500'
						)}
					/>
					<div
						className="size-10 rounded-lg border border-slate-300"
						style={{
							backgroundColor: isValidColor ? colorInput : currentPrimaryColor
						}}
					/>
				</div>
			</div>

			{/* AI Theme Generator */}
			<div className="space-y-3 border-t border-slate-200 pt-4">
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium text-slate-700">
						AI Theme Generator
					</label>
					{branding.generationCount > 0 && (
						<span className="text-xs text-slate-500">
							{branding.generationCount}/3 generations
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={handleGenerateThemes}
					disabled={!canGenerate || isGenerating}
					className={cn(
						'km-btn-secondary w-full',
						isGenerating && 'opacity-75'
					)}
				>
					<Sparkles className="size-5" />
					{isGenerating
						? config.generatingTheme
						: branding.generationCount >= 3
							? config.maxGenerationsReached
							: config.generateThemeButton}
				</button>

				{/* Theme Options */}
				{branding.generatedThemes.length > 0 && (
					<div className="grid gap-2">
						{/* Default Theme */}
						<button
							type="button"
							onClick={() =>
								handleApplyTheme({
									primaryColor: config.defaultPrimaryColor,
									secondaryColor: config.defaultSecondaryColor,
									accentColor: config.defaultAccentColor,
									backgroundColor: config.defaultBackgroundColor,
								gradientColor: config.defaultGradientColor,
								textColor: config.defaultTextColor
								})
							}
							className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
						>
							<div className="flex flex-1 items-center gap-2">
								<span className="text-sm font-medium">
									{config.defaultThemeLabel}
								</span>
								{branding.primaryColor === config.defaultPrimaryColor &&
								branding.secondaryColor === config.defaultSecondaryColor &&
								branding.accentColor === config.defaultAccentColor &&
								branding.backgroundColor === config.defaultBackgroundColor &&
								branding.gradientColor === config.defaultGradientColor &&
								branding.textColor === config.defaultTextColor && (
										<span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
											{config.currentThemeLabel}
										</span>
									)}
							</div>
							<div className="flex gap-1">
								<div
									className="size-6 rounded border border-slate-300"
									style={{ backgroundColor: config.defaultPrimaryColor }}
								/>
								<div
									className="size-6 rounded border border-slate-300"
									style={{ backgroundColor: config.defaultSecondaryColor }}
								/>
								<div
									className="size-6 rounded border border-slate-300"
									style={{ backgroundColor: config.defaultAccentColor }}
								/>
								<div
									className="size-6 rounded border border-slate-300"
									style={{ backgroundColor: config.defaultBackgroundColor }}
								/>
								<div
									className="size-6 rounded border border-slate-300"
									style={{ backgroundColor: config.defaultGradientColor }}
								/>
							</div>
						</button>

						{/* AI Generated Themes */}
						{branding.generatedThemes.map((theme) => (
							<button
								key={theme.id}
								type="button"
								onClick={() => handleApplyTheme(theme)}
								className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
							>
								<div className="flex flex-1 items-center gap-2">
									<span className="text-sm font-medium">{theme.name}</span>
									{branding.primaryColor === theme.primaryColor &&
									branding.secondaryColor === theme.secondaryColor &&
									branding.accentColor === theme.accentColor &&
									branding.backgroundColor === theme.backgroundColor &&
									branding.gradientColor === theme.gradientColor &&
									branding.textColor === theme.textColor && (
											<span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
												{config.currentThemeLabel}
											</span>
										)}
								</div>
								<div className="flex gap-1">
									<div
										className="size-6 rounded border border-slate-300"
										style={{ backgroundColor: theme.primaryColor }}
									/>
									<div
										className="size-6 rounded border border-slate-300"
										style={{ backgroundColor: theme.secondaryColor }}
									/>
									<div
										className="size-6 rounded border border-slate-300"
										style={{ backgroundColor: theme.accentColor }}
									/>
									<div
										className="size-6 rounded border border-slate-300"
										style={{ backgroundColor: theme.backgroundColor }}
									/>
									<div
										className="size-6 rounded border border-slate-300"
										style={{ backgroundColor: theme.gradientColor }}
									/>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
