import { config } from '@/config';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { CheckCircle, ChevronRight, Gift, ImageIcon } from 'lucide-react';
import * as React from 'react';
import Markdown from 'react-markdown';

export const PlayerIntroView: React.FC = () => {
	const { branding, introMessage, objects, isPublished, prizeEnabled } =
		useSnapshot(globalStore.proxy);
	const { completedObjectIds, hasSubmittedPrizeEmail } = useSnapshot(
		playerStore.proxy
	);

	const sortedObjects = Object.values(objects).sort(
		(a, b) => a.createdAt - b.createdAt
	);

	const isObjectCompleted = (objectId: string) => {
		return completedObjectIds.includes(objectId);
	};

	const availableObjects = sortedObjects.filter(
		(obj) => !isObjectCompleted(obj.id)
	);
	const completedObjectsList = sortedObjects.filter((obj) =>
		isObjectCompleted(obj.id)
	);

	// Show claim prize button if: prize enabled + user submitted email
	const showClaimPrizeButton = prizeEnabled && hasSubmittedPrizeEmail;

	const handleSelectObject = async (objectId: string) => {
		if (isObjectCompleted(objectId)) return;
		await playerActions.selectObject(objectId);
	};

	const handleClaimPrize = async () => {
		await playerActions.openPrizeClaim();
	};

	// Event not published
	if (!isPublished) {
		return (
			<div className="w-full text-center">
				<p className="text-lg theme-text-secondary">{config.eventNotAvailable}</p>
			</div>
		);
	}

	// All objects completed
	if (availableObjects.length === 0 && completedObjectsList.length > 0) {
		return (
			<div className="w-full space-y-8 text-center">
				{/* Claim Prize Button */}
				{showClaimPrizeButton && (
					<button
						type="button"
						onClick={handleClaimPrize}
						className="mx-auto flex items-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
						style={{ backgroundColor: branding.primaryColor }}
					>
						<Gift className="size-6" />
						{config.prizeClaimButton}
					</button>
				)}
				<div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
					<CheckCircle className="size-10 text-green-600" />
				</div>
				<p className="text-lg theme-text-secondary">{config.allObjectsCompleted}</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-8">
			{/* Claim Prize Button */}
			{showClaimPrizeButton && (
				<button
					type="button"
					onClick={handleClaimPrize}
					className="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
					style={{ backgroundColor: branding.primaryColor }}
				>
					<Gift className="size-6" />
					{config.prizeClaimButton}
				</button>
			)}

			{/* Branding */}
			<div className="text-center">
				{branding.logoUrl && (
					<img
						src={branding.logoUrl}
						alt="Event logo"
						className="mx-auto mb-4 h-16 w-auto"
					/>
				)}
				<h1
					className="text-2xl font-bold"
					style={{ color: branding.primaryColor }}
				>
					{config.playerIntroTitle}
				</h1>
			</div>

			{/* Intro message */}
			{introMessage && (
				<article className="prose mx-auto text-center">
					<Markdown>{introMessage}</Markdown>
				</article>
			)}

			{/* Object selection */}
			<div className="space-y-3">
				<p className="text-sm font-medium theme-text-secondary">
					{config.selectObjectLabel}
				</p>

				<div className="space-y-2">
					{/* Available objects */}
					{availableObjects.map((obj) => (
						<button
							key={obj.id}
							type="button"
							onClick={() => handleSelectObject(obj.id)}
								className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors theme-card-interactive"
							style={{
								borderColor: 'transparent',
								boxShadow: `0 0 0 2px ${branding.primaryColor}20`
							}}
						>
							{obj.thumbnailUrl ? (
								<img
									src={obj.thumbnailUrl}
									alt=""
									className="size-12 shrink-0 rounded-lg object-cover"
								/>
							) : (
								<div className="flex size-12 shrink-0 items-center justify-center rounded-lg theme-bg-surface-secondary">
									<ImageIcon className="size-6 theme-text-muted" />
								</div>
							)}
							<div className="flex-1">
								<h3 className="font-semibold">{obj.name}</h3>
								{obj.description && (
									<p className="text-sm theme-text-muted">{obj.description}</p>
								)}
							</div>
							<ChevronRight
								className="size-5 shrink-0"
								style={{ color: branding.primaryColor }}
							/>
						</button>
					))}

					{/* Completed objects */}
					{completedObjectsList.map((obj) => (
						<div
							key={obj.id}
							className={cn(
								'flex w-full items-center gap-3 rounded-xl border p-4 opacity-60 theme-bg-surface-secondary theme-border-light'
							)}
						>
							{obj.thumbnailUrl ? (
								<img
									src={obj.thumbnailUrl}
									alt=""
									className="size-12 shrink-0 rounded-lg object-cover grayscale"
								/>
							) : (
								<div className="flex size-12 shrink-0 items-center justify-center rounded-lg theme-bg-surface-tertiary">
									<ImageIcon className="size-6 theme-text-muted" />
								</div>
							)}
							<div className="flex-1">
								<h3 className="font-semibold">{obj.name}</h3>
								{obj.description && (
									<p className="text-sm theme-text-muted">{obj.description}</p>
								)}
							</div>
							<span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
								<CheckCircle className="size-3" />
								{config.completedLabel}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
