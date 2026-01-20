import { z } from '@kokimoki/kit';

export const schema = z.object({
	// General
	title: z.string().default('Feedbacker'),
	loading: z.string().default('Loading...'),

	// Host UI
	hostTitle: z.string().default('Feedbacker Admin'),
	brandingSection: z.string().default('Branding'),
	logoLabel: z.string().default('Logo'),
	uploadLogoButton: z.string().default('Upload Logo'),
	removeLogoButton: z.string().default('Remove'),
	primaryColorLabel: z.string().default('Primary Color (Hex)'),
	primaryColorPlaceholder: z.string().default('#22c55e'),

	introMessageSection: z.string().default('Intro Message'),
	introMessageLabel: z.string().default('Message shown to players'),
	introMessagePlaceholder: z.string().default('Welcome to our event...'),

	carouselSection: z.string().default('Presenter Settings'),
	carouselIntervalLabel: z.string().default('Carousel Interval (seconds)'),

	objectsSection: z.string().default('Objects'),
	addObjectButton: z.string().default('Add Object'),
	objectNameLabel: z.string().default('Name'),
	objectNamePlaceholder: z.string().default('Object name...'),
	objectDescriptionLabel: z.string().default('Description'),
	objectDescriptionPlaceholder: z.string().default('Short description...'),
	objectThumbnailLabel: z.string().default('Thumbnail'),
	uploadThumbnailButton: z.string().default('Upload Thumbnail'),
	deleteObjectButton: z.string().default('Delete Object'),
	editObjectButton: z.string().default('Edit'),
	saveObjectButton: z.string().default('Save'),
	cancelButton: z.string().default('Cancel'),

	questionsSection: z.string().default('Questions'),
	addQuestionButton: z.string().default('Add Question'),
	questionTextLabel: z.string().default('Question Text'),
	questionTextPlaceholder: z.string().default('How would you rate...'),
	questionImageLabel: z.string().default('Question Image'),
	uploadImageButton: z.string().default('Upload Image'),
	optionsLabel: z.string().default('Options'),
	addOptionButton: z.string().default('Add Option'),
	optionPlaceholder: z.string().default('Option text...'),
	deleteQuestionButton: z.string().default('Delete'),
	saveQuestionButton: z.string().default('Save Question'),

	publishSection: z.string().default('Publish'),
	validateButton: z.string().default('Save Changes'),
	publishButton: z.string().default('Publish Event'),
	unpublishButton: z.string().default('Unpublish'),
	eventPublished: z.string().default('Event is live!'),
	eventNotPublished: z.string().default('Event is not published'),
	validationErrors: z.string().default('Validation Errors:'),

	statsSection: z.string().default('Statistics Dashboard'),
	totalResponses: z.string().default('Total Responses'),
	skipCount: z.string().default('Skipped'),
	responseDistribution: z.string().default('Response Distribution'),
	noResponses: z.string().default('No responses yet'),
	resetResponsesButton: z.string().default('Reset All Responses'),
	resetConfirmMessage: z.string().default('Are you sure you want to reset all responses? This cannot be undone.'),

	playerLinkLabel: z.string().default('Player Link'),
	presenterLinkLabel: z.string().default('Presenter Link'),

	// Player UI
	playerIntroTitle: z.string().default('Welcome'),
	selectObjectLabel: z.string().default('Select an item to review:'),
	completedLabel: z.string().default('Completed'),
	startReviewButton: z.string().default('Start Review'),
	finishButton: z.string().default('Finish'),
	skipButton: z.string().default('Skip'),
	nextButton: z.string().default('Next'),
	previousButton: z.string().default('Previous'),
	questionOf: z.string().default('of'),
	cancelReviewButton: z.string().default('Cancel'),
	allObjectsCompleted: z.string().default('You have reviewed all items. Thank you!'),
	eventNotAvailable: z.string().default('This event is not available yet. Please check back later.'),

	// Presenter UI
	presenterTitle: z.string().default('Scan to Join'),
	resultsTitle: z.string().default('Live Results'),
	noQuestionsYet: z.string().default('No questions configured yet'),
	responsesLabel: z.string().default('responses'),

	// Prize Feature - Host UI
	prizeSection: z.string().default('Prize Feature'),
	prizeEnableLabel: z.string().default('Enable prize feature'),
	prizeEmailCollectionSection: z.string().default('Email Collection Page'),
	prizeEmailTitleLabel: z.string().default('Title'),
	prizeEmailTitlePlaceholder: z.string().default('Win a Prize!'),
	prizeEmailMessageLabel: z.string().default('Message'),
	prizeEmailMessagePlaceholder: z.string().default('Enter your email for a chance to win...'),
	prizeEmailImageLabel: z.string().default('Prize Image'),
	prizeClaimSection: z.string().default('Prize Claim Page'),
	prizeClaimTitleLabel: z.string().default('Title'),
	prizeClaimTitlePlaceholder: z.string().default('Claim Your Prize'),
	prizeClaimMessageLabel: z.string().default('Instructions'),
	prizeClaimMessagePlaceholder: z.string().default('Show this screen to claim your prize...'),
	prizeClaimImageLabel: z.string().default('Claim Image'),
	prizeSubmissionsSection: z.string().default('Email Submissions'),
	prizeSubmissionsEmpty: z.string().default('No submissions yet'),
	prizeSubmissionsClearButton: z.string().default('Clear All'),
	prizeSubmissionsClearConfirm: z.string().default('Are you sure you want to clear all email submissions?'),

	// Prize Feature - Player UI
	prizeEmailFormTitle: z.string().default('Win a Prize!'),
	prizeEmailFormMessage: z.string().default('Enter your details for a chance to win'),
	prizeEmailNameLabel: z.string().default('Your Name'),
	prizeEmailNamePlaceholder: z.string().default('Enter your name'),
	prizeEmailAddressLabel: z.string().default('Email Address'),
	prizeEmailAddressPlaceholder: z.string().default('Enter your email'),
	prizeEmailSubmitButton: z.string().default('Submit'),
	prizeEmailSkipLink: z.string().default('Skip'),
	prizeEmailInvalidEmail: z.string().default('Please enter a valid email address'),
	prizeClaimButton: z.string().default('🎁 Claim Your Prize'),
	prizeClaimBackButton: z.string().default('Back'),

	// Menu
	menuAriaLabel: z.string().default('Open menu drawer'),
	menuHelpAriaLabel: z.string().default('Open help drawer'),
	menuHelpMd: z
		.string()
		.default('# Help\nFollow instructions on screen to provide feedback.')
});

export type Config = z.infer<typeof schema>;
