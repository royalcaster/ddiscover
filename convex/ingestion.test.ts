/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, test } from 'vitest';

import { api, internal } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');
const adminEmail = 'admin@ddiscover.local';

const payload = {
  source: {
    sourceKey: 'objekt-klein-a-calendar',
    name: 'Objekt klein a calendar',
    sourceType: 'calendar_page' as const,
    url: 'https://objektkleina.com/events',
    fetchedAt: 1,
  },
  venues: [
    {
      sourceKey: 'venue-objekt-klein-a',
      name: 'objekt klein a',
      city: 'Dresden',
      category: 'club',
      googlePlace: {
        placeId: 'places/objekt-klein-a',
        name: 'objekt klein a',
        formattedAddress: 'Meschwitzstraße 9, 01099 Dresden, Germany',
        websiteUri: 'https://objektkleina.com',
        businessStatus: 'OPERATIONAL',
        types: ['night_club', 'bar'],
        latitude: 51.079,
        longitude: 13.751,
      },
      evidenceSnippets: ['Venue footer names objekt klein a in Dresden.'],
      confidence: 0.94,
    },
  ],
  events: [
    {
      sourceKey: 'event-2026-07-04-summer-session',
      title: 'Summer Session',
      description: 'House and bass night.',
      startsAt: new Date(2026, 6, 4, 22, 0).getTime(),
      venueName: 'objekt klein a',
      venueCandidateSourceKey: 'venue-objekt-klein-a',
      sourceUrl: 'https://objektkleina.com/events/summer-session',
      ticketUrl: 'https://tickets.example/summer-session',
      tags: ['house', 'bass'],
      evidenceSnippets: ['Saturday 04.07.2026, 22:00 - Summer Session.'],
      confidence: 0.88,
    },
  ],
};

describe('ingestion candidates', () => {
  beforeEach(() => {
    process.env.DDISCOVER_ADMIN_EMAILS = adminEmail;
  });

  test('ingests candidate payload idempotently for review', async () => {
    const t = convexTest(schema, modules);

    const firstResult = await t.mutation(internal.ingestion.ingestCandidatePayload, { payload });
    const secondResult = await t.mutation(internal.ingestion.ingestCandidatePayload, { payload });
    const admin = t.withIdentity({ tokenIdentifier: 'clerk:admin', email: adminEmail });
    const review = await admin.query(api.ingestion.listReviewCandidates, { limit: 10 });

    expect(firstResult).toEqual({
      venueCandidatesInserted: 1,
      venueCandidatesUpdated: 0,
      eventCandidatesInserted: 1,
      eventCandidatesUpdated: 0,
    });
    expect(secondResult).toEqual({
      venueCandidatesInserted: 0,
      venueCandidatesUpdated: 1,
      eventCandidatesInserted: 0,
      eventCandidatesUpdated: 1,
    });
    expect(review.venueCandidates).toHaveLength(1);
    expect(review.eventCandidates).toHaveLength(1);
    expect(review.venueCandidates[0]).toMatchObject({
      name: 'objekt klein a',
      googlePlaceId: 'places/objekt-klein-a',
      confidence: 0.94,
      status: 'pending',
    });
    expect(review.eventCandidates[0]).toMatchObject({
      title: 'Summer Session',
      venueName: 'objekt klein a',
      status: 'pending',
    });
  });

  test('approves venue and event candidates into public tables', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.ingestion.ingestCandidatePayload, { payload });
    const admin = t.withIdentity({ tokenIdentifier: 'clerk:admin', email: adminEmail });
    const reviewBefore = await admin.query(api.ingestion.listReviewCandidates, { limit: 10 });

    const venueResult = await admin.mutation(api.ingestion.approveVenueCandidate, {
      candidateId: reviewBefore.venueCandidates[0]._id,
    });
    const eventResult = await admin.mutation(api.ingestion.approveEventCandidate, {
      candidateId: reviewBefore.eventCandidates[0]._id,
    });

    const clubs = await t.query(api.clubs.list, {
      now: new Date(2026, 6, 4, 21, 0).getTime(),
      limit: 10,
    });
    const events = await t.query(api.events.listUpcoming, {
      now: new Date(2026, 6, 4, 21, 0).getTime(),
      limit: 10,
    });

    expect(venueResult.publicClubId).toBeTruthy();
    expect(eventResult.publicEventId).toBeTruthy();
    expect(clubs[0]).toMatchObject({
      name: 'objekt klein a',
      googlePlaceId: 'places/objekt-klein-a',
      latitude: 51.079,
      longitude: 13.751,
      venueCategory: 'club',
      nextEvent: {
        title: 'Summer Session',
      },
    });
    expect(events[0]).toMatchObject({
      title: 'Summer Session',
      clubId: clubs[0]._id,
      source: 'Objekt klein a calendar',
      sourceKey: 'event-2026-07-04-summer-session',
      ticketUrl: 'https://tickets.example/summer-session',
      tags: ['house', 'bass'],
    });
  });

  test('requires an approved venue before approving an event', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.ingestion.ingestCandidatePayload, { payload });
    const admin = t.withIdentity({ tokenIdentifier: 'clerk:admin', email: adminEmail });
    const review = await admin.query(api.ingestion.listReviewCandidates, { limit: 10 });

    await expect(
      admin.mutation(api.ingestion.approveEventCandidate, {
        candidateId: review.eventCandidates[0]._id,
      }),
    ).rejects.toThrow('Approve or match the venue before approving this event');
  });

  test('blocks review actions for non-admin users', async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.ingestion.ingestCandidatePayload, { payload });
    const user = t.withIdentity({ tokenIdentifier: 'clerk:user', email: 'user@example.com' });

    await expect(user.query(api.ingestion.listReviewCandidates, { limit: 10 })).rejects.toThrow(
      'Admin access required',
    );
  });
});
