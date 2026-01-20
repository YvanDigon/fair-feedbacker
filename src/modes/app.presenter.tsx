import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { PresenterCarouselView } from '@/views/presenter-carousel-view';
import { useSnapshot } from '@kokimoki/app';
import { KmQrCode } from '@kokimoki/shared';
import * as React from 'react';

const App: React.FC = () => {
	const { title } = config;
	const { isPublished, branding } = useSnapshot(globalStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	if (kmClient.clientContext.mode !== 'presenter') {
		throw new Error('App presenter rendered in non-presenter mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	return (
		<HostPresenterLayout.Root>
			<HostPresenterLayout.Header>
				{branding.logoUrl && (
					<img
						src={branding.logoUrl}
						alt="Event logo"
						className="h-10 w-auto"
					/>
				)}
			</HostPresenterLayout.Header>

			<HostPresenterLayout.Main className="h-full p-0">
				{isPublished ? (
					<div className="flex h-full w-full">
						{/* Carousel */}
						<div className="flex-1">
							<PresenterCarouselView />
						</div>

						{/* QR Code sidebar */}
						<div
							className="flex w-80 flex-col items-center justify-center gap-4 border-l p-8"
							style={{ borderColor: `${branding.primaryColor}20` }}
						>
							<h3
								className="text-center text-xl font-semibold"
								style={{ color: branding.primaryColor }}
							>
								{config.presenterTitle}
							</h3>
							<KmQrCode data={playerLink} size={200} />
						</div>
					</div>
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-8">
						<h2 className="text-2xl font-semibold text-slate-600">
							{config.eventNotAvailable}
						</h2>
						<div className="opacity-50">
							<KmQrCode data={playerLink} size={200} />
						</div>
					</div>
				)}
			</HostPresenterLayout.Main>
		</HostPresenterLayout.Root>
	);
};

export default App;
