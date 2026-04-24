# DDiscover

## Development Notes

### Repository Documentation Rules

- Every agent must maintain one session summary per calendar day in `docs/session-summaries/`.
- Before solving a problem or making implementation decisions, every agent must review the existing session summaries so prior decisions, known problems, and solutions are not rediscovered or repeated.
- Each session summary must document relevant decisions, problems encountered, and solutions applied.
- Do not create Markdown files outside `docs/`, except for this main `README.md` and `AGENTS.md`.
- Use this `README.md` for important high-level development information that should remain visible at the repository root.
- Keep this `README.md` concise; detailed history belongs in `docs/session-summaries/`.
- Always use Conventional Commits for commit messages.

### Assignment Notes

- DDiscover is an HTW Dresden Mobile Networks APL project.
- Final project submission deadline: June 28, 2026 at 23:59.
- The project requires a Learning Journal with activities, dates, times, approximate durations, and transparent documentation of AI prompts in the appendix.
- Evaluation emphasizes documented code, standardized conventions, appropriate structure and file sizes, useful comments, sensible commit granularity, and a glossary of application-domain terms.

### Stack

- Mobile app: React Native with Expo.
- Backend: Convex, configured through `EXPO_PUBLIC_CONVEX_URL`.
- Authentication: Clerk, configured through `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Auth UX: guest-first; Clerk prebuilt sign-in is embedded in the `Profil` tab, while core discovery remains usable without authentication.
- Event ingestion: Convex action imports the VDSC calendar feed from `https://events.vdsc.de/calendar.json` and upserts events by source key.
- UI styling: React Native Reusables-compatible NativeWind setup with `components.json`, semantic light/dark tokens, and registry-backed UI primitives aligned to the design reference in `docs/design/`.

### Local Development

- Install dependencies with `npm install`.
- Copy `.env.example` to `.env.local` and fill in Convex and Clerk values when those projects are configured.
- Start the Expo development server with `npm start`.
- Run backend and parser tests with `npm test`.

### Android Commands

- List available emulators: `npm run emu:list`
- Start the default emulator: `npm run emu:start`
- Start the known medium phone emulator: `npm run emu:start:medium`
- Enable `adb reverse` for Metro on connected emulators: `npm run emu:reverse`
- Stop running emulators: `npm run emu:stop`
- Start the Expo dev client server: `npm run dev`
- Stop Metro on port 8081: `npm run dev:stop`
- Stop stale Metro-like processes on ports 8081 and 8082: `npm run dev:stop:all`
- Build/install the native Android app: `npm run android`
- Full emulator dev flow: `npm run android:dev`
- Full medium-phone emulator dev flow: `npm run android:dev:medium`
