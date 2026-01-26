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
			{/* Host uses fixed admin styling, not themed */}
			<div className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
				{/* Header */}
				<header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-xs">
					<div className="container mx-auto flex items-center justify-between p-4" />
				</header>

				{/* Main */}
				<main className="container mx-auto flex items-start px-4 py-8">
					<div className="w-full max-w-4xl space-y-6">
						<h1 className="text-2xl font-bold text-slate-900">{config.hostTitle}</h1>

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
				</main>

				{/* Footer */}
				<footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur-xs">
					<div className="container mx-auto flex items-center justify-between p-4">
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
					</div>
				</footer>
			</div>
		</SettingsProvider>
	);
};

export default App;
