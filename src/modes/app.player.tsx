import { withKmProviders } from '@/components/with-km-providers';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { PlayerLayout } from '@/layouts/player';
import { playerActions } from '@/state/actions/player-actions';
import { playerStore } from '@/state/stores/player-store';
import { ObjectQuestionsView } from '@/views/object-questions-view';
import { PlayerIntroView } from '@/views/player-intro-view';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

const App: React.FC = () => {
	const { title } = config;
	const { currentView, sessionId } = useSnapshot(playerStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	// Initialize session on mount
	React.useEffect(() => {
		if (!sessionId) {
			playerActions.initSession();
		}
	}, [sessionId]);

	return (
		<PlayerLayout.Root>
			<PlayerLayout.Main>
				{currentView === 'intro' && <PlayerIntroView />}
				{currentView === 'object-questions' && <ObjectQuestionsView />}
			</PlayerLayout.Main>
		</PlayerLayout.Root>
	);
};

export default withKmProviders(App);
