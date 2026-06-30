# DDiscover Ingestion Pipeline

This document describes the planned durable scraping and review workflow for expanding DDiscover beyond student clubs into Dresden clubs, bars, and event venues.

## Architecture

- n8n orchestrates scheduled source crawling, retries, page cleanup, and LLM extraction.
- Google Places is the preferred authority for venue identity, address, coordinates, website, business status, types, and opening-hour text.
- Convex is the trusted ingestion boundary. It validates incoming candidate JSON, deduplicates candidates, stores review drafts, and only publishes data after admin approval.
- The public app reads approved `clubs` and `events` data only.
- Review happens in the private desktop web route `/admin/ingestion`.

## Required Convex Environment Variables

- `DDISCOVER_INGESTION_TOKEN`: bearer token required by the n8n ingestion endpoint.
- `DDISCOVER_ADMIN_EMAILS`: comma-separated list of Clerk account emails allowed to review candidates.

## n8n Endpoint

Send candidate payloads to the Convex HTTP endpoint:

```http
POST /ingestion/candidates
Authorization: Bearer <DDISCOVER_INGESTION_TOKEN>
Content-Type: application/json
```

Payload shape:

```json
{
  "source": {
    "sourceKey": "objekt-klein-a-calendar",
    "name": "Objekt klein a calendar",
    "sourceType": "calendar_page",
    "url": "https://objektkleina.com/events",
    "fetchedAt": 1783183200000
  },
  "venues": [
    {
      "sourceKey": "venue-objekt-klein-a",
      "name": "objekt klein a",
      "city": "Dresden",
      "category": "club",
      "googlePlace": {
        "placeId": "places/example",
        "name": "objekt klein a",
        "formattedAddress": "Meschwitzstraße 9, 01099 Dresden, Germany",
        "websiteUri": "https://objektkleina.com",
        "businessStatus": "OPERATIONAL",
        "types": ["night_club", "bar"],
        "latitude": 51.079,
        "longitude": 13.751,
        "regularOpeningHoursText": "Fri-Sat evenings"
      },
      "evidenceSnippets": ["Source page names objekt klein a as the venue."],
      "warnings": [],
      "confidence": 0.94
    }
  ],
  "events": [
    {
      "sourceKey": "event-2026-07-04-summer-session",
      "title": "Summer Session",
      "description": "House and bass night.",
      "startsAt": 1783202400000,
      "venueName": "objekt klein a",
      "venueCandidateSourceKey": "venue-objekt-klein-a",
      "sourceUrl": "https://objektkleina.com/events/summer-session",
      "ticketUrl": "https://tickets.example/summer-session",
      "imageSourceUrl": "https://objektkleina.com/events/summer-session.jpg",
      "tags": ["house", "bass"],
      "evidenceSnippets": ["Saturday 04.07.2026, 22:00 - Summer Session."],
      "warnings": [],
      "confidence": 0.88
    }
  ]
}
```

## Review Flow

1. n8n sends validated candidates to Convex.
2. Convex stores or updates `venueCandidates` and `eventCandidates`.
3. Admin opens `/admin/ingestion` on web.
4. Admin approves, rejects, or marks candidates for recheck.
5. Approved venue candidates create or update public `clubs` rows with Google Places metadata.
6. Approved event candidates create or update public `events` rows and become visible in Discover, Calendar, Profile favorites, and Event Detail.

## Google Places Usage

- Use Places Text Search or Nearby Search to discover Dresden nightlife venues.
- Use Place Details with a minimal field mask for stable venue fields.
- Store the Google Place ID and request only fields the app or review UI needs.
- Do not let LLM output decide canonical coordinates; use LLM venue names as search candidates and Google Places as the location authority.
