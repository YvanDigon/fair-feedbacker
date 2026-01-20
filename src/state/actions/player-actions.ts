import { kmClient } from '@/services/km-client';
import { globalActions } from './global-actions';
import { globalStore } from '../stores/global-store';
import { playerStore, type PlayerState } from '../stores/player-store';

// Generate or get session ID from localStorage
function getOrCreateSessionId(): string {
	const STORAGE_KEY = 'feedbacker_session_id';
	let sessionId = localStorage.getItem(STORAGE_KEY);
	if (!sessionId) {
		sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
		localStorage.setItem(STORAGE_KEY, sessionId);
	}
	return sessionId;
}

// Load completed objects from localStorage
function loadCompletedObjects(): string[] {
	const STORAGE_KEY = 'feedbacker_completed_objects';
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

// Save completed objects to localStorage
function saveCompletedObjects(objectIds: string[]): void {
	const STORAGE_KEY = 'feedbacker_completed_objects';
	localStorage.setItem(STORAGE_KEY, JSON.stringify(objectIds));
}

// Load prize email submission status from localStorage
function loadHasSubmittedPrizeEmail(): boolean {
	const STORAGE_KEY = 'feedbacker_prize_email_submitted';
	return localStorage.getItem(STORAGE_KEY) === 'true';
}

// Save prize email submission status to localStorage
function saveHasSubmittedPrizeEmail(submitted: boolean): void {
	const STORAGE_KEY = 'feedbacker_prize_email_submitted';
	localStorage.setItem(STORAGE_KEY, submitted ? 'true' : 'false');
}

export const playerActions = {
	async setCurrentView(view: PlayerState['currentView']) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentView = view;
		});
	},

	async setPlayerName(name: string) {
		await kmClient.transact(
			[playerStore, globalStore],
			([playerState, globalState]) => {
				playerState.name = name;
				globalState.players[kmClient.id] = { name };
			}
		);
	},

	async initSession() {
		const sessionId = getOrCreateSessionId();
		const completedObjectIds = loadCompletedObjects();
		const hasSubmittedPrizeEmail = loadHasSubmittedPrizeEmail();
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.sessionId = sessionId;
			playerState.completedObjectIds = completedObjectIds;
			playerState.hasSubmittedPrizeEmail = hasSubmittedPrizeEmail;
		});
		return sessionId;
	},

	async selectObject(objectId: string) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.selectedObjectId = objectId;
			playerState.currentView = 'object-questions';
			playerState.currentAnswers = {};
		});
	},

	async setAnswer(questionId: string, optionIndex: number | null) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentAnswers[questionId] = optionIndex;
		});
	},

	async finishObject() {
		const state = playerStore.proxy;
		const globalState = globalStore.proxy;
		const sessionId = state.sessionId;
		const objectId = state.selectedObjectId;
		const answers = { ...state.currentAnswers };
		const prizeEnabled = globalState.prizeEnabled;
		const hasSubmittedPrizeEmail = state.hasSubmittedPrizeEmail;

		if (!sessionId || !objectId) return;

		// Submit responses to global store (for statistics)
		await globalActions.submitResponses(sessionId, objectId, answers);

		// Determine next view
		// Show email collection if: prize enabled + hasn't submitted email yet
		const shouldShowEmailCollection =
			prizeEnabled && !hasSubmittedPrizeEmail;

		// Mark object as completed locally
		await kmClient.transact([playerStore], ([playerState]) => {
			if (!playerState.completedObjectIds.includes(objectId)) {
				playerState.completedObjectIds.push(objectId);
			}
			playerState.selectedObjectId = null;
			playerState.currentView = shouldShowEmailCollection
				? 'email-collection'
				: 'intro';
			playerState.currentAnswers = {};
		});

		// Persist to localStorage
		saveCompletedObjects(playerStore.proxy.completedObjectIds);
	},

	async cancelObject() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.selectedObjectId = null;
			playerState.currentView = 'intro';
			playerState.currentAnswers = {};
		});
	},

	isObjectCompleted(objectId: string): boolean {
		return playerStore.proxy.completedObjectIds.includes(objectId);
	},

	async submitPrizeEmail(name: string, email: string) {
		const sessionId = playerStore.proxy.sessionId;
		if (!sessionId) return;

		// Submit to global store
		await globalActions.submitPrizeEmail(sessionId, name, email);

		// Mark as submitted locally
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.hasSubmittedPrizeEmail = true;
			playerState.currentView = 'intro';
		});

		// Persist to localStorage
		saveHasSubmittedPrizeEmail(true);
	},

	async skipPrizeEmail() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentView = 'intro';
		});
	},

	async openPrizeClaim() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentView = 'prize-claim';
		});
	},

	async closePrizeClaim() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentView = 'intro';
		});
	}
};
