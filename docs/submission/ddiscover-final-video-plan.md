# DDiscover Final Video Plan

Target length: 10 minutes.

Audience: Mobile Networks course participants and instructors. The video should explain what was built, why it was built this way, where the hard problems were, and what was learned.

## Slide Plan

### 1. Title and Project Context (0:00-0:45)

- DDiscover: mobile discovery app for Dresden student club events.
- Problem: student club events are spread across sources and are not easy to explore by location, time, and route.
- Goal: one mobile-first view for finding events, seeing where they happen, and navigating there.

Speaker notes:
"DDiscover is my APL project for Mobile Networks. The idea is simple: students should be able to open one app, see which student clubs have events, check the details, and plan how to get there."

### 2. User-Facing App Overview (0:45-2:00)

- Discover map with student club markers.
- Bottom sheet with selected club and next event.
- Calendar with upcoming imported events.
- Event detail screen with image, club/location context, and route planning.
- Profile/auth area for sign-in and future saved favorites.

Speaker notes:
"The first screen is intentionally map-first. For this use case, location is more useful than a generic feed. The calendar is the second main entry point for users who already know they want to browse by date."

### 3. Architecture Overview (2:00-3:10)

- React Native + Expo for the mobile app.
- Convex for database, functions, scheduled imports, and storage.
- Clerk for authentication.
- MapLibre for the map.
- VDSC feed, Nominatim, and DVB as external data/service inputs.

Speaker notes:
"The architecture is small but complete. The app is a React Native client, Convex owns the data and backend functions, and external services are only used behind controlled backend actions where that makes sense."

### 4. Deep Dive: Event Import Pipeline (3:10-4:40)

- VDSC JSON feed is used instead of fragile HTML scraping.
- Parser normalizes external event data.
- Convex upsert avoids duplicate imports using source/source key.
- Cron imports data every 24 hours.
- Event images are scraped from event detail metadata and stored in Convex Storage.

Speaker notes:
"A key decision was to avoid browser scraping. The VDSC page uses a structured JSON calendar feed, so the import is simpler, faster, and easier to test. The importer is idempotent: running it again updates existing events instead of duplicating them."

### 5. Deep Dive: Location and Map Reliability (4:40-5:55)

- Club coordinates come from reviewed Convex rows first.
- Curated fallback coordinates exist for MVP reliability.
- Nominatim geocoding is cache-first to avoid repeated external calls.
- MapLibre native layers are used for performant marker rendering.

Speaker notes:
"Geocoding was useful, but not reliable enough as the only source for an MVP. One wrong club location is very visible on a map. That is why reviewed coordinates are preferred, with geocoding as enrichment instead of the only truth."

### 6. Deep Dive: APK Runtime Issues (5:55-7:05)

- Local dev build and standalone APK behaved differently.
- Convex realtime WebSocket path was problematic in APK context.
- Public data loading was isolated through Convex HTTP queries.
- A trailing slash in the CI Convex URL caused `//api/query`; URL normalization fixed it.

Speaker notes:
"The hardest bug was not a TypeScript problem. The app worked locally but failed in the APK. The final root causes were runtime configuration and network behavior, so logging and inspecting the built APK config became necessary."

### 7. CI and Device Testing (7:05-7:50)

- Manual GitHub Actions APK build for phone testing.
- Manual GitLab CI APK job prepared for HTW GitLab.
- Build config validation checks required public env values before Android build.
- Physical device testing used sideloaded APKs and ADB logs.

Speaker notes:
"Because Expo Go was not enough for the native modules, the project needed APK builds. The CI workflow makes this repeatable and catches missing public configuration before waiting for the full Android build."

### 8. Difficulties (7:50-8:50)

- Android emulator and ADB stability.
- Expo SDK/dev-client setup.
- Clerk and Convex auth handoff for favorites.
- APK-only Convex data loading bugs.
- Map marker rendering and bottom-sheet interaction polish.

Speaker notes:
"Most time was not spent on the happy-path UI. It was spent on making the development and runtime environment predictable enough to trust the app on a real device."

### 9. Lessons Learned (8:50-9:40)

- Prefer structured data feeds over scraping rendered websites.
- Test native mobile behavior on APKs early.
- Keep external service URLs normalized and validated in CI.
- Use reviewed data for user-visible location accuracy.
- Record decisions and root causes while working, not at the end.

Speaker notes:
"The biggest lesson is that mobile projects fail at the boundaries: native tooling, CI config, auth handoff, external APIs, and device runtime behavior. Those parts need explicit validation, not assumptions."

### 10. Final State and Outlook (9:40-10:00)

- Current project: map discovery, calendar, event details, images, route planning, auth shell, CI APK builds.
- Future work: fully re-enable cloud-synced favorites, add more location categories, improve filtering, and harden public release requirements.

Speaker notes:
"The final result is a working end-to-end student club discovery app. The remaining work is mainly product hardening: favorites auth, richer filters, and public-release polish."

## Recording Checklist

- Show the app on Android: Discover map, bottom sheet, Calendar, Event detail, Route section, Profile.
- Show Convex briefly: events/clubs tables or import functions.
- Show CI briefly: APK workflow/job and artifact.
- Mention the Learning Journal and AI appendix as part of submission transparency.
- Keep demos short; the video should explain decisions, not only click through screens.
