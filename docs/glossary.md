# DDiscover Glossary / Glossar

This glossary explains the main domain and technical terms used in the DDiscover project.

| Term | Meaning in this project |
| --- | --- |
| DDiscover | Mobile app for discovering Dresden student club events, viewing clubs on a map, opening event details, and planning routes. |
| Student club | A Dresden student club or venue imported from the VDSC event ecosystem. Current app wording uses "student club" for the imported location category. |
| Club | Internal data model name for a student club location. The UI uses "student club" where the meaning should be clear to users. |
| Event | A planned party, concert, quiz, bar evening, or similar activity connected to a student club. Events are imported from the VDSC feed. |
| VDSC | Verband Dresdner Studentenclubs. The project uses VDSC event data as the main source for student club events. |
| VDSC calendar feed | Structured JSON source at `https://events.vdsc.de/calendar.json` used for event import instead of scraping HTML pages. |
| Convex | Backend-as-a-service used for database tables, server functions, scheduled imports, tests, and storage-backed event images. |
| Convex Storage | Convex file storage used to persist scraped event images and return app-readable image URLs. |
| Clerk | Authentication provider used for Google sign-in and user sessions. DDiscover keeps browsing guest-first and uses auth mainly for saved favorites. |
| Favorite | A saved club or event. The UI supports the concept, but realtime Convex favorites are temporarily disabled in APK context until Clerk/Convex auth is fully stable. |
| Discover map | Main app screen where student clubs are shown as markers and selected club details appear in the bottom sheet. |
| Bottom sheet | Draggable panel over the Discover map that shows the selected student club, next event, and overflow action to the calendar. |
| Route planning | Event-detail feature that requests a public transport route from the user's area to the event location. |
| DVB | Dresdner Verkehrsbetriebe. The app uses DVB route data through `dvbjs` for public transport planning. |
| `dvbjs` | JavaScript library used by the Convex action that plans DVB routes for event details. |
| Geocoding | Converting an address or club name into latitude/longitude coordinates so locations can be shown on the map. |
| Nominatim | OpenStreetMap geocoding service used during imports to resolve location coordinates when reviewed coordinates are not already available. |
| Geocoding cache | Convex table that stores previous Nominatim lookup results to avoid repeating external requests. |
| MapLibre | Map rendering library used in the native app for the Discover map. It replaced Google Maps for better styling and dark-mode control. |
| Expo | React Native toolchain used for app development, native prebuilds, dev client, and Android builds. |
| Expo dev client | Locally installed development build used instead of Expo Go when native modules are required. |
| APK | Android package file used to install and test the app on a physical Android device. |
| GitHub Actions APK workflow | Manual CI workflow used to build an internal APK artifact for phone testing. |
| GitLab CI APK job | Manual HTW GitLab CI job prepared for APK builds in the required submission repository. |
| Learning Journal | Required assignment document describing project activities with date, time, duration, problems, solutions, and AI support. |
| Session summary | Daily technical log in `docs/session-summaries/` used as detailed evidence for the Learning Journal and future agents. |
