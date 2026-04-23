# DDiscover Mobile Tech Stack
Created: 23/04/2026, 13:35:57
Last Updated: 23/04/2026, 15:16:36
---

### User

I hereby announce the topic for the APL in the summer semester of 2026 in Module I760 Mobile Networks. Your topic is

DDiscover

and can be briefly described as follows:

- Smart app for Dresden student clubs
- Automated club & event data via scraping
- Interactive map & centralized calendar
- Real-time DVB public transit integration
- Smart, personalized route planning
- Seamless event discovery & navigation

Is react native + expo + convex + clerk a viable tech stack for this?


---

### Assistant (claude-4.6-sonnet)

<details>
<summary>Reasoning</summary>

The user is asking about a tech stack for a mobile app project. This is a technical question about specific tools and their viability together. Let me think about whether I need to search for this.

React Native + Expo + Convex + Clerk - these are all relatively modern tools. I should search for current compatibility and viability information since these tools evolve rapidly.
</details>

**Yes, absolutely — it's a highly viable and well-proven stack.** Here's the full breakdown:

---

## ✅ React Native + Expo + Convex + Clerk for DDiscover

### Integration Status: Officially Supported & Actively Maintained

All four tools are **designed to work together**. Convex ships a dedicated `ConvexProviderWithClerk` component in `convex/react-clerk`, and there's even an actively maintained community starter (`expo-clerk-convex`, last updated March 2026 with 778 stars) that bootstraps exactly this combination.

---

### Each Tool & Its Role for DDiscover

#### React Native + Expo
- Cross-platform (iOS + Android) from one codebase
- **Expo SDK 54** (current default) or **SDK 55** (released Feb 2026, New Architecture mandatory) both work
- Expo Router for file-based navigation — ideal for your map + calendar + event detail screens
- `expo-location` for GPS (needed for route planning)
- Convex has an official React Native Quickstart guide

#### Convex (Backend + Real-time DB)
- Real-time WebSocket-based queries — perfect for live event updates and the centralized calendar
- Serverless functions (queries, mutations, actions) for club/event logic
- **Cron jobs** built-in → ideal for scheduling periodic web scraping of club websites
- File storage for club logos/images
- TypeScript end-to-end with full type inference
- Official Expo integration: `npx expo install convex`

#### Clerk (Auth)
- **`@clerk/expo` v3.x** (Core 3, released March 2026) — the current version
  - Note: package was renamed from `@clerk/clerk-expo` to `@clerk/expo`
- Supports email/password, social OAuth (Google, Apple, GitHub, etc.)
- Native Google Sign-In (no browser redirect) and native Apple Sign-In
- Free tier: 50,000 monthly active users — more than enough for a student app
- Integrates with Convex via JWT template → Convex validates Clerk tokens server-side

---

### How They Fit Together

```
┌─────────────────────────────────────────┐
│         React Native + Expo             │
│  (Expo Router, Maps, DVB API calls)     │
│                                         │
│  ClerkProvider                          │
│  └─ ConvexProviderWithClerk             │
│      └─ Your app screens               │
└───────────────┬─────────────────────────┘
                │ WebSocket (real-time)
                ▼
┌─────────────────────────────────────────┐
│              Convex Backend             │
│  - Club & event data (DB)              │
│  - Scraping jobs (Cron + Actions)       │
│  - Personalization data                 │
│  - Clerk JWT validation                 │
└─────────────────────────────────────────┘
```

---

### Mapping to DDiscover Features

| Feature | How the Stack Handles It |
|---|---|
| Club & event scraping | Convex **Cron** + **Actions** (HTTP fetch) on a schedule |
| Centralized calendar | Convex real-time queries → live updates across all users |
| Interactive map | `react-native-maps` or `expo-maps` alongside Convex data |
| DVB transit integration | Convex **Actions** call DVB REST API; results cached in DB |
| Personalized route planning | User preferences stored in Convex, queried per-user via Clerk identity |
| Auth / user accounts | Clerk — email, Google, Apple sign-in out of the box |

---

### Things to Be Aware Of

1. **Clerk SDK rename** — use `@clerk/expo` (not `@clerk/clerk-expo`) and `publishableKey` is now a **required** prop on `ClerkProvider` in v3.
2. **Expo SDK 55** requires the New Architecture (mandatory). If you target SDK 55, ensure all native modules you use support it. Clerk v3.1.x fully supports it.
3. **Scraping** runs in Convex **Actions** (not queries/mutations) since they allow network I/O. Be mindful of club website terms of service.
4. **DVB API** — integrate via Convex Actions to avoid exposing API calls client-side and to enable caching.

---

### Verdict

This is a **strong, modern, production-ready stack** for DDiscover. The combination is well-documented, actively maintained (all updated as recently as March–April 2026), has community starter templates, and maps cleanly to every feature in your project brief. Go for it.


---

### User

So I will be able to have 1 repo and from there I can deploy a convex backend and export both android and ios builds via expo?


---

### Assistant (claude-4.6-sonnet)

<details>
<summary>Reasoning</summary>

The user is asking about monorepo structure - whether they can have a single repo that contains both the Convex backend and the Expo app, and deploy/build from there.
</details>

**Yes, exactly.** That's the standard setup. Here's what it looks like:

---

## One Repo, Everything Together

When you run `npx convex dev` inside an Expo project, Convex creates a `convex/` folder **directly inside your Expo repo**. There's no separate backend repo needed.

```text
ddiscover/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Event feed
│   │   ├── map.tsx         # Interactive map
│   │   └── calendar.tsx    # Centralized calendar
│   └── _layout.tsx
├── components/
├── convex/                 # ← Convex backend lives HERE
│   ├── schema.ts           # DB schema
│   ├── clubs.ts            # Queries & mutations
│   ├── events.ts
│   ├── scraping.ts         # Actions (HTTP scraping, DVB API)
│   └── crons.ts            # Scheduled jobs
├── assets/
├── app.json                # Expo config
├── package.json
└── .env.local              # CONVEX_URL, CLERK keys
```

---

## The Two Separate Deployment Targets

### 1. Convex Backend → Cloud
```bash
npx convex deploy
```
- Pushes everything in `convex/` to Convex's cloud
- Gives you a hosted backend URL (e.g. `https://happy-fox-123.convex.cloud`)
- Completely separate from your mobile app build
- Can be deployed from CI/CD (GitHub Actions, etc.)

### 2. Mobile App → Android & iOS
```bash
# Development builds
npx eas build --profile development --platform all

# Production builds
npx eas build --profile production --platform all
```
- EAS (Expo Application Services) handles the build in the cloud
- Outputs `.apk`/`.aab` for Android and `.ipa` for iOS
- No Mac required for iOS builds (EAS handles it)
- Submit directly to stores: `npx eas submit`

---

## The Key Insight

Convex and Expo are **independently deployed** but **live in the same repo**:

```
Same Git Repo
     │
     ├─── convex deploy ──────→ Convex Cloud (backend)
     │                               ↑
     └─── eas build ──────────→ Mobile App (talks to backend via URL)
```

Your `.env.local` / EAS environment variables wire them together:

```bash
EXPO_PUBLIC_CONVEX_URL=https://happy-fox-123.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

---

## Dev Workflow Day-to-Day

```bash
# Terminal 1 — starts Convex backend locally + watches for changes
npx convex dev

# Terminal 2 — starts Expo dev server
npx expo start
```

That's it. Both run locally, hot-reload on changes, single repo to manage.


---
