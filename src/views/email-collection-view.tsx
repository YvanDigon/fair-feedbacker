import { config } from '@/config';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ImageIcon } from 'lucide-react';
import * as React from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EmailCollectionView: React.FC = () => {
	const { prizeEmailCollection, branding } = useSnapshot(globalStore.proxy);
	const [name, setName] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [emailError, setEmailError] = React.useState('');
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate email
		if (!EMAIL_REGEX.test(email)) {
			setEmailError(config.prizeEmailInvalidEmail);
			return;
		}

		setEmailError('');
		setIsSubmitting(true);

		try {
			await playerActions.submitPrizeEmail(name.trim(), email.trim());
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = async () => {
		await playerActions.skipPrizeEmail();
	};

	const displayTitle = prizeEmailCollection.title || config.prizeEmailFormTitle;
	const displayMessage =
		prizeEmailCollection.message || config.prizeEmailFormMessage;

	return (
		<div className="flex w-full max-w-md flex-col items-center gap-6">
			{/* Image */}
			{prizeEmailCollection.imageUrl ? (
				<img
					src={prizeEmailCollection.imageUrl}
					alt="Prize"
					className="h-48 w-full rounded-xl object-cover shadow-md"
				/>
			) : (
				<div className="flex h-48 w-full items-center justify-center rounded-xl bg-slate-100">
					<ImageIcon className="size-16 text-slate-300" />
				</div>
			)}

			{/* Title */}
			<h1
				className="text-center text-2xl font-bold"
				style={{ color: branding.primaryColor }}
			>
				{displayTitle}
			</h1>

			{/* Message */}
			<p className="text-center text-slate-600">{displayMessage}</p>

			{/* Form */}
			<form onSubmit={handleSubmit} className="w-full space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium text-slate-700">
						{config.prizeEmailNameLabel}
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={config.prizeEmailNamePlaceholder}
						required
						className="km-input"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium text-slate-700">
						{config.prizeEmailAddressLabel}
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setEmailError('');
						}}
						placeholder={config.prizeEmailAddressPlaceholder}
						required
						className={cn('km-input', emailError && 'border-red-500')}
					/>
					{emailError && (
						<p className="text-sm text-red-500">{emailError}</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isSubmitting || !name.trim() || !email.trim()}
					className="km-btn-primary w-full"
				>
					{isSubmitting ? config.loading : config.prizeEmailSubmitButton}
				</button>
			</form>

			{/* Skip link */}
			<button
				type="button"
				onClick={handleSkip}
				className="text-slate-500 underline hover:text-slate-700"
			>
				{config.prizeEmailSkipLink}
			</button>
		</div>
	);
};
