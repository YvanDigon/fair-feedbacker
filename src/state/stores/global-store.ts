import { kmClient } from '@/services/km-client';
import type {
	Branding,
	CompletedObjectEntry,
	FeedbackObject,
	PrizePageSettings,
	Question,
	Response
} from '@/types/feedbacker';

export interface GlobalState {
	controllerConnectionId: string;
	players: Record<string, { name: string }>;

	// Feedbacker event data
	branding: Branding;
	introMessage: string;
	isPublished: boolean;
	carouselIntervalSeconds: number;

	// Objects and Questions
	objects: Record<string, FeedbackObject>;
	questions: Record<string, Question>;

	// Responses (keyed by response ID)
	responses: Record<string, Response>;

	// Completed objects per session (keyed by `${sessionId}_${objectId}`)
	completedObjects: Record<string, CompletedObjectEntry>;

	// Prize feature
	prizeEnabled: boolean;
	prizeEmailCollection: PrizePageSettings;
	prizeClaim: PrizePageSettings;
	prizeSubmissionCount: number; // Counter only - emails stored securely in leaderboard privateMetadata
}

const initialState: GlobalState = {
	controllerConnectionId: '',
	players: {},

	// Feedbacker defaults
	branding: {
		logoUrl: null,
		primaryColor: '#22c55e',
		secondaryColor: '#16a34a',
		accentColor: '#86efac',
		backgroundColor: '#f0fdf4',
		gradientColor: '#dcfce7',
		textColor: '#0f172a',
		generatedThemes: [],
		generationCount: 0
	},
	introMessage: '',
	isPublished: false,
	carouselIntervalSeconds: 5,

	objects: {},
	questions: {},
	responses: {},
	completedObjects: {},

	// Prize feature defaults
	prizeEnabled: false,
	prizeEmailCollection: {
		title: '',
		imageUrl: null,
		message: ''
	},
	prizeClaim: {
		title: '',
		imageUrl: null,
		message: ''
	},
	prizeSubmissionCount: 0
};

export const globalStore = kmClient.store<GlobalState>('global', initialState);
