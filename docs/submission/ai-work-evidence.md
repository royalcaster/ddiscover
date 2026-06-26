# AI Work Evidence Index

## Purpose

This file explains where the AI-assisted work for DDiscover is documented and what should be submitted. It is an index, not a raw transcript export.

The assignment requires AI prompts to be mentioned in the appendix of the Learning Journal. The best submission format is therefore:

- submit `docs/submission/development-diary.md` as the Learning Journal,
- use Appendix A in that file as the AI prompt and outcome appendix,
- keep `docs/session-summaries/` in the repository as detailed supporting evidence,
- do not submit raw Codex transcript logs unless an examiner explicitly asks for them.

## Evidence Found Locally

All project work found on this machine points to this repository directory:

`C:\Users\klaus\Documents\GitHub\ddiscover`

Local Codex storage also contains raw conversation and tool traces:

| Source | What it contains | Finding |
| --- | --- | --- |
| `%USERPROFILE%\.codex\sessions\` | JSONL rollout files with user prompts, assistant responses, tool calls, and tool outputs. | 88 total session files; 33 files/history entries mention `ddiscover` or this repo path. |
| `%USERPROFILE%\.codex\history.jsonl` | Prompt/history excerpts. | Contains DDiscover-related prompts and terminal-output excerpts. |
| `%USERPROFILE%\.codex\state_5.sqlite` | Thread metadata such as cwd, title, first user message, rollout path, timestamps. | 19 threads are directly tied to this repo working directory. |
| `%USERPROFILE%\.codex\logs_2.sqlite` | Runtime/tool logs. | Large local log database; useful only as backup evidence, not as a clean hand-in document. |

These raw files are local machine evidence. They should not be committed or submitted as-is because they can include local paths, terminal output, environment details, and unrelated troubleshooting noise.

## Repository Evidence

| File or folder | Role in submission |
| --- | --- |
| `docs/submission/development-diary.md` | Main Learning Journal. It includes date, time, approximate duration, activities, problems, solutions, and AI support. Appendix A contains the required AI prompt/outcome summary. |
| `docs/session-summaries/` | Detailed daily development records used to build the Learning Journal. These preserve decisions, problems, fixes, and validation results. |
| `docs/submission/glossary.md` | Assignment glossary / Glossar with domain and technical terms. |
| `docs/submission/final-submission-checklist.md` | Practical hand-in checklist and remaining manual GitLab checks. |
| `docs/submission/ddiscover-final-video-plan.md` | Final presentation/video plan and speaker script. |
| `docs/submission/presentation/` | Final LaTeX slide source, PDF, build script, and logo assets. |
| Git history | Chronological implementation evidence with Conventional Commit messages. |

## Recommended AI Appendix Format

Use the already prepared Appendix A in the Learning Journal. It is better than a raw chat export because it is readable, maps prompts to outcomes, and matches the assignment wording.

Recommended columns:

| Column | Meaning |
| --- | --- |
| Area | Work area, for example Android development, VDSC ingestion, CI/APK builds, or submission preparation. |
| Prompt / task given to AI | Short paraphrase of what was asked. Exact raw wording is not necessary unless explicitly required. |
| Outcome | What changed, what was decided, or what was verified. |

The detailed daily entries above the appendix provide the required date, time, duration, activities, problems, and solutions.

## High-Level AI Work Map

| Date | Main AI-supported work |
| --- | --- |
| 2026-04-23 | Repository rules, Expo/Convex/Clerk setup, VDSC import baseline, Android troubleshooting, first UI shell. |
| 2026-04-24 | Guest-first auth, Google sign-in routing, MVP scope, favorites/auth foundation, development workflow cleanup. |
| 2026-04-25 | Map-screen debugging, Android diagnostics, geocoding cache, Nominatim integration, design screenshots. |
| 2026-04-26 | Internal Convex cleanup helper for development data resets. |
| 2026-05-17 | README startup workflow and local development commands. |
| 2026-05-18 | Contributor onboarding, fresh-clone setup, Android/prebuild notes, commit preparation. |
| 2026-05-20 | Midterm presentation structure and speaker bullets. |
| 2026-05-31 | MVP roadmap, curated club locations, favorites/profile polish, calendar and MapLibre map work. |
| 2026-06-15 | Event detail screen, route planning, GitLab transfer planning, assignment compliance audit. |
| 2026-06-16 | Map controls, emulator performance tuning, live Convex event import verification. |
| 2026-06-23 | GitHub/GitLab APK build workflows, config validation, Android device testing documentation. |
| 2026-06-24 | APK-only Convex debugging, URL normalization, event image scraping/storage, daily import cron. |
| 2026-06-25 | Final app polish, Learning Journal consolidation, AI appendix, glossary, final video plan, repository cleanup. |
| 2026-06-26 | Final submission folder organization, slide polish, remote push verification, AI evidence audit. |

## Submission Decision

Submit the cleaned documents, not raw transcripts:

1. `docs/submission/development-diary.md`
2. `docs/submission/glossary.md`
3. final video and, if useful, `docs/submission/ddiscover-final-video-plan.md`
4. final slide PDF from `docs/submission/presentation/ddiscover-final-slides.pdf`

Keep this file in the repository as an audit aid. If an examiner asks for more proof of AI use, point to `docs/session-summaries/` first. Only export raw Codex JSONL logs if they specifically request raw conversations.
