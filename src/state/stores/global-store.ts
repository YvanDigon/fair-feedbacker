import { kmClient } from '@/services/km-client';
import type {
	Branding,
	CompletedObjectEntry,
	FeedbackObject,
	PrizePageSettings,
	PrizeSubmission,
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
	prizeSubmissions: Record<string, PrizeSubmission>; // keyed by sessionId
}

const initialState: GlobalState = {
	controllerConnectionId: '',
	players: {},

	// Feedbacker defaults
	branding: {
		logoUrl: null,
		primaryColor: '#22c55e'
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
	prizeSubmissions: {}
};

export const globalStore = kmClient.store<GlobalState>('global', initialState);
