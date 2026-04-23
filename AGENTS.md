# Repository Instructions for All Agents

These instructions apply to every AI agent, automation, and human collaborator working in this repository. Treat this file as the shared operating contract for the project, not as instructions for one specific tool.

## Session Summaries

- Every agent must maintain one session summary per calendar day in `docs/session-summaries/`.
- Before solving a problem or making implementation decisions, every agent must review the existing session summaries so prior decisions, known problems, and solutions are not rediscovered or repeated.
- Each session summary must document relevant decisions, problems encountered, and solutions applied.
- Update the current day's summary as work progresses instead of creating multiple summary files for the same day.
- Write summaries so another agent can understand what happened without reading the full chat transcript.

## Markdown File Rules

- Do not create Markdown files outside `docs/`, except for:
  - `README.md`
  - `AGENTS.md`
- Update `README.md` throughout development with important high-level development information that should remain visible at the repository root.
- Keep `README.md` concise. Do not add every implementation detail, chat decision, or troubleshooting note; put detailed history in `docs/session-summaries/`.

## Assignment Constraints

- Treat the DDiscover project as an HTW Dresden Mobile Networks APL project with final submission due on June 28, 2026 at 23:59.
- Keep the source code suitable for HTW's internal GitLab. The required project visibility is private, and instructors should be invited as maintainers when the GitLab project/group is configured.
- Preserve important information needed for the required Learning Journal:
  - Record project activities with date, time, and approximate duration when the user asks for journal support or when work performed here materially affects the project.
  - Record AI-assisted work transparently enough that prompts and outcomes can be summarized in the Learning Journal appendix.
- Keep development decisions compatible with the final presentation/video requirements:
  - project context
  - overview of different parts
  - deep dives into selected parts
  - difficulties encountered
  - lessons learned

## Engineering Quality Rules

- Use standardized code conventions across the entire project, including indentation, bracket style, variable naming, and method naming.
- Keep package and folder structure intentional. Prefer a clear horizontal layer, vertical feature, MVC-like, or similarly coherent structure rather than ad hoc placement.
- Keep file sizes appropriate. Split files when they become difficult to navigate or mix unrelated responsibilities.
- Add inline comments only where they help understanding, and keep them close to non-obvious logic.
- Document code with JSDoc or the local equivalent for public APIs, shared modules, complex functions, and code that is important for evaluation.
- Maintain sensible commit granularity when asked to commit: neither broad unrelated commits nor tiny noisy commits.
- Maintain a glossary of important DDiscover domain terms and concepts in project resources or documentation when domain terminology stabilizes.
- When adding features, preserve evidence useful for the final evaluation: design decisions, problems, solutions, and lessons learned should be captured in the daily session summary.

## Commit Rules

- Always use Conventional Commits for commit messages.
- Use the format `<type>(optional-scope): <description>`.
- Prefer standard types such as `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, and `revert`.
- Keep each commit focused on one coherent change set.
