/**
 * Feedbacker data types for the event feedback system
 */

export type QuestionType = 'single' | 'multiple' | 'open-ended' | 'rating';

export interface Branding {
	logoUrl: string | null;
	primaryColor: string; // hex code e.g., "#3b82f6"
	secondaryColor: string;
	accentColor: string;
	backgroundColor: string;
	gradientColor: string;
	textColor: string;
	generatedThemes: AITheme[];
	generationCount: number; // max 3 generations
}

export interface AITheme {
	id: string;
	name: string; // "Monochromatic", "Complementary", "Dark Mode"
	primaryColor: string;
	secondaryColor: string;
	accentColor: string;
	backgroundColor: string;
	gradientColor: string;
	textColor: string; // Text color for readability (light for dark themes, dark for light themes)
}

export interface FeedbackObject {
	id: string;
	name: string;
	description: string;
	thumbnailUrl: string | null;
	createdAt: number;
}

export interface Question {
	id: string;
	objectId: string;
	type: QuestionType;
	text: string;
	imageUrl: string;
	// For 'single' and 'multiple' types
	options: string[];
	randomizeOptions?: boolean;
	// For 'open-ended' type
	openEndedLength?: 'short' | 'long';
	// For 'rating' type
	ratingScale?: 5 | 7 | 10 | 11;
	createdAt: number;
}

export interface Response {
	id: string;
	sessionId: string;
	questionId: string;
	objectId: string;
	// For 'single' type
	selectedOptionIndex: number | null; // null = skipped
	// For 'multiple' type
	selectedOptionIndexes?: number[];
	// For 'open-ended' type
	textAnswer?: string;
	// For 'rating' type
	ratingValue?: number;
	timestamp: number;
}

export interface CompletedObjectEntry {
	sessionId: string;
	objectId: string;
	timestamp: number;
}

export interface FeedbackEvent {
	branding: Branding;
	introMessage: string;
	isPublished: boolean;
	carouselIntervalSeconds: number;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface PrizePageSettings {
	title: string;
	imageUrl: string | null;
	message: string;
}
