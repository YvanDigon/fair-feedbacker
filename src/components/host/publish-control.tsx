import { config } from '@/config';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import type { ValidationError } from '@/types/feedbacker';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const PublishControl: React.FC = () => {
	const { isPublished, branding } = useSnapshot(globalStore.proxy);
	const { pending, hasPendingChanges, clearPending } = useSettingsContext();
	const [errors, setErrors] = React.useState<ValidationError[]>([]);
	const [isSaving, setIsSaving] = React.useState(false);
	const [publishError, setPublishError] = React.useState<string | null>(null);

	const handleSaveChanges = async () => {
		setIsSaving(true);
		try {
			// Save branding changes
			if (pending.logoUrl !== undefined || pending.primaryColor !== undefined) {
				const newLogoUrl =
					pending.logoUrl !== undefined ? pending.logoUrl : branding.logoUrl;
				const newPrimaryColor =
					pending.primaryColor !== undefined
						? pending.primaryColor
						: branding.primaryColor;
				await globalActions.updateBranding(newLogoUrl, newPrimaryColor);
			}

			// Save intro message
			if (pending.introMessage !== undefined) {
				await globalActions.updateIntroMessage(pending.introMessage);
			}

			// Save carousel interval
			if (pending.carouselIntervalSeconds !== undefined) {
				await globalActions.updateCarouselInterval(
					pending.carouselIntervalSeconds
				);
			}

			clearPending();
			setErrors([]);
		} finally {
			setIsSaving(false);
		}
	};

	const handlePublish = async () => {
		setPublishError(null);
		// Save any pending changes first
		if (hasPendingChanges) {
			await handleSaveChanges();
		}
		try {
			await globalActions.publishEvent();
			setErrors([]);
		} catch (error) {
			setPublishError(
				error instanceof Error ? error.message : 'Failed to publish'
			);
		}
	};

	const handleUnpublish = async () => {
		await globalActions.unpublishEvent();
	};

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="text-lg font-semibold">{config.publishSection}</h2>

			{/* Status */}
			<div
				className={cn(
					'flex items-center gap-2 rounded-lg p-3',
					isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
				)}
			>
				{isPublished ? (
					<>
						<CheckCircle className="size-5" />
						<span className="font-medium">{config.eventPublished}</span>
					</>
				) : (
					<>
						<AlertCircle className="size-5" />
						<span className="font-medium">{config.eventNotPublished}</span>
					</>
				)}
			</div>

			{/* Errors */}
			{errors.length > 0 && (
				<div className="space-y-2 rounded-lg bg-red-50 p-3">
					<p className="flex items-center gap-2 font-medium text-red-800">
						<XCircle className="size-5" />
						{config.validationErrors}
					</p>
					<ul className="ml-7 list-disc space-y-1 text-sm text-red-700">
						{errors.map((error, i) => (
							<li key={i}>{error.message}</li>
						))}
					</ul>
				</div>
			)}

			{publishError && (
				<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
					{publishError}
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleSaveChanges}
					disabled={!hasPendingChanges || isSaving}
					className={cn(
						'km-btn-secondary',
						hasPendingChanges && 'km-btn-primary'
					)}
				>
					{isSaving ? config.loading : config.validateButton}
				</button>

				{isPublished ? (
					<button
						type="button"
						onClick={handleUnpublish}
						className="km-btn-error"
					>
						{config.unpublishButton}
					</button>
				) : (
					<button
						type="button"
						onClick={handlePublish}
						className="km-btn-primary"
					>
						{config.publishButton}
					</button>
				)}
			</div>
		</div>
	);
};
