# DDiscover Final Video Plan

Target length: 10 minutes.

Audience: Mobile Networks course participants and instructors. The video should explain what was built, why it was built this way, where the hard problems were, and what was learned.

Presenter split:

- Philip Popplutz: product framing, user problem, app concept, and screen walkthrough.
- Gabriel Pechstein: technical stack, backend, authentication, data import, testing, CI, and runtime problems.

## Slide Plan

### 1. Title And Project Context (0:00-0:45)

Owner: Philip

- DDiscover: mobile discovery app for Dresden student club events.
- Course context: HTW Dresden Mobile Networks APL project.
- Product goal: one mobile-first way to find events, see where they happen, and plan how to get there.

Speaker notes:
"DDiscover is our APL project for Mobile Networks. The idea is simple: students should be able to open one app, see which Dresden student clubs have events, check the details, and decide how to get there. We focused on a realistic mobile use case instead of a generic event list, because the important moment is usually quick: what is happening tonight, where is it, and is it worth going there?"

### 2. Problem And Product Idea (0:45-1:45)

Owner: Philip

- Problem: event information is split across club pages, feeds, posts, and word of mouth.
- Users often care about place, time, and route, not only an event list.
- Product answer: a map-first mobile flow for place, time, details, and public transport.
- MVP focus: Discover, Calendar, Event Details, route planning, and Profile.

Speaker notes:
"The problem is not that events do not exist. The problem is that they are scattered across club pages, social posts, feeds, and word of mouth. For students, the useful questions are: what is happening near me, when is it happening, and how do I get there? That is why the app starts with discovery instead of an admin-style list. The MVP is intentionally narrow: map, calendar, event details, route planning, and a profile area for personal features."

### 3. App Screen Overview (1:45-3:20)

Owner: Philip

- Discover map with student club markers.
- Pull-up drawer with selected club, next event, website, share, and favorite actions.
- Calendar with imported upcoming events and date-based browsing.
- Event detail screen with image, club/location context, source link, and DVB route planning.
- Profile area for sign-in, settings, language/theme, and favorites.

Speaker notes:
"The first screen is intentionally map-first because location matters for this use case. The drawer gives quick context without leaving the map, including the selected club, the next event, a source link, sharing, and favorites. The calendar is the second main entry point for users who already know they want to browse by date. Event details then bring together the image, time, location, source, and route planning. The profile area is where sign-in, language, theme, and saved favorites belong, so browsing can stay guest-first."

Handoff to Gabriel:
"That is the user-facing product. Gabriel will now explain the technical system behind it."

### 4. Technical Stack And System Shape (3:20-4:25)

Owner: Gabriel

- React Native + Expo for the mobile app and native Android builds.
- Convex for database, backend functions, scheduled imports, and file storage.
- Clerk for authentication and Google sign-in.
- MapLibre for the native map.
- DVB, Nominatim, and VDSC as external data/service inputs.

Speaker notes:
"The app is a React Native client built with Expo, because we needed a real mobile UI and native Android builds for testing. Convex owns the backend side: database tables, functions, cron imports, public HTTP reads, and event image storage. Clerk handles authentication and Google sign-in. For maps we use MapLibre, and for external data we integrate the VDSC event feed, Nominatim geocoding, and DVB route planning. The main design idea is that the mobile app stays thin while Convex handles data normalization and service boundaries."

### 5. Backend And Import Pipeline (4:25-5:40)

Owner: Gabriel

- VDSC JSON feed is used instead of fragile HTML scraping.
- Parser normalizes external event data before it reaches the database.
- Convex upsert avoids duplicate imports through source/source key fields.
- Cron imports data every 24 hours.
- Event images are scraped from event detail metadata and stored in Convex Storage.

Speaker notes:
"The importer is designed to be repeatable. A key decision was to avoid browser scraping in the core path. The VDSC page exposes a structured JSON calendar feed, so the import is simpler, faster, and much easier to test. The parser normalizes fields before they reach the database, and the upsert uses a source key so running the importer again updates existing events instead of creating duplicates. Event images are stored in Convex Storage, which keeps the app independent from hotlinking and makes generated image URLs available to the mobile client."

### 6. Auth, Favorites, And User Data (5:40-6:35)

Owner: Gabriel

- Clerk provides Google sign-in in the profile flow.
- Convex verifies authenticated favorites through Clerk JWTs.
- Favorites are saved per user account.
- APK runtime auth and Convex communication required extra debugging.
- User-facing error messages hide provider details, while technical details stay in logs.

Speaker notes:
"Authentication is deliberately not required for browsing. Users can use the map, calendar, and event details as guests, which keeps the first experience lightweight. Sign-in becomes relevant for personal features like favorites. Clerk provides the user session, and Convex verifies favorite mutations through Clerk JWTs, so saved data belongs to the signed-in account. The complicated part was the Clerk-to-Convex handoff in standalone APK builds, because local development and installed APK behavior were not always the same. That is why this part needed real device testing and careful error handling."

### 7. Maps, Location, And Native Runtime Problems (6:35-7:35)

Owner: Gabriel

- Club coordinates prefer reviewed Convex rows first.
- Curated fallback coordinates exist for MVP reliability.
- Nominatim geocoding is cache-first to avoid repeated external calls.
- MapLibre native layers are used for performant marker rendering.
- APK-only Convex data loading bugs required inspecting built config and device logs.

Speaker notes:
"For maps, one wrong coordinate is immediately visible to the user. Geocoding helps, but it is not reliable enough as the only source for a student-facing MVP, so reviewed coordinates are preferred and curated fallbacks keep known clubs usable. Nominatim is used cache-first so we do not repeatedly call an external service for the same lookup. Another hard problem was that Convex data loaded locally but failed in one standalone APK build. The final causes were runtime configuration and URL normalization, so we had to inspect the built APK, device logs, and the actual URLs created at runtime."

### 8. Testing, CI, And Submission Builds (7:35-8:35)

Owner: Gabriel

- Backend/parser logic is covered with Vitest and Convex tests.
- TypeScript and lint are used as regular validation gates.
- Manual GitHub Actions APK build supports phone testing.
- Manual GitLab CI APK job is prepared for HTW GitLab.
- Build config validation checks required public env values before Android build.

Speaker notes:
"Testing is split by risk. Parser and backend behavior are covered with Vitest and Convex tests, currently 19 tests around parsing, imports, geocoding, favorites, and image handling. TypeScript and lint catch integration mistakes before they become runtime issues. For actual mobile behavior we needed APKs, because Expo Go was not enough for the native modules and the dev-client workflow. The CI workflow makes APK generation repeatable, and the build configuration checks fail early if required public values are missing. The manual phone loop was still important: build, install, inspect logs, and repeat."

Handoff to Philip:
"After the technical side, Philip will summarize the final product state and lessons from the user perspective."

### 9. Difficulties And Lessons Learned (8:35-9:30)

Owner: Philip starts, Gabriel adds technical detail

- Philip:
  - Product scope had to stay focused around the real discovery loop.
  - Map interaction and drawer usability needed repeated refinement.
  - A mobile app feels unfinished quickly if small interactions are slow or visually inconsistent.
- Gabriel:
  - Most technical risk came from system boundaries: Android tooling, CI, auth handoff, external APIs, and APK runtime behavior.
  - Device/runtime validation was necessary because local development was not enough.

Speaker notes:
Philip: "On the product side, the important lesson was to keep the flow focused. Discover, calendar, event details, and route planning are enough for a complete first version. It was tempting to add more social features immediately, but the app first had to make the core discovery loop feel useful and understandable. Small details like drawer behavior, map interaction, empty states, and theme consistency mattered more than expected."

Gabriel: "On the technical side, the hardest problems were not normal screen code. They were boundaries between services and runtimes: Android, CI, Convex, Clerk, and external APIs. A feature could work in local development and still fail in an installed APK, so logs, build artifacts, and real-device checks became part of the workflow. The main lesson is that mobile projects need validation at the same runtime where users will actually run the app."

### 10. Final State And Outlook (9:30-10:00)

Owner: Philip, with one closing technical sentence by Gabriel if needed

- Current project: map discovery, calendar, event details, images, route planning, auth shell, favorites, CI APK builds.
- Future product work: more location categories, stronger filtering, better personalization, and public-release polish.
- Future technical work: harden auth/favorites for production use and improve release pipeline.

Speaker notes:
Philip: "The final result is a working end-to-end student club discovery app. A user can find clubs on the map, browse events by date, open details, save favorites after sign-in, adjust profile settings, and plan a route. The next product steps would be a beta release, verified club content and logos, stronger location data, and more social features such as friends, in-app sharing, and interest counters."

Gabriel optional closing: "The next technical step would be production hardening: release signing, official API access where needed, stronger monitoring, and more runtime testing on real devices. We would also harden the auth and favorites path for production use before a wider release."

## Recording Checklist

- Philip records/screenshares:
  - product intro,
  - Discover map and drawer,
  - Calendar,
  - Event detail and route planning,
  - Profile/settings/favorites from the user perspective.
- Gabriel records/screenshares:
  - Convex events/clubs tables or import functions,
  - authentication/favorites path at a high level,
  - tests or test command output,
  - GitHub/GitLab APK workflow and artifact.
- Mention the Learning Journal and AI appendix as part of submission transparency.
- Keep demos short; the video should explain decisions, not only click through screens.
