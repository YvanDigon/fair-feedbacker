import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ImagePlus, X } from 'lucide-react';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const BrandingEditor: React.FC = () => {
	const { branding } = useSnapshot(globalStore.proxy);
	const { pending, setPending } = useSettingsContext();
	const [colorInput, setColorInput] = React.useState(branding.primaryColor);
	const [isUploading, setIsUploading] = React.useState(false);
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

	const isValidColor = /^#[0-9A-Fa-f]{6}$/.test(colorInput);

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
		</div>
	);
};
