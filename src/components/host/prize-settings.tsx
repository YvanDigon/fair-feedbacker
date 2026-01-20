import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ImagePlus, Mail, Trash2, X } from 'lucide-react';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const PrizeSettings: React.FC = () => {
	const {
		prizeEnabled,
		prizeEmailCollection,
		prizeClaim,
		prizeSubmissions
	} = useSnapshot(globalStore.proxy);

	const { pending, setPending } = useSettingsContext();

	const [isUploadingEmailImage, setIsUploadingEmailImage] =
		React.useState(false);
	const [isUploadingClaimImage, setIsUploadingClaimImage] =
		React.useState(false);
	const emailImageInputRef = React.useRef<HTMLInputElement>(null);
	const claimImageInputRef = React.useRef<HTMLInputElement>(null);

	// Get current values (pending or stored)
	const currentPrizeEnabled = pending.prizeEnabled ?? prizeEnabled;
	const currentEmailTitle =
		pending.prizeEmailCollection?.title ?? prizeEmailCollection.title;
	const currentEmailMessage =
		pending.prizeEmailCollection?.message ?? prizeEmailCollection.message;
	const currentClaimTitle = pending.prizeClaim?.title ?? prizeClaim.title;
	const currentClaimMessage = pending.prizeClaim?.message ?? prizeClaim.message;

	const handleToggle = async () => {
		const newValue = !currentPrizeEnabled;
		// Save immediately to global store
		await globalActions.togglePrizeFeature(newValue);
		// Also update pending to keep UI in sync
		setPending((prev) => ({ ...prev, prizeEnabled: newValue }));
	};

	// Email Collection Page handlers
	const handleEmailTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPending((prev) => ({
			...prev,
			prizeEmailCollection: {
				...(prev.prizeEmailCollection || {}),
				title: e.target.value
			}
		}));
	};

	const handleEmailMessageChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setPending((prev) => ({
			...prev,
			prizeEmailCollection: {
				...(prev.prizeEmailCollection || {}),
				message: e.target.value
			}
		}));
	};

	const handleEmailImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingEmailImage(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, [
				'prize-email'
			]);
			await globalActions.updatePrizeEmailCollection({ imageUrl: upload.url });
		} finally {
			setIsUploadingEmailImage(false);
			if (emailImageInputRef.current) {
				emailImageInputRef.current.value = '';
			}
		}
	};

	const handleRemoveEmailImage = async () => {
		await globalActions.updatePrizeEmailCollection({ imageUrl: null });
	};

	// Prize Claim Page handlers
	const handleClaimTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPending((prev) => ({
			...prev,
			prizeClaim: {
				...(prev.prizeClaim || {}),
				title: e.target.value
			}
		}));
	};

	const handleClaimMessageChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setPending((prev) => ({
			...prev,
			prizeClaim: {
				...(prev.prizeClaim || {}),
				message: e.target.value
			}
		}));
	};

	const handleClaimImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingClaimImage(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, [
				'prize-claim'
			]);
			await globalActions.updatePrizeClaim({ imageUrl: upload.url });
		} finally {
			setIsUploadingClaimImage(false);
			if (claimImageInputRef.current) {
				claimImageInputRef.current.value = '';
			}
		}
	};

	const handleRemoveClaimImage = async () => {
		await globalActions.updatePrizeClaim({ imageUrl: null });
	};

	// Submissions
	const submissions = Object.values(prizeSubmissions).sort(
		(a, b) => b.timestamp - a.timestamp
	);

	const handleClearSubmissions = async () => {
		if (confirm(config.prizeSubmissionsClearConfirm)) {
			await globalActions.clearPrizeSubmissions();
		}
	};

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">{config.prizeSection}</h2>
				<label className="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={currentPrizeEnabled}
						onChange={handleToggle}
						className="size-5 rounded accent-green-500"
					/>
					<span className="text-sm">{config.prizeEnableLabel}</span>
				</label>
			</div>

			{currentPrizeEnabled && (
				<div className="space-y-6 border-t border-slate-200 pt-4">
					{/* Email Collection Page Settings */}
					<div className="space-y-3">
						<h3 className="font-medium text-slate-700">
							{config.prizeEmailCollectionSection}
						</h3>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeEmailTitleLabel}
							</label>
							<input
								type="text"
								value={currentEmailTitle}
								onChange={handleEmailTitleChange}
								placeholder={config.prizeEmailTitlePlaceholder}
								className="km-input"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeEmailMessageLabel}
							</label>
							<textarea
								value={currentEmailMessage}
								onChange={handleEmailMessageChange}
								placeholder={config.prizeEmailMessagePlaceholder}
								rows={2}
								className="km-input max-w-full resize-none"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeEmailImageLabel}
							</label>
							<div className="flex items-center gap-3">
								{prizeEmailCollection.imageUrl ? (
									<div className="relative">
										<img
											src={prizeEmailCollection.imageUrl}
											alt="Prize"
											className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
										/>
										<button
											type="button"
											onClick={handleRemoveEmailImage}
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
										ref={emailImageInputRef}
										type="file"
										accept="image/*"
										onChange={handleEmailImageUpload}
										className="hidden"
										id="prize-email-image-upload"
									/>
									<label
										htmlFor="prize-email-image-upload"
										className={cn(
											'km-btn-secondary cursor-pointer text-sm',
											isUploadingEmailImage && 'opacity-50'
										)}
									>
										{isUploadingEmailImage
											? config.loading
											: config.uploadImageButton}
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* Prize Claim Page Settings */}
					<div className="space-y-3 border-t border-slate-200 pt-4">
						<h3 className="font-medium text-slate-700">
							{config.prizeClaimSection}
						</h3>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeClaimTitleLabel}
							</label>
							<input
								type="text"
								value={currentClaimTitle}
								onChange={handleClaimTitleChange}
								placeholder={config.prizeClaimTitlePlaceholder}
								className="km-input"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeClaimMessageLabel}
							</label>
							<textarea
								value={currentClaimMessage}
								onChange={handleClaimMessageChange}
								placeholder={config.prizeClaimMessagePlaceholder}
								rows={3}
								className="km-input max-w-full resize-none"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-600">
								{config.prizeClaimImageLabel}
							</label>
							<div className="flex items-center gap-3">
								{prizeClaim.imageUrl ? (
									<div className="relative">
										<img
											src={prizeClaim.imageUrl}
											alt="Claim"
											className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
										/>
										<button
											type="button"
											onClick={handleRemoveClaimImage}
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
										ref={claimImageInputRef}
										type="file"
										accept="image/*"
										onChange={handleClaimImageUpload}
										className="hidden"
										id="prize-claim-image-upload"
									/>
									<label
										htmlFor="prize-claim-image-upload"
										className={cn(
											'km-btn-secondary cursor-pointer text-sm',
											isUploadingClaimImage && 'opacity-50'
										)}
									>
										{isUploadingClaimImage
											? config.loading
											: config.uploadImageButton}
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* Email Submissions */}
					<div className="space-y-3 border-t border-slate-200 pt-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-slate-700">
								{config.prizeSubmissionsSection}
							</h3>
							{submissions.length > 0 && (
								<button
									type="button"
									onClick={handleClearSubmissions}
									className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
								>
									<Trash2 className="size-4" />
									{config.prizeSubmissionsClearButton}
								</button>
							)}
						</div>

						{submissions.length === 0 ? (
							<p className="text-sm text-slate-500">
								{config.prizeSubmissionsEmpty}
							</p>
						) : (
							<div className="max-h-64 space-y-2 overflow-y-auto">
								{submissions.map((sub) => (
									<div
										key={sub.sessionId}
										className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
									>
										<Mail className="size-4 shrink-0 text-slate-400" />
										<div className="flex-1 text-sm">
											<p className="font-medium text-slate-700">{sub.name}</p>
											<p className="text-slate-500">{sub.email}</p>
										</div>
										<span className="text-xs text-slate-400">
											{new Date(sub.timestamp).toLocaleTimeString()}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
