# Development Diary (Learning Journal Basis)

## Purpose

This document tracks project activities in a format aligned with the assignment requirements for the Learning Journal:

- date
- time window
- approximate duration
- concrete engineering work
- encountered problems and applied solutions
- transparent AI-assisted work notes

The detailed chronology is complemented by the daily technical notes in `docs/session-summaries/`.

## Entry Template

### YYYY-MM-DD

- Time: `HH:MM-HH:MM`
- Duration: `Xh Ym`
- Activities:
  - ...
- Problems / Risks:
  - ...
- Decisions / Outcomes:
  - ...
- AI Support (for appendix traceability):
  - Prompt intent: ...
  - Outcome: ...

## Entries

### 2026-04-23

- Time: `16:00-23:40`
- Duration: `~7h 40m`
- Activities:
  - Completed Convex event-ingestion vertical slice (VDSC JSON import, deduplication, upsert pipeline, parser + backend tests).
  - Refined Android emulator workflow and project scripts (`android:dev`, emulator management, Metro stop/reverse helper commands).
  - Migrated UI foundation to a `react-native-reusables`-compatible setup (theme tokens, generated primitives, tab shell redesign).
  - Implemented first product-aligned navigation shell (`Entdecken`, `Kalender`, `Favoriten`, `Route`, `Profil`) and iterated on screen density/layout.
- Problems / Risks:
  - Android build reproducibility issues (SDK path, AsyncStorage dependency mismatch, Metro/port conflicts).
  - Initial UI output diverged structurally from design references.
- Decisions / Outcomes:
  - Adopted focused, separate commits by concern (Android scripting fixes, backend ingestion, UI foundation, UI redesign).
  - Prioritized a map-first/navigation-first product shell before deeper feature screens.
- AI Support (for appendix traceability):
  - Prompt intent: diagnose Android dev-build failures and migrate from prototype UI to long-term maintainable architecture.
  - Outcome: stable local scripts, verified Convex ingestion flow, and a maintainable UI baseline for further design refinement.

### 2026-04-24

- Time: `00:00-02:10`
- Duration: `~2h 10m`
- Activities:
  - Switched default emulator target to `ddiscover_dev_device` across startup scripts.
  - Integrated Clerk login UX in the `Profil` tab with the prebuilt Clerk auth component.
  - Added dedicated settings route and moved theme controls out of profile content.
  - Added custom Google sign-in trigger that still activates Clerk-managed sessions.
  - Performed a full repo/docs scan to define a smallest-possible beta MVP scope and feature cut strategy.
- Problems / Risks:
  - Clerk native auth surface could become white after tab switches (lifecycle instability in embedded native view).
  - Metro/Babel configuration regression caused temporary Android bundle failure.
  - Current app shell includes preview/mock content in multiple tabs, risking scope creep before first store beta.
- Decisions / Outcomes:
  - Kept guest-first access to core app features; authentication remains opt-in from profile.
  - Added focused lifecycle remount logic for signed-out auth surface and corrected Babel setup.
  - Added `dev:stop:all` to clear stale processes on ports `8081` and `8082`.
  - Chosen MVP direction: 3-screen beta (`Entdecken`, `Kalender`, `Profil`) plus one authenticated-only feature (cloud-synced favorites), while deferring route/transit and broader personalization.
  - Authored a dedicated implementation handoff brief for another agent at `docs/mvp-beta-agent-brief.md`.
- AI Support (for appendix traceability):
  - Prompt intent: integrate Clerk according to best practices while preserving non-authenticated usage.
  - Outcome: profile-tab-based auth entry, settings split, and Clerk session-aware Google sign-in flow.
  - Prompt intent: identify a minimal first-beta scope that can ship quickly and iterate safely.
  - Outcome: concrete screen/feature cut tied to already-implemented backend capabilities and a single auth-gated value feature.
  - Prompt intent: produce an execution-ready MVP description for another agent with explicit contracts and acceptance criteria.
  - Outcome: detailed map-based MVP brief with screen behavior, Convex favorites contract, phased build order, and QA checklist.
