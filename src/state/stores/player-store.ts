import { kmClient } from '@/services/km-client';

// Answer type that can hold any question type response
export type Answer = 
	| { type: 'single'; value: number | null }
	| { type: 'multiple'; value: number[] }
	| { type: 'open-ended'; value: string }
	| { type: 'rating'; value: number | null };

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
	currentAnswers: Record<string, Answer>;
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
