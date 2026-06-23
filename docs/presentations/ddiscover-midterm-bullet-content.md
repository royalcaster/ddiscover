# DDiscover Midterm Presentation Bullet Content

## Slide 1 - DDiscover

- Mobile app for discovering student club events in Dresden
- Focus on students who want to know what is happening nearby
- Map-first experience instead of long event lists
- Real event data from student club sources
- Midterm goal:
  - show current product direction
  - explain the UX concept
  - explain the technical foundation
- 7-minute structure:
  - product and UX first
  - technical setup second
  - current status and next steps at the end

## Slide 2 - Core User Flow

- User opens the app
- No login wall on first launch
- Main entry point is the map
- User sees nearby clubs and event locations
- User taps a location or event marker
- App shows short bottom-sheet-style details
- User can check:
  - club name
  - event title
  - date and time
  - source link
  - save actions
- Favorites are the first reason to sign in
- Auth appears when useful, not before browsing
- Core UX question:
  - what is happening nearby?
  - where is it?
  - is it worth saving?

## Slide 3 - Current App Features

- Entdecken
  - map-based discovery screen
  - club and event selection
  - selected location detail panel
  - source links for event information
  - save event and save club actions
- Kalender
  - upcoming event overview
  - backend-driven event data
  - quick scanning by date
  - direct save actions
- Profil
  - guest-first app usage
  - Clerk sign-in placed in profile tab
  - no forced account creation before browsing
- Favorites
  - first authenticated-only feature
  - saved clubs and events
  - user-specific Convex data
- Data foundation
  - VDSC feed import
  - normalized clubs
  - persisted events
  - geocoded coordinates where available

## Slide 4 - Design Principles

- Guest-first
  - browsing should work without an account
  - sign-in should appear only when it gives value
  - profile tab contains authentication
- Map-first
  - location is central for nightlife decisions
  - map gives faster orientation than a list
  - selected detail panel keeps context visible
- Compact mobile UI
  - short summaries
  - dense cards
  - quick comparison
  - minimal explanation text
- Nightlife identity
  - dark surfaces
  - yellow accent color
  - event imagery
  - map visuals
  - app-like panels instead of generic website sections
- MVP focus
  - Entdecken
  - Kalender
  - Profil
  - favorites as first signed-in feature
- Deferred features
  - advanced routing
  - broad personalization
  - large event portal behavior

## Slide 5 - Mobile App Layer

- React Native
  - native mobile app UI
  - shared TypeScript code
  - Android-focused local testing
- Expo
  - project scaffold
  - development client workflow
  - Android build workflow
  - config plugins
  - emulator integration
- Expo Router
  - file-based navigation
  - tab structure
  - screens for Entdecken, Kalender, Profil
- Native maps
  - react-native-maps
  - map-first discovery surface
  - Android Google Maps configuration
- UI system
  - NativeWind-style styling
  - react-native-reusables direction
  - theme tokens
  - light and dark mode support
- Developer tooling
  - Android helper scripts
  - emulator startup helpers
  - adb reverse support
  - logs and app reset commands

## Slide 6 - Backend, Data, And Auth

- Convex
  - backend functions
  - database
  - queries
  - mutations
  - generated TypeScript API
- Event ingestion
  - VDSC calendar feed
  - fetch-based import
  - no Puppeteer needed
  - upsert behavior avoids duplicates
- Data model
  - events table
  - clubs table
  - favorites table
  - geocoding cache table
- Club normalization
  - canonical club names
  - stable slugs
  - source metadata
  - address fields
- Geocoding
  - cache-first lookup
  - coordinate enrichment during import
  - reduced repeated external requests
- Clerk
  - authentication provider
  - profile-tab sign-in
  - Google sign-in support
  - user identity for Convex
- Favorites
  - auth-required mutation
  - user-scoped saved entities
  - event favorites
  - club favorites
- Tests
  - parser tests
  - import/upsert behavior tests
  - favorites tests
  - geocoding cache tests
  - Convex backend tests with Vitest and convex-test

## Slide 7 - Current Status And Next Steps

- Current status
  - Expo React Native app initialized
  - Convex backend connected
  - Clerk authentication connected
  - real event ingestion implemented
  - map-first discovery screen implemented
  - calendar screen implemented
  - profile/auth screen implemented
  - favorites backend and app integration implemented
  - Android emulator workflow documented
- Project workflow
  - AGENTS.md defines shared rules
  - README contains high-level setup information
  - daily session summaries record decisions
  - Conventional Commits required
  - AI-assisted work documented for learning journal support
- Known challenges
  - Android setup varies between machines
  - emulator and adb reliability
  - Google Maps key and native config
  - Clerk OAuth setup details
  - geocoding coverage is not complete for every club
- Next steps
  - polish Entdecken UX
  - improve map accuracy
  - stabilize team setup instructions
  - refine event and club details
  - improve visual consistency
  - prepare final presentation and video
  - preserve learning journal evidence
- Closing message
  - DDiscover already has the core product loop
  - current focus is turning the foundation into a polished beta
  - the project combines mobile UX, real backend data, auth, and reproducible process
