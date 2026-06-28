# Development Diary / Learning Journal

Note: All documented development sessions were completed together by Philip Poplutz and Gabriel Pechstein, either on site at HTW facilities or remotely via Discord.

## Purpose

This document is the submission-ready Learning Journal basis for DDiscover. It consolidates the daily session summaries from `docs/session-summaries/` into the required format: date, time, approximate duration, activities, problems, solutions, and AI support. The session summaries remain the detailed technical evidence.

## Project Context

DDiscover is an HTW Dresden Mobile Networks APL project. The app helps students discover Dresden student club events, see clubs on a map, open event details, and plan public transport routes. The implementation uses React Native with Expo for the mobile app, Convex for backend data and scheduled imports, Clerk for authentication, MapLibre for the map, and DVB route data for navigation support.

## Entries

### 2026-04-23

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 16:00-23:40 CEST
- Duration: ~7h 40m
- Activities:
  - Created repository working rules, assignment constraints, Conventional Commit rules, and daily session summary workflow.
  - Initialized the Expo React Native app, Convex backend integration, and Clerk authentication setup.
  - Built the first Convex VDSC event ingestion slice using the structured `events.vdsc.de/calendar.json` feed.
  - Added parser/backend tests and local Android helper scripts for emulator and Metro workflows.
  - Introduced the first UI foundation with NativeWind, semantic theme tokens, and a five-tab product shell.
- Problems:
  - Expo Go and LAN development were unreliable because of SDK/version mismatch and host network reachability.
  - Android device debugging over USB was blocked by ADB/device authorization problems.
  - Convex setup required generated files and clear schema/runtime validation rules.
  - Early UI was still scaffold-like and not close enough to the intended DDiscover product.
- Solutions:
  - Switched to Android emulator/dev-client workflow and added helper scripts for repeatable local startup.
  - Used the VDSC JSON calendar feed instead of fragile HTML scraping.
  - Added schema-backed Convex tests and verified with `npx tsc --noEmit`, `npm run lint`, and `npm test`.
  - Documented persistent rules in `AGENTS.md` and high-level notes in `README.md`.
- AI Support:
  - Prompt intent: set up the project stack, diagnose Expo/Android issues, migrate the VDSC scraper to Convex, and establish repo rules.
  - Outcome: working baseline app/backend, repeatable dev commands, tested import pipeline, and documented operating rules.

### 2026-04-24

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 00:00-02:10 CEST, with later follow-up work during the day
- Duration: ~4h
- Activities:
  - Stabilized the Android emulator target and Metro cleanup workflow.
  - Added guest-first Clerk profile authentication, Google sign-in handling, SSO callback routing, and settings flow.
  - Defined the MVP beta scope: map discovery, calendar, profile, and authenticated favorites.
  - Created a dedicated MVP handoff brief with screen contracts, backend contract, and QA checklist.
  - Implemented early favorites backend/auth foundation and continued app-shell refinements.
- Problems:
  - Clerk native auth and Google sign-in needed careful redirect/session handling.
  - Metro/Babel configuration broke temporarily after native auth additions.
  - The app risked becoming too broad before the first usable beta.
- Solutions:
  - Kept the core app guest-first and made authentication opt-in from the profile screen.
  - Added explicit redirect handling through `sso-callback` and fail-fast config validation.
  - Reduced the MVP to the minimum useful student club discovery workflow.
- AI Support:
  - Prompt intent: integrate Clerk without blocking guest usage, define a realistic MVP, and create an execution brief.
  - Outcome: profile-based auth UX, concrete MVP cut, and implementation checklist for later work.

### 2026-04-25

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: afternoon/evening CEST
- Duration: ~4h
- Activities:
  - Investigated Android white screens, app logs, stale Metro URLs, Google Maps key handling, and native crashes.
  - Refactored Android helper scripts around a shared ADB utility with better timeout and diagnostics behavior.
  - Rebuilt the Discover screen as a full-screen map experience with an overlay card.
  - Added geocoding support to the Convex import pipeline with a cache table, Nominatim lookup helper, and tests.
  - Captured design screenshots under `docs/design/` for visual comparison.
- Problems:
  - Android logs were noisy and did not initially isolate app-process failures.
  - Google Maps native key injection was missing from the generated Android config.
  - Custom marker rendering was unstable on Android.
  - Automatically imported coordinates were incomplete or uncertain.
- Solutions:
  - Added app-focused log streaming and consistent ADB command handling.
  - Added native maps key wiring and explicit env loading in Android scripts.
  - Made the map use explicit native sizing.
  - Added cache-first geocoding and tests for normalization, selection, and coordinate persistence.
- AI Support:
  - Prompt intent: fix Android runtime issues, improve the map UI, and integrate tested coordinate enrichment.
  - Outcome: better diagnostics, a map-first Discover screen, and a tested geocoding pipeline.

### 2026-04-26

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: CEST
- Duration: ~30m
- Activities:
  - Added a Convex internal admin cleanup mutation for development data reset.
  - Documented that destructive backend helpers must remain internal and be used only intentionally.
- Problems:
  - Test/dev data could accumulate while import behavior was still changing.
- Solutions:
  - Added a controlled internal cleanup path instead of manual table edits.
- AI Support:
  - Prompt intent: support safe backend reset during development.
  - Outcome: isolated internal maintenance function.

### 2026-05-17

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 17:26 CEST
- Duration: ~25m
- Activities:
  - Reviewed how to start the development environment.
  - Updated `README.md` with correct local commands for Convex, Expo, Android emulator, and Metro cleanup.
- Problems:
  - The start sequence was spread across previous notes and was not clear enough for future work.
- Solutions:
  - Consolidated the main commands in the root README.
- AI Support:
  - Prompt intent: explain and document the local start workflow.
  - Outcome: clearer onboarding commands.

### 2026-05-18

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: daytime CEST
- Duration: ~1h 30m
- Activities:
  - Wrote a short onboarding briefing for a colleague.
  - Helped troubleshoot Android dev-run failures, missing native Android folder, emulator startup, ADB setup, and MacBook compatibility.
  - Prepared separated commit groups and discussed Convex dev environment initialization.
- Problems:
  - Fresh clones need `npx expo prebuild --platform android` before native Android runs.
  - Convex schema validation can fail when generated schema and deployed data are out of sync.
  - Emulator/device setup differs between Windows and macOS.
- Solutions:
  - Documented when to run prebuild and how to start Convex/dev-client workflows.
  - Preserved setup notes in summaries for future onboarding.
- AI Support:
  - Prompt intent: prepare colleague onboarding and debug fresh-clone setup problems.
  - Outcome: clearer setup guidance and commit preparation.

### 2026-05-20

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: CEST
- Duration: ~30m
- Activities:
  - Created the first 7-minute midterm presentation structure.
  - Added slide-by-slide bullet content for speaker preparation.
- Problems:
  - The presentation needed to stay focused on project context, architecture, progress, problems, and next steps.
- Solutions:
  - Created concise midterm material under `docs/presentations/`.
- AI Support:
  - Prompt intent: draft a short technical presentation structure.
  - Outcome: reusable midterm speaker outline.

### 2026-05-31

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: daytime/evening CEST
- Duration: ~3h
- Activities:
  - Reviewed latest app state and MVP roadmap.
  - Chose a curated fixed club-location set for MVP reliability.
  - Protected manually reviewed Convex club data from being overwritten by imports.
  - Cleaned up duplicate auth buttons and improved the signed-in profile with profile picture and favorites section.
  - Improved favorites auth handling and product-safe error messages.
  - Reworked the calendar visual design, real seven-day date strip, settings flow, and MapLibre-based Discover map.
- Problems:
  - Automatic geocoding placed at least one club incorrectly.
  - Clerk and Convex auth state could temporarily disagree.
  - Native tab routing made profile settings routing brittle.
  - Google Maps was heavier and less stylable than desired.
- Solutions:
  - Used reviewed club rows/curated fallback coordinates for MVP.
  - Added regression tests so imports preserve reviewed club data.
  - Replaced user-facing auth provider details with generic language and console diagnostics.
  - Moved settings into an in-tab profile subview and switched the map implementation to MapLibre.
- AI Support:
  - Prompt intent: stabilize MVP data, auth, profile, calendar, and map decisions.
  - Outcome: more reliable MVP behavior and documented reasons for the data/map approach.

### 2026-06-15

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 12:00-15:35 CEST
- Duration: ~1h 10m active work
- Activities:
  - Added event detail pages and centralized event-detail navigation.
  - Fixed stale Metro route cache and a Discover event-detail null crash.
  - Added the GitLab remote and audited assignment compliance.
  - Cleaned repository artifacts from tracked submission state.
  - Added a DVB route planning action and event-detail route component.
  - Investigated emulator startup failure caused by low disk space.
- Problems:
  - Event details could crash when no selected event existed.
  - Metro kept compiling a deleted route from stale cache.
  - The project had to be transferred to HTW GitLab while preserving commits.
  - The default emulator could not start because the AVD did not have enough disk space.
- Solutions:
  - Guarded event detail actions and restarted Metro with a clean route graph.
  - Added GitLab remote without rewriting history.
  - Documented artifact cleanup and GitLab requirements.
  - Identified the emulator disk-space root cause for later cleanup.
- AI Support:
  - Prompt intent: add event detail and route planning, check GitLab/assignment readiness, and debug Android startup.
  - Outcome: event deep links, route planning integration, and clearer submission infrastructure.

### 2026-06-16

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 13:15-16:11 CEST
- Duration: ~1h active work
- Activities:
  - Refined map marker style, theme toggle layout, location button, and "Heute offen" filter.
  - Tuned the Android emulator and helper scripts for performance and lower disk/memory pressure.
  - Manually ran the VDSC import and verified fresh upcoming events in Convex.
- Problems:
  - The emulator had stale QEMU/ADB processes and large quickboot snapshot files.
  - The app needed a rebuilt native dev client after adding `expo-location`.
  - Convex data could become stale if the import was not run.
- Solutions:
  - Tuned AVD configuration, stopped stale processes, and improved emulator launch defaults.
  - Added location permission config and noted the native rebuild requirement.
  - Ran `previewEvents`, `importEvents`, and `events:listUpcoming` to verify live event data.
- AI Support:
  - Prompt intent: polish map controls, improve emulator performance, and refresh backend data.
  - Outcome: better map controls, faster Android loop, and fresh Convex event data.

### 2026-06-23

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 12:06-13:00 CEST
- Duration: ~1h
- Activities:
  - Added a manual GitHub Actions APK workflow.
  - Added a manual GitLab CI APK job and documented how to trigger it.
  - Fixed Android workflow cache/prebuild issues.
  - Added public build configuration validation for Convex, Clerk, and Google sign-in values.
- Problems:
  - Simple phone testing needed an APK without relying on Expo Go.
  - The GitHub workflow initially failed because Gradle files only exist after Expo prebuild.
  - Early APKs lacked required public config for events and Google sign-in.
- Solutions:
  - Built APK workflows around `npx expo prebuild --platform android --no-install`.
  - Added fail-fast config checks before expensive Android builds.
  - Documented sideload testing in `docs/android-device-testing.md`.
- AI Support:
  - Prompt intent: make phone APK testing possible through CI and fix failed builds.
  - Outcome: working manual APK workflow structure and build documentation.

### 2026-06-24

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 13:20-23:25 CEST
- Duration: ~3h 20m active work
- Activities:
  - Investigated Convex data loading failures in standalone APKs.
  - Stabilized public Convex HTTP query loading and disabled realtime favorites while Clerk/Convex JWT handoff remained unreliable in APK context.
  - Normalized Convex URLs to avoid double-slash API paths from CI secrets.
  - Reworked map interaction, tab bar theming, drawer gestures, and sign-in modal styling.
  - Added event image scraping, Convex Storage persistence, frontend image rendering, and a daily import cron.
  - Verified GitHub Actions APK artifacts and documented APK/runtime findings.
- Problems:
  - Convex function references were unstable as React effect dependencies.
  - Realtime Convex WebSocket calls returned HTTP 404 in the APK context.
  - A trailing slash in the CI Convex URL secret produced `//api/query`.
  - VDSC calendar data did not include images directly.
  - A downloaded APK was built from an older commit and therefore did not include the image UI.
- Solutions:
  - Rebuilt public queries around stable function names and `makeFunctionReference`.
  - Isolated public data loading to HTTP queries and disabled favorites mutations temporarily.
  - Normalized Convex URLs in runtime config and Expo config.
  - Scraped one usable image from each event detail page and stored it in Convex Storage.
  - Added cron import every 24 hours with geocoding and image scraping enabled.
- AI Support:
  - Prompt intent: diagnose APK-only Convex issues, polish Android interactions, add event images, and verify APK artifacts.
  - Outcome: working public data loading, event images, daily import automation, and documented root causes.

### 2026-06-25

- Participants: Philip Poplutz, Gabriel Pechstein
- Time: 01:35-19:45 CEST
- Duration: ~3h active work
- Activities:
  - Verified map drawer behavior in the emulator and fixed remaining marker/theme issues.
  - Applied targeted Android UI fixes without starting a new build.
  - Added the map beer marker asset and refined selected marker visuals.
  - Fixed bottom-sheet drag-start flicker by tracking the real animated position.
  - Moved map controls with the drawer and made the drawer non-scrollable with an "Alle Events ansehen" overflow action.
  - Updated visible wording from generic clubs to student clubs where appropriate.
  - Reviewed final submission gaps and prepared final documentation artifacts.
- Problems:
  - Release APKs cannot be installed on the x86_64 emulator because the artifact does not include emulator-compatible native libraries.
  - MapLibre marker colors require concrete color values, not app HSL theme strings.
  - The drawer could flicker when a drag started from an animated target instead of the current animated value.
  - Submission documentation was incomplete: Learning Journal, AI appendix, glossary, final video plan, and cleanup notes.
- Solutions:
  - Used local debug/dev builds for emulator screenshots.
  - Reworked marker colors/assets and drawer animation state tracking.
  - Added or updated submission documentation under `docs/`.
  - Ignored local `.artifacts/` outputs and removed the disallowed root `CLAUDE.md` duplicate.
- AI Support:
  - Prompt intent: finish submission documentation and cleanup items while keeping the style simple and pass-oriented.
  - Outcome: consolidated Learning Journal, AI appendix, glossary, final video plan, README updates, and cleanup changes.

## Appendix A - AI Prompt and Outcome Summary

The project used AI assistance as a development support tool. The AI was asked to inspect the repository, propose implementation steps, modify code or documentation, run local validation where possible, and record the outcomes in daily session summaries. The entries below are paraphrased from the local Codex chat history and grouped by work area. They are intentionally not raw transcript exports, because raw chats contain terminal dumps, local paths, interrupted commands, and troubleshooting noise that are not useful for assessment.

| Area | Representative prompt / task given to AI | Outcome |
| --- | --- | --- |
| Repository rules and assignment constraints | Read the assignment and repository notes, then create persistent repo-local rules for all future agents. Include daily session summaries, Markdown placement rules, Conventional Commits, README update expectations, GitLab/private-submission constraints, and Learning Journal evidence requirements. | Added `AGENTS.md`, README notes, session-summary workflow, Conventional Commit rules, and assignment-derived constraints that guided later implementation and documentation work. |
| Initial Expo, Convex, and Clerk setup | Initialize a React Native app with Expo, add Convex as the backend, add Clerk as the authentication provider, and keep these setup steps focused enough to commit separately. Also explain where generated Convex files belong and how TypeScript types relate to Convex schema validators. | Created the app baseline, providers, config files, generated Convex bindings, starter schema, and auth wiring. Verified the baseline with TypeScript and lint checks where possible. |
| Android development environment | Diagnose why Expo Go, LAN mode, USB debugging, ADB, Metro, and `expo run:android` were failing. Help set up an Android Studio emulator, make command-line startup easier, and add package scripts for starting/stopping Metro, starting the emulator, applying ADB reverse, and running the Android dev build. | Moved development to an emulator/dev-client workflow, added Android helper scripts, fixed SDK/env assumptions, documented startup commands, and reduced repeated manual setup work. |
| Development-build troubleshooting | Explain how Expo development builds differ from Expo Go, whether they are installed on the phone/emulator, how hot reload still works, and what to do when Metro connects to the wrong IP address or port 8081 becomes busy. | Clarified the development-build workflow, added Metro cleanup helpers, added ADB reverse support, and documented the practical local workflow in README/session notes. |
| VDSC event ingestion | Move the old Firebase/Puppeteer student-club event scraper toward Convex, but first try a simpler fetch/static-source approach. Investigate whether VDSC exposes structured data, implement parser/import/upsert logic, and add backend tests for the Convex functions and parser behavior. | Found the VDSC JSON calendar feed, implemented parser/import/upsert logic, added Convex tests, and verified dry-run and live imports without browser scraping. |
| Backend schema and data quality | Normalize clubs from imported event data, avoid duplicate club rows, preserve manually reviewed Convex dashboard data, and add geocoding only where it is reliable. Use tests for behavior that can be verified automatically. | Added canonical club handling, reviewed-data protection, curated coordinate strategy, geocoding cache, Nominatim helper, and regression tests so imports do not overwrite reviewed MVP data. |
| Product scope and MVP planning | Scan the codebase and docs, then help define the smallest useful beta for a student-club discovery app. Keep the MVP narrow enough for release while still covering map discovery, calendar browsing, profile/auth, and favorites. Produce a detailed brief another agent could follow. | Produced the MVP beta brief, narrowed the product scope, and used it to guide later map, calendar, profile, favorites, and route-planning work. |
| UI foundation and design alignment | Redesign the app toward the provided mobile nightlife mockups, use React Native Reusables and NativeWind-style theming properly, preserve light/dark/system theme behavior, and avoid a temporary component setup that would be hard to maintain. | Built the themed five-tab shell, semantic theme tokens, reusable UI foundation, design-aligned calendar/profile surfaces, and later refinements based on emulator screenshots. |
| Discover map experience | Make the Discover screen map-based, fix the map not loading on Android, improve marker styling, add selected/unselected marker states, show the user location, add a location-center button and "Heute offen" filter, and later replace Google Maps with a more stylable MapLibre approach. | Implemented the map-first Discover screen, MapLibre map UI, custom beer marker asset, user-location control, open-today filter, selected marker colors, and drawer-based club/event presentation. |
| Bottom sheet and Android interaction polish | Turn the map information panel into a bottom-up drawer, separate club and event information clearly, prevent drag flicker, keep map controls moving with the drawer, avoid drawer scrolling by showing an overflow action, and use Android-native ripple behavior where appropriate. | Added and refined the discover bottom sheet, fixed drag-state handling, moved map controls with the sheet, capped drawer content, added "Alle Events ansehen", and updated Android touch feedback. |
| Clerk authentication | Add Clerk login in the profile tab without forcing authentication at app start. Use Google sign-in, explain which Google/Clerk client IDs are needed, debug missing session/profile updates, fix redirect/session handling, and keep guest browsing available. | Added profile-based auth UX, Google sign-in button, SSO callback handling, config validation, profile display, and safer signed-out prompts while preserving guest access. |
| Favorites and Convex auth | Implement favorites for clubs/events, show them in the profile area, and debug why Clerk sign-in did not always make Convex mutations authenticated. Keep developer-only errors out of user-facing modals. Later restore favorites with the Clerk `convex` JWT template after the APK issue was understood. | Added favorites backend/UI, improved error handling, diagnosed Clerk/Convex token mismatch, temporarily guarded unreliable APK behavior, and later restored authenticated favorite mutations through Convex HTTP clients. |
| Calendar screen | Redesign the calendar to match the app design, show a seven-day strip starting with today, keep real dates, support light/dark mode, navigate to event detail pages, and later disable experimental swipe gestures until they can be refined. | Built the calendar screen, event list/detail navigation, favorite toggles, static day selection, and native ripple row feedback. |
| Event detail and route planning | Build a dedicated event-detail screen that every event list can link to, prevent crashes when no event is selected, and integrate DVB public transport planning with `dvbjs` so users can see transit and walking legs to an event. | Added event detail routing, guarded null event states, added the Convex route-planning action, and rendered transit/walking route information in the event detail screen. |
| APK and CI builds | Make it possible to test the current app on a real smartphone without Expo Go, preferably by downloading an APK. Add GitHub Actions and GitLab CI build paths, explain how to trigger them, and add fail-fast checks for public Convex/Clerk/Google configuration. | Added manual APK workflows/jobs, Expo prebuild steps, artifact documentation, Android testing notes, and public config validation for CI builds. |
| APK runtime debugging | Investigate why Google sign-in worked in an installed APK but Convex data did not load. Provide concrete debugging steps, inspect GitHub Actions configuration, handle ADB/Wi-Fi debugging, and document the root cause once found. | Found and fixed unstable Convex query references, APK WebSocket limitations, and a trailing-slash Convex URL issue that created double-slash API paths. Documented the fix and stabilized public data loading. |
| Event image pipeline | Extend the scraper so each imported event can have one usable image, decide whether Convex Storage is enough or whether a CDN is needed, store image metadata and files, add tests, run the import, and verify that images appear in the app/APK. | Added event-image scraping, metadata and fallback image extraction, Convex Storage persistence, query-time image URLs, React Native image rendering, tests, and cron-enabled imports. |
| Emulator and performance diagnostics | Investigate why the Android emulator was running slowly, inspect emulator/ADB/system state, tune the AVD and helper scripts, and explain what Android Studio settings or emulator hardware acceleration changes were relevant. | Tuned emulator launch defaults, identified stale processes and snapshot/disk issues, improved local scripts, and documented a faster Android development loop. |
| Midterm presentation | Create a 7-minute midterm presentation covering UX/features first and technical architecture second. Explore export options such as Google Slides or LaTeX, review the visual design, improve colors/layout, and provide speaker bullet content. | Created midterm presentation materials under `docs/presentations/`, reviewed screenshots, improved slide design, and added bullet-only speaker content. |
| Final submission preparation | Check assignment requirements and repository state, identify missing non-app submission items, consolidate the Learning Journal, create a glossary, prepare a final video plan, update README, and document manual GitLab checks. | Created the final submission folder, consolidated this Learning Journal, added glossary/checklist/video plan, updated README links, and preserved assignment-relevant decisions. |
| Final video slides and exports | Build modern LaTeX slides for the final video in the app's visual style, inspect the PDF as screenshots, remove decorative background elements, add a subtle HTW Dresden logo, align slide wording with the video plan, and export all slides as PNG images. | Created and polished the final Beamer slide deck, generated the PDF, performed screenshot-based visual QA, added HTW logo assets, and exported 10 slide PNGs for video editing. |
| Repository hygiene and final push checks | Before submission, scan the repository for profanity, suspicious artifacts, temporary files, local logs, secrets, and local-only Git refs. Also pull/push final changes safely and avoid exposing ignored local files or local checkpoint refs. | Verified tracked files and Git history for obvious issues, identified ignored local files that should not be zipped, anonymized a local path in submission docs, and documented safe GitLab push guidance. |

AI assistance was used for implementation and debugging, but the project decisions were still reviewed against the assignment constraints, local test results, emulator/APK behavior, and the actual repository state. Important prompts, problems, and outcomes are preserved in more detail in `docs/session-summaries/`.
