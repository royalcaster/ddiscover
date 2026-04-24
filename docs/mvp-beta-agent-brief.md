# DDiscover MVP Beta Agent Brief

## Purpose

This brief defines the smallest publishable beta for DDiscover and is written as an execution contract for another implementation agent.

## Product Goal

Ship a very small but working beta to app stores, then iterate in short cycles.

## MVP Scope (v0.1 Beta)

Keep exactly 3 core screens:

1. `Entdecken` (map-based discovery)
2. `Kalender` (upcoming events list)
3. `Profil` (authentication and account entry)

Include exactly 1 authenticated-only feature:

1. cloud-synced favorites (`save/unsave` events or clubs)

## Why This Scope

- Backend ingestion and event/club queries already exist and are usable (`convex/events.ts`, `convex/clubs.ts`, `convex/scraping/vdsc.ts`).
- Clerk auth flow already exists in profile tab (`src/app/profile.tsx`).
- Existing route/favorites flows are mostly preview-based and should be deferred for faster beta shipping.

## User-Facing Definition

### Guest Users

- Can open app and browse map-based discovery and calendar.
- Can open event source links.
- When tapping `save`, they are redirected/prompted to sign in.

### Signed-In Users

- All guest capabilities.
- Can save and unsave favorites.
- Can view saved state reflected in map/list cards.

## Screen Contracts

### 1) Entdecken (Map-Based)

Primary value: spatial exploration.

Required behavior:

- Show an interactive map centered on Dresden.
- Show club markers (or event markers) on map.
- Show a compact bottom list (or bottom sheet) of upcoming events tied to visible markers.
- Tapping marker highlights corresponding list item.
- Tapping list item focuses marker and opens compact detail card.
- Card includes `save` action (auth-gated).

Implementation constraints for MVP speed:

- Use simple marker styling; avoid custom clustering in v0.1.
- If coordinates are missing from backend rows, use deterministic fallback coordinates from a local mapping (temporary, documented).
- Keep one map viewport preset (Dresden center) and avoid geolocation permission dependency for beta.

### 2) Kalender

Primary value: quick upcoming event overview.

Required behavior:

- Show upcoming events sorted by `startsAt` ascending.
- Show day chip/header and event cards.
- Card tap opens source URL (if present).
- Card includes same `save` action with identical auth behavior.

### 3) Profil

Primary value: account entry and session state.

Required behavior:

- Signed-out: Clerk sign-in surface.
- Signed-in: account info + sign out.
- No extra scope in beta (no deep profile management needed).

## Auth-Only Feature Contract: Favorites

### Functional Requirements

- Users can save favorite clubs/events only when authenticated.
- Saved state persists in Convex and survives reinstall/device changes.
- Save/unsave updates UI state quickly (optimistic or near-real-time).

### Data Model (minimum)

Create one table:

- `favorites`
  - `userTokenIdentifier: string` (from `ctx.auth.getUserIdentity()?.tokenIdentifier`)
  - `entityType: "club" | "event"`
  - `clubId?: Id<"clubs">`
  - `eventId?: Id<"events">`
  - `createdAt: number`

Indexes:

- `by_user_and_entity_type`
- `by_user_and_club`
- `by_user_and_event`

Rules:

- Never accept `userId` as function arg.
- Derive identity server-side only.
- Prevent duplicates via unique lookup on indexed user+entity combination before insert.

### Convex API (minimum)

Public mutations/queries:

- `favorites.toggleFavorite`
- `favorites.listMyFavorites`
- `favorites.isFavorited` (or batch variant)

Auth behavior:

- If unauthenticated, mutation throws explicit auth error.

## Navigation Contract

For beta, reduce tabs to 3:

- `Entdecken`
- `Kalender`
- `Profil`

Remove/defer from tab bar:

- `Favoriten`
- `Route`

Notes:

- Keep deferred files if useful, but do not expose unfinished tabs in beta navigation.

## Technical Constraints and Existing Repo Rules

- Follow `AGENTS.md` repository rules.
- Read daily session summaries before implementation decisions.
- Keep markdown additions inside `docs/` only.
- For Convex work, always follow `convex/_generated/ai/guidelines.md`.

## Non-Goals (Explicitly Out of v0.1)

- DVB transit routing integration.
- Personalized route planning engine.
- Push notifications.
- Full map clustering/polylines/advanced overlays.
- In-app event detail deep-link architecture beyond simple source link opening.

## Acceptance Criteria (Beta Ready)

1. App has exactly 3 visible tabs/screens for beta (`Entdecken`, `Kalender`, `Profil`).
2. `Entdecken` is map-based and interactive (markers + tied event list/card).
3. `Kalender` renders upcoming events from Convex backend.
4. Profile sign-in/sign-out works with Clerk in dev build.
5. Save/unsave favorites works only for authenticated users.
6. Favorite state is persisted in Convex and restored after app restart.
7. Guest users can still explore core discovery/calendar flows without sign-in.
8. Typecheck/lint/tests pass for touched areas.

## Recommended Build Order

1. Implement Convex `favorites` table + queries/mutations + tests.
2. Add auth-aware hooks/selectors for favorite state in app layer.
3. Convert `Entdecken` to real map-first UI with marker/list synchronization.
4. Wire favorite actions into `Entdecken` and `Kalender` cards.
5. Reduce tab navigation to 3 screens.
6. Run final QA sweep (guest flow + signed-in flow + persistence checks).

## QA Checklist

- Guest can open app and browse map/list without auth prompt loops.
- Guest tapping `save` gets clear sign-in path.
- Signed-in user can save/unsave both from map card and calendar card.
- App restart keeps saved state.
- No white-screen regression in profile auth surface after tab switching.
- Android dev build works on default emulator `ddiscover_dev_device`.

## Post-Beta Iteration Plan (Not in This Ticket)

1. v0.2: dedicated favorites screen and filters.
2. v0.3: stronger map quality (real geocoding, marker clustering, map controls).
3. v0.4: route/transit integration (DVB).
