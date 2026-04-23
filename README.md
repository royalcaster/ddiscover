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
