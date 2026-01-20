import { kmClient } from '@/services/km-client';
import type { FeedbackObject, PrizePageSettings, Question, ValidationError } from '@/types/feedbacker';
import { globalStore } from '../stores/global-store';

export const globalActions = {
	// Branding actions
	async updateBranding(logoUrl: string | null, primaryColor: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.branding.logoUrl = logoUrl;
			globalState.branding.primaryColor = primaryColor;
		});
	},

	async updateIntroMessage(message: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.introMessage = message;
		});
	},

	async updateCarouselInterval(seconds: number) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.carouselIntervalSeconds = Math.max(1, seconds);
		});
	},

	// Object actions
	async addObject(name: string, description: string, thumbnailUrl: string | null) {
		const id = kmClient.serverTimestamp().toString();
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.objects[id] = {
				id,
				name,
				description,
				thumbnailUrl,
				createdAt: kmClient.serverTimestamp()
			};
		});
		return id;
	},

	async updateObject(objectId: string, updates: Partial<Omit<FeedbackObject, 'id' | 'createdAt'>>) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const obj = globalState.objects[objectId];
			if (obj) {
				if (updates.name !== undefined) obj.name = updates.name;
				if (updates.description !== undefined) obj.description = updates.description;
				if (updates.thumbnailUrl !== undefined) obj.thumbnailUrl = updates.thumbnailUrl;
			}
		});
	},

	async deleteObject(objectId: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Delete the object
			delete globalState.objects[objectId];
			// Delete all questions for this object
			Object.keys(globalState.questions).forEach((qId) => {
				if (globalState.questions[qId].objectId === objectId) {
					delete globalState.questions[qId];
				}
			});
			// Delete all responses for this object
			Object.keys(globalState.responses).forEach((rId) => {
				if (globalState.responses[rId].objectId === objectId) {
					delete globalState.responses[rId];
				}
			});
		});
	},

	// Question actions
	async addQuestion(objectId: string, text: string, imageUrl: string, options: string[]) {
		const id = kmClient.serverTimestamp().toString();
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.questions[id] = {
				id,
				objectId,
				text,
				imageUrl,
				options,
				createdAt: kmClient.serverTimestamp()
			};
		});
		return id;
	},

	async updateQuestion(questionId: string, updates: Partial<Omit<Question, 'id' | 'objectId' | 'createdAt'>>) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const q = globalState.questions[questionId];
			if (q) {
				if (updates.text !== undefined) q.text = updates.text;
				if (updates.imageUrl !== undefined) q.imageUrl = updates.imageUrl;
				if (updates.options !== undefined) q.options = updates.options;
			}
		});
	},

	async deleteQuestion(questionId: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			delete globalState.questions[questionId];
			// Delete all responses for this question
			Object.keys(globalState.responses).forEach((rId) => {
				if (globalState.responses[rId].questionId === questionId) {
					delete globalState.responses[rId];
				}
			});
		});
	},

	// Validation
	validateEvent(): ValidationError[] {
		const state = globalStore.proxy;
		const errors: ValidationError[] = [];

		// Check primary color
		if (!state.branding.primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(state.branding.primaryColor)) {
			errors.push({ field: 'primaryColor', message: 'Primary color must be a valid hex code (e.g., #3b82f6)' });
		}

		// Check intro message
		if (!state.introMessage.trim()) {
			errors.push({ field: 'introMessage', message: 'Intro message cannot be empty' });
		}

		// Check objects
		const objectIds = Object.keys(state.objects);
		if (objectIds.length === 0) {
			errors.push({ field: 'objects', message: 'At least one object is required' });
		}

		// Check each object has questions
		objectIds.forEach((objId) => {
			const obj = state.objects[objId];
			const objQuestions = Object.values(state.questions).filter((q) => q.objectId === objId);

			if (objQuestions.length === 0) {
				errors.push({ field: `object_${objId}`, message: `Object "${obj.name}" must have at least one question` });
			}

			objQuestions.forEach((q) => {
				if (q.options.length < 2) {
					errors.push({ field: `question_${q.id}`, message: `Question "${q.text}" must have at least 2 options` });
				}
				if (!q.imageUrl) {
					errors.push({ field: `question_${q.id}_image`, message: `Question "${q.text}" must have an image` });
				}
			});
		});

		return errors;
	},

	// Publish/Unpublish
	async publishEvent() {
		const errors = globalActions.validateEvent();
		if (errors.length > 0) {
			throw new Error(errors.map((e) => e.message).join(', '));
		}
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.isPublished = true;
		});
	},

	async unpublishEvent() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.isPublished = false;
		});
	},

	// Response actions (called by player)
	async submitResponses(
		sessionId: string,
		objectId: string,
		answers: Record<string, number | null>
	) {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Save each answer as a response
			Object.entries(answers).forEach(([questionId, selectedOptionIndex]) => {
				const responseId = `${sessionId}_${questionId}`;
				globalState.responses[responseId] = {
					id: responseId,
					sessionId,
					questionId,
					objectId,
					selectedOptionIndex,
					timestamp: kmClient.serverTimestamp()
				};
			});

			// Mark object as completed for this session
			const completedKey = `${sessionId}_${objectId}`;
			globalState.completedObjects[completedKey] = {
				sessionId,
				objectId,
				timestamp: kmClient.serverTimestamp()
			};
		});
	},

	// Reset all responses (for host)
	async resetResponses() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.responses = {};
			globalState.completedObjects = {};
		});
	},

	// Prize feature actions
	async togglePrizeFeature(enabled: boolean) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.prizeEnabled = enabled;
		});
	},

	async updatePrizeEmailCollection(settings: Partial<PrizePageSettings>) {
		await kmClient.transact([globalStore], ([globalState]) => {
			if (settings.title !== undefined)
				globalState.prizeEmailCollection.title = settings.title;
			if (settings.imageUrl !== undefined)
				globalState.prizeEmailCollection.imageUrl = settings.imageUrl;
			if (settings.message !== undefined)
				globalState.prizeEmailCollection.message = settings.message;
		});
	},

	async updatePrizeClaim(settings: Partial<PrizePageSettings>) {
		await kmClient.transact([globalStore], ([globalState]) => {
			if (settings.title !== undefined)
				globalState.prizeClaim.title = settings.title;
			if (settings.imageUrl !== undefined)
				globalState.prizeClaim.imageUrl = settings.imageUrl;
			if (settings.message !== undefined)
				globalState.prizeClaim.message = settings.message;
		});
	},

	async submitPrizeEmail(sessionId: string, name: string, email: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.prizeSubmissions[sessionId] = {
				sessionId,
				name,
				email,
				timestamp: kmClient.serverTimestamp()
			};
		});
	},

	async clearPrizeSubmissions() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.prizeSubmissions = {};
		});
	}
};
