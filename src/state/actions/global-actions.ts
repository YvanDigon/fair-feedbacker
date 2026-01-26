import { kmClient } from '@/services/km-client';
import type { AITheme, FeedbackObject, PrizePageSettings, Question, QuestionType, ValidationError } from '@/types/feedbacker';
import type { Answer } from '../stores/player-store';
import { globalStore } from '../stores/global-store';

export const globalActions = {
	// Branding actions
	async updateBranding(logoUrl: string | null, primaryColor: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.branding.logoUrl = logoUrl;
			globalState.branding.primaryColor = primaryColor;
		});
	},

	async applyTheme(theme: {
		primaryColor: string;
		secondaryColor: string;
		accentColor: string;
		backgroundColor: string;
		gradientColor: string;
		textColor: string;
	}) {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.branding.primaryColor = theme.primaryColor;
			globalState.branding.secondaryColor = theme.secondaryColor;
			globalState.branding.accentColor = theme.accentColor;
			globalState.branding.backgroundColor = theme.backgroundColor;
			globalState.branding.gradientColor = theme.gradientColor;
			globalState.branding.textColor = theme.textColor;
		});
	},

	async generateAIThemes(logoUrl: string, primaryColor: string) {
		const state = globalStore.proxy;
		
		// Check generation limit
		if (state.branding.generationCount >= 3) {
			throw new Error('Maximum theme generations reached (3/3)');
		}

		// Use AI to generate 3 theme variations based on logo and primary color
		const prompt = `Analyze the brand logo and primary color ${primaryColor} to generate 3 different color themes in JSON format:
		
1. Monochromatic theme (LIGHT MODE): Variations of the primary color with different shades and tints. This is a LIGHT theme.
2. Complementary theme (LIGHT MODE): Colors opposite on the color wheel for high contrast. This is a LIGHT theme.
3. Dark Mode theme (DARK MODE): A dark theme where backgrounds are dark colors and text is light. This is a DARK theme.

CRITICAL REQUIREMENTS:
- For Monochromatic and Complementary (LIGHT MODES):
  * backgroundColor must be VERY LIGHT (like #f0fdf4, #fef3f2, #f0f9ff)
  * gradientColor must be SLIGHTLY LIGHTER than backgroundColor (like #dcfce7, #fee2e2, #dbeafe)
  * textColor MUST be DARK for readability (like #0f172a, #1e293b, #020617)

- For Dark Mode (DARK MODE ONLY):
  * backgroundColor must be DARK (like #0f172a, #1e293b, #171717)
  * gradientColor must be a SLIGHTLY DIFFERENT DARK shade (like #1e293b, #334155, #262626)
  * textColor MUST be LIGHT for readability (like #f8fafc, #f1f5f9, #fafafa)

For each theme, provide:
- name: "Monochromatic" or "Complementary" or "Dark Mode"
- primaryColor (hex)
- secondaryColor (hex)
- accentColor (hex)
- backgroundColor (hex - LIGHT for first two, DARK for Dark Mode)
- gradientColor (hex - LIGHT for first two, DARK for Dark Mode)
- textColor (hex - DARK like #0f172a for first two, LIGHT like #f8fafc for Dark Mode)

Return JSON array with 3 themes: [{"name": "Monochromatic", "primaryColor": "#...", "secondaryColor": "#...", "accentColor": "#...", "backgroundColor": "#...", "gradientColor": "#...", "textColor": "#..."}, ...]`;

		try {
			const result = await kmClient.ai.generateJson<AITheme[]>({
				userPrompt: prompt,
				imageUrls: [logoUrl],
				temperature: 0.8
			});

			const themes: AITheme[] = result.map((theme, index) => ({
				...theme,
				id: `${Date.now()}_${index}`
			}));

			// Save generated themes
			await kmClient.transact([globalStore], ([globalState]) => {
				globalState.branding.generatedThemes = themes;
				globalState.branding.generationCount += 1;
			});

			return themes;
		} catch (error) {
			console.error('Failed to generate themes:', error);
			throw new Error('Failed to generate AI themes. Please try again.');
		}
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
	async addQuestion(
		objectId: string,
		type: QuestionType,
		text: string,
		imageUrl: string,
		options: string[] = [],
		randomizeOptions?: boolean,
		openEndedLength?: 'short' | 'long',
		ratingScale?: 5 | 7 | 10 | 11
	) {
		const id = kmClient.serverTimestamp().toString();
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.questions[id] = {
				id,
				objectId,
				type,
				text,
				imageUrl,
				options,
				randomizeOptions,
				openEndedLength,
				ratingScale,
				createdAt: kmClient.serverTimestamp()
			};
		});
		return id;
	},

	async updateQuestion(questionId: string, updates: Partial<Omit<Question, 'id' | 'objectId' | 'createdAt'>>) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const q = globalState.questions[questionId];
			if (q) {
				if (updates.type !== undefined) q.type = updates.type;
				if (updates.text !== undefined) q.text = updates.text;
				if (updates.imageUrl !== undefined) q.imageUrl = updates.imageUrl;
				if (updates.options !== undefined) q.options = updates.options;
				if (updates.randomizeOptions !== undefined) q.randomizeOptions = updates.randomizeOptions;
				if (updates.openEndedLength !== undefined) q.openEndedLength = updates.openEndedLength;
				if (updates.ratingScale !== undefined) q.ratingScale = updates.ratingScale;
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
				// Validate based on question type
				if (q.type === 'single' || q.type === 'multiple') {
					if (q.options.length < 2) {
						errors.push({ field: `question_${q.id}`, message: `Question "${q.text}" must have at least 2 options` });
					}
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
		answers: Record<string, Answer>
	) {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Save each answer as a response
			Object.entries(answers).forEach(([questionId, answer]) => {
				const responseId = `${sessionId}_${questionId}`;
				const baseResponse = {
					id: responseId,
					sessionId,
					questionId,
					objectId,
					timestamp: kmClient.serverTimestamp()
				};

				// Map answer based on type
				if (answer.type === 'single') {
					globalState.responses[responseId] = {
						...baseResponse,
						selectedOptionIndex: answer.value
					};
				} else if (answer.type === 'multiple') {
					globalState.responses[responseId] = {
						...baseResponse,
						selectedOptionIndex: null,
						selectedOptionIndexes: answer.value
					};
				} else if (answer.type === 'open-ended') {
					globalState.responses[responseId] = {
						...baseResponse,
						selectedOptionIndex: null,
						textAnswer: answer.value
					};
				} else if (answer.type === 'rating') {
					globalState.responses[responseId] = {
						...baseResponse,
						selectedOptionIndex: null,
						ratingValue: answer.value !== null ? answer.value : undefined
					};
				}
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
		// Store name and email in leaderboard privateMetadata (GDPR compliant - not exposed to clients)
		// Using upsertEntry ensures one submission per session
		await kmClient.leaderboard.upsertEntry(
			'prize-submissions',
			'desc',
			kmClient.serverTimestamp(), // score = timestamp for ordering
			{}, // public metadata (empty - nothing exposed)
			{ sessionId, name, email } // privateMetadata (only accessible via API)
		);

		// Increment local counter (just for display purposes)
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.prizeSubmissionCount += 1;
		});
	},

	async clearPrizeSubmissions() {
		// Reset the counter (leaderboard entries persist but counter resets)
		// Note: Actual leaderboard entries can only be managed via Kokimoki API
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.prizeSubmissionCount = 0;
		});
	}
};
