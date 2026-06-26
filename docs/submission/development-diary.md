# Development Diary / Learning Journal

## Purpose

This document is the submission-ready Learning Journal basis for DDiscover. It consolidates the daily session summaries from `docs/session-summaries/` into the required format: date, time, approximate duration, activities, problems, solutions, and AI support. The session summaries remain the detailed technical evidence.

## Project Context

DDiscover is an HTW Dresden Mobile Networks APL project. The app helps students discover Dresden student club events, see clubs on a map, open event details, and plan public transport routes. The implementation uses React Native with Expo for the mobile app, Convex for backend data and scheduled imports, Clerk for authentication, MapLibre for the map, and DVB route data for navigation support.

## Entries

### 2026-04-23

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

The project used AI assistance as a development support tool. The AI was asked to inspect the repository, propose implementation steps, modify code or documentation, run local validation where possible, and record the outcomes in daily session summaries. The prompts below are paraphrased from the development sessions and grouped by work area.

| Area | Prompt / task given to AI | Outcome |
| --- | --- | --- |
| Repository rules | Create repo-local rules from the assignment and make them visible to future agents. | Added `AGENTS.md`, README notes, session summary rules, Conventional Commit rules, and assignment constraints. |
| Initial stack setup | Initialize React Native/Expo, Convex, and Clerk in focused steps. | Created the app baseline, providers, config files, generated Convex bindings, and verified with TypeScript/lint checks. |
| Android development | Diagnose Expo Go, ADB, emulator, Metro, and Android build failures. | Moved development to emulator/dev-client workflow, added helper scripts, fixed SDK/env issues, and documented commands. |
| VDSC ingestion | Port the old event scraper to Convex and prefer static/fetch sources over browser scraping. | Found the VDSC JSON feed, implemented parser/import/upsert logic, added tests, and verified dry-run/live imports. |
| Backend data quality | Normalize clubs, protect reviewed club records, and add geocoding. | Added canonical club handling, reviewed coordinate strategy, geocoding cache, Nominatim helper, and regression tests. |
| Product scope | Define the smallest useful beta and avoid scope creep. | Produced the MVP beta brief with map discovery, calendar, profile, and authenticated favorites as the core. |
| UI implementation | Redesign the app toward the provided mobile nightlife mockup. | Built a five-tab app shell, map-first Discover screen, themed calendar/profile surfaces, and later MapLibre-based map UI. |
| Authentication | Integrate Google sign-in through Clerk while keeping guest access. | Added profile-based auth, SSO callback handling, config validation, and safer signed-out/favorite prompts. |
| Favorites | Implement favorite behavior and debug Clerk/Convex auth mismatch. | Added initial favorites backend/UI, then temporarily disabled realtime favorites in APK context when Convex WebSocket auth was unreliable. |
| Route planning | Use `dvbjs` to add public transport planning to event details. | Added Convex route-planning action and event-detail route UI with walking/transit legs. |
| CI/APK builds | Create phone-testable APK builds through GitHub Actions and GitLab CI. | Added manual APK workflows/jobs, prebuild steps, artifact documentation, and public config validation. |
| APK runtime debugging | Investigate why Convex data loaded locally but not in APKs. | Found unstable effect dependencies, WebSocket 404 behavior, and trailing slash URL bug; fixed public HTTP query loading and URL normalization. |
| Event images | Scrape and store one event image per imported VDSC event. | Added metadata extraction, Convex Storage persistence, query-time image URLs, UI rendering, and tests. |
| Submission preparation | Review missing final submission items and prepare what can be done locally. | Consolidated this Learning Journal, created glossary and final video plan, updated README, ignored local artifacts, and documented manual GitLab checks. |

AI assistance was used for implementation and debugging, but the project decisions were still reviewed against the assignment constraints, local test results, and the actual repository state. Important prompts, problems, and outcomes are preserved in more detail in `docs/session-summaries/`.
