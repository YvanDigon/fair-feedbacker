# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-20

### Added
- Prize feature with email collection after object completion
- Prize claim page accessible via "Claim Your Prize" button on intro screen
- Email validation with skip option for prize collection
- Host controls for prize feature (enable/disable, email collection page, prize claim page)
- Email submissions dashboard for host with clear all functionality
- Prize settings integrated with "Save Changes" workflow
- LocalStorage persistence for prize email submission status
- Configuration fields for all prize-related text and labels (25+ new config options)

### Changed
- Updated theme from light blue to light green gradient backgrounds
- Changed button colors from green to grey with improved styling
- Removed "Games for Crowds" logo from host and presenter layouts
- Removed header and footer from player layout for cleaner mobile experience
- Email collection page now shows after ANY completed object (not just first) until email is submitted
- Prize feature toggle now saves immediately (like image uploads)
- Prize page images centered with aspect ratio preservation (`object-contain`)

### Fixed
- "Save Changes" button now properly detects pending changes for all settings including prize feature
- Prize settings handlers properly merge with existing pending state
- Email collection flow correctly triggers when prize is enabled and email not submitted
- Prize claim page text and images properly centered

## [0.1.0] - 2026-01-20

### Added
- Initial Feedbacker implementation with Host, Player, and Presenter modes
- Real-time feedback collection system for fair/exhibition events
- Object and question management with image support
- Response tracking and statistics dashboard
- Live results carousel on presenter screen
- Settings context with pending changes pattern

### Changed
- Implemented "Save Changes" button workflow for branding, intro message, and carousel settings

### Fixed
- Completed objects tracking using local player store with localStorage persistence