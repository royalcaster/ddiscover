# Final Submission Checklist

Deadline: June 28, 2026 at 23:59.

## Prepared In Repository

- Learning Journal draft: `docs/submission/development-diary.md`
- AI prompt appendix: included as Appendix A in `docs/submission/development-diary.md`
- Glossary / Glossar: `docs/submission/glossary.md`
- Final video plan/script: `docs/submission/ddiscover-final-video-plan.md`
- Final slides: `docs/submission/presentation/ddiscover-final-slides.pdf`
- Android phone testing notes: `docs/android-device-testing.md`
- GitHub Actions APK workflow: `.github/workflows/android-apk.yml`
- GitLab CI APK job: `.gitlab-ci.yml`

## Manual Checks Before Hand-In

- Verify HTW GitLab project visibility is Private.
- Verify instructors are invited as Maintainers.
- Verify project/group name and URL match the assignment expectations.
- Verify required GitLab CI/CD variables if GitLab APK builds should be used:
  - `EXPO_PUBLIC_CONVEX_URL`
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID`
  - `EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID`
- Commit final repository state using Conventional Commits.
- Push final `main` to HTW GitLab.
- Confirm GitLab `main` contains the same final commit as the local hand-in state.

## Final Verification To Record

Run these before final submission and copy the results into `docs/session-summaries/2026-06-25.md` or a later daily summary:

```bash
npx tsc --noEmit
npm run lint
npm test
```

Also record:

- final APK build source commit,
- APK artifact source (GitHub Actions or GitLab CI),
- physical device smoke test result,
- known limitations, especially temporary favorites/auth behavior if still present.

## Current Notes

- `.artifacts/` contains local APKs, screenshots, and logs. It is ignored and should not be committed.
- `assets/images/map/beer.png` is part of the current app implementation and should be committed with the app changes that reference it.
- Root `CLAUDE.md` was removed because root Markdown is limited to `README.md` and `AGENTS.md`; the same Convex guidance remains in `AGENTS.md`.
