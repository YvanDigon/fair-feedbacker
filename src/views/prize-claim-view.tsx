import { config } from '@/config';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { useSnapshot } from '@kokimoki/app';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import * as React from 'react';
import Markdown from 'react-markdown';

export const PrizeClaimView: React.FC = () => {
	const { prizeClaim, branding } = useSnapshot(globalStore.proxy);

	const handleBack = async () => {
		await playerActions.closePrizeClaim();
	};

	const displayTitle = prizeClaim.title || config.prizeClaimTitlePlaceholder;
	const displayMessage = prizeClaim.message || '';

	return (
		<div className="flex w-full max-w-md flex-col items-center gap-6">
			{/* Back button */}
			<button
				type="button"
				onClick={handleBack}
				className="flex items-center gap-2 self-start opacity-70 hover:opacity-100"
				style={{ color: 'var(--theme-text-secondary)' }}
			>
				<ArrowLeft className="size-5" />
				{config.prizeClaimBackButton}
			</button>

			{/* Image */}
			{prizeClaim.imageUrl ? (
				<img
					src={prizeClaim.imageUrl}
					alt="Prize"
					className="h-64 w-64 rounded-xl object-contain shadow-md"
				/>
			) : (
				<div className="flex h-64 w-64 items-center justify-center rounded-xl theme-bg-surface-secondary">
					<ImageIcon className="size-20 theme-text-muted" />
				</div>
			)}

			{/* Title */}
			<h1
				className="text-center text-3xl font-bold"
				style={{ color: branding.primaryColor }}
			>
				{displayTitle}
			</h1>

			{/* Message */}
			{displayMessage && (
				<div className="prose w-full max-w-none text-center">
					<Markdown>{displayMessage}</Markdown>
				</div>
			)}
		</div>
	);
};
