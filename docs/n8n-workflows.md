# n8n Workflows

DDiscover keeps n8n workflow exports in `n8n/workflows/` so ingestion automation can be versioned with the app and backend.

For Raspberry Pi 5 self-hosting, use `docs/n8n-raspberry-pi.md`.

## Workflows

- `ddiscover-webpage-llm-ingestion.json`
  - Scheduled/manual workflow for configured venue or event pages.
  - Fetches each page, cleans HTML, asks an LLM for strict JSON extraction, normalizes timestamps, and posts candidates to Convex.
- `ddiscover-google-places-bootstrap.json`
  - Manual workflow for bootstrapping Dresden nightlife venue candidates from Google Places Text Search.
  - Posts venue candidates to Convex for review before publishing.

## Required n8n Environment Variables

- `DDISCOVER_CONVEX_SITE_URL`: Convex site URL, for example `https://your-deployment.convex.site`.
- `DDISCOVER_INGESTION_TOKEN`: bearer token matching Convex `DDISCOVER_INGESTION_TOKEN`.
- `OPENAI_API_KEY`: API key for the LLM extraction workflow.
- `DDISCOVER_OPENAI_MODEL`: optional model name, default `gpt-4.1-mini`.
- `GOOGLE_PLACES_API_KEY`: API key for Google Places bootstrap.
- `DDISCOVER_N8N_SOURCES_JSON`: optional JSON array of webpage/calendar sources for the LLM workflow.
- `DDISCOVER_GOOGLE_PLACES_QUERIES_JSON`: optional JSON array of Google Places text queries.

Example `DDISCOVER_N8N_SOURCES_JSON`:

```json
[
  {
    "sourceKey": "objekt-klein-a-events",
    "name": "Objekt klein a events",
    "sourceType": "calendar_page",
    "url": "https://objektkleina.com/events"
  }
]
```

Example `DDISCOVER_GOOGLE_PLACES_QUERIES_JSON`:

```json
[
  "night club in Dresden Germany",
  "bar with live music in Dresden Germany",
  "event venue nightlife Dresden Germany"
]
```

## Deployment Path

Yes, these workflow JSON files can later be deployed from GitHub Actions.

Recommended future CI shape:

1. Store `N8N_BASE_URL` and `N8N_API_KEY` as GitHub Actions secrets.
2. Validate workflow JSON with a script before deploy.
3. Call the n8n public API to create or update workflows in n8n Cloud or a self-hosted instance.
4. Keep workflows inactive by default unless the deployment job explicitly activates them.

Until that deploy job exists, import the JSON files manually in n8n and configure the environment variables in the n8n instance.
