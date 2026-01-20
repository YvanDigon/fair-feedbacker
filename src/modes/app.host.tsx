import { BrandingEditor } from '@/components/host/branding-editor';
import { CarouselSettings } from '@/components/host/carousel-settings';
import { IntroMessageEditor } from '@/components/host/intro-message-editor';
import { ObjectsEditor } from '@/components/host/objects-editor';
import { PrizeSettings } from '@/components/host/prize-settings';
import { PublishControl } from '@/components/host/publish-control';
import { SettingsProvider } from '@/components/host/settings-context';
import { StatsDashboard } from '@/components/host/stats-dashboard';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { SquareArrowOutUpRight } from 'lucide-react';
import * as React from 'react';

const App: React.FC = () => {
	useGlobalController();
	useDocumentTitle(config.hostTitle);

	if (kmClient.clientContext.mode !== 'host') {
		throw new Error('App host rendered in non-host mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	const presenterLink = generateLink(kmClient.clientContext.presenterCode, {
		mode: 'presenter',
		playerCode: kmClient.clientContext.playerCode
	});

	return (
		<SettingsProvider>
			<HostPresenterLayout.Root>
				<HostPresenterLayout.Header />
				<HostPresenterLayout.Main className="items-start py-8">
					<div className="w-full max-w-4xl space-y-6">
						<h1 className="text-2xl font-bold">{config.hostTitle}</h1>

						<div className="grid gap-6 lg:grid-cols-2">
							<div className="space-y-6">
								<BrandingEditor />
								<IntroMessageEditor />
								<CarouselSettings />
								<PrizeSettings />
								<PublishControl />
							</div>
							<div className="space-y-6">
								<ObjectsEditor />
							</div>
						</div>

						<StatsDashboard />
					</div>
				</HostPresenterLayout.Main>

				<HostPresenterLayout.Footer>
					<div className="inline-flex flex-wrap gap-4">
						<a
							href={playerLink}
							target="_blank"
							rel="noreferrer"
							className="km-btn-secondary"
						>
							{config.playerLinkLabel}
							<SquareArrowOutUpRight className="size-5" />
						</a>

						<a
							href={presenterLink}
							target="_blank"
							rel="noreferrer"
							className="km-btn-secondary"
						>
							{config.presenterLinkLabel}
							<SquareArrowOutUpRight className="size-5" />
						</a>
					</div>
				</HostPresenterLayout.Footer>
			</HostPresenterLayout.Root>
		</SettingsProvider>
	);
};

export default App;
