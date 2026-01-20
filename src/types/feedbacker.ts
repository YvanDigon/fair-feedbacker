/**
 * Feedbacker data types for the event feedback system
 */

export interface Branding {
	logoUrl: string | null;
	primaryColor: string; // hex code e.g., "#3b82f6"
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
	text: string;
	imageUrl: string;
	options: string[]; // at least 2 options
	createdAt: number;
}

export interface Response {
	id: string;
	sessionId: string;
	questionId: string;
	objectId: string;
	selectedOptionIndex: number | null; // null = skipped
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

export interface PrizeSubmission {
	sessionId: string;
	name: string;
	email: string;
	timestamp: number;
}
