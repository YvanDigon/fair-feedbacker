# Feedbacker - Event Feedback Tool Specification

## Overview

Feedbacker is a real-time feedback collection tool for fair/exhibition events (e.g., car exhibitions). It enables organizers to gather structured feedback from attendees about various objects (e.g., cars) through mobile-friendly questionnaires.

## Modes

- **Host**: Admin who creates, configures, and monitors the feedback event
- **Presenter**: Big screen display showing QR code and live result carousel
- **Player**: Attendees using their phones to provide feedback

## Data Model

### Event (stored in globalStore)

```typescript
interface FeedbackEvent {
  branding: {
    logoUrl: string | null;
    primaryColor: string; // hex code
  };
  introMessage: string; // markdown
  isPublished: boolean;
  carouselIntervalSeconds: number; // default: 5
}
```

### Objects

```typescript
interface FeedbackObject {
  id: string; // timestamp key
  name: string;
  description: string;
  thumbnailUrl: string | null;
}
```

### Questions

```typescript
interface Question {
  id: string; // timestamp key
  objectId: string;
  text: string;
  imageUrl: string; // required
  options: string[]; // at least 2 options
}
```

### Responses

```typescript
interface Response {
  id: string; // timestamp key
  sessionId: string;
  questionId: string;
  objectId: string;
  selectedOptionIndex: number | null; // null = skipped
  timestamp: number;
}
```

### Completed Objects (per session)

```typescript
interface CompletedObject {
  sessionId: string;
  objectId: string;
  timestamp: number;
}
```

## Flow

### Step A - Host Event Configuration

1. Host creates/edits the single event:
   - Upload logo (optional)
   - Set primary color (hex code, required)
   - Write intro message (required)
   - Add objects with names, descriptions, thumbnails
   - For each object, add questions with:
     - Question text
     - Image (required)
     - Multiple choice options (minimum 2, single-select)

### Step B - Publish Event

1. Host validates all requirements are met:
   - Primary color is set
   - Intro message is not empty
   - At least 1 object exists
   - Each object has at least 1 question
   - Each question has at least 2 options and an image
2. Host clicks "Publish"
3. Once published, Presenter shows QR code for players to join

### Step C - Player Participation

1. Player scans QR code and opens Player view
2. Session ID is generated and stored in localStorage
3. Player sees intro page with:
   - Branding (logo + primary color theme)
   - Intro message
   - Object selection list at bottom
4. Completed objects are marked and locked
5. Player selects an object:
   - Sees list of questions for that object
   - Answers questions (single-select) or skips
   - Taps "Finish" to submit
6. On finish:
   - Responses are saved
   - Object is marked complete for this session
   - Player returns to intro page
   - Can select another (non-completed) object

### Step D - Presenter Carousel

1. Displays QR code for joining
2. Rotating carousel shows one question at a time:
   - Object name
   - Question text
   - Question image
   - Animated donut chart of results
3. Auto-advances every N seconds (configurable)
4. Loops through all questions across all objects
5. Results update in real-time

### Step E - Host Statistics Dashboard

1. Real-time view of all statistics:
   - Overview across all objects and questions
   - Drill-down by object/question
   - Live updates as answers come in
   - Per-question: total responses, distribution per option, skip count

## Session Management

- Anonymous players (no login required)
- Session ID stored in localStorage
- Each object can only be answered once per session
- Completed objects cannot be re-opened

## Validation Rules

Event cannot be published unless:
- Primary color is set (hex format)
- Intro message is not empty
- At least 1 object exists
- Each object has at least 1 question
- Each question has at least 2 options and exactly 1 image

## UI/UX Requirements

- Consistent branding across all screens (logo + primary color)
- Player UI: Mobile-first, simple, quick to complete
- Presenter UI: Large typography, high contrast, smooth animations
- Host UI: Fast configuration, clear statistics
