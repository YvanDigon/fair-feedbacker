import { kmClient } from '@/services/km-client';

export interface PlayerState {
	name: string;
	currentView:
		| 'intro'
		| 'object-questions'
		| 'email-collection'
		| 'prize-claim'
		| 'lobby'
		| 'shared-state'
		| 'connections';
	selectedObjectId: string | null;
	sessionId: string;
	// Current answers for the selected object (keyed by questionId)
	currentAnswers: Record<string, number | null>;
	// Track which objects this player has completed (local to this device)
	completedObjectIds: string[];
	// Prize email submission tracking (local to this device)
	hasSubmittedPrizeEmail: boolean;
}

const initialState: PlayerState = {
	name: '',
	currentView: 'intro',
	selectedObjectId: null,
	sessionId: '',
	currentAnswers: {},
	completedObjectIds: [],
	hasSubmittedPrizeEmail: false
};

export const playerStore = kmClient.localStore<PlayerState>(
	'player',
	initialState
);
