/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { api, internal } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

describe('events', () => {
  test('upserts scraped VDSC events by source key', async () => {
    const t = convexTest(schema, modules);
    const scrapedEvent = {
      clubName: 'Club Aquarium e. V.',
      locationName: 'Club Aquarium e. V.',
      rawLocation: 'Club Aquarium e. V. St. Petersburger Str. 21 01069 Dresden',
      addressLine: 'St. Petersburger Str. 21, 01069 Dresden',
      postalCode: '01069',
      city: 'Dresden',
      dayText: '2026-04-24',
      timeText: '20:00',
      title: 'Semester Opening',
      startsAt: new Date(2026, 3, 24, 20, 0).getTime(),
      source: 'vdsc' as const,
      sourceKey: '2026-04-24t18-00-00-000z__club-aquarium-e-v__semester-opening',
      sourceUrl: 'https://vdsc.de/veranstaltungen/example.html',
    };

    const firstResult = await t.mutation(internal.events.upsertScrapedVdscEvents, {
      events: [scrapedEvent],
      scrapedAt: 1,
    });
    const secondResult = await t.mutation(internal.events.upsertScrapedVdscEvents, {
      events: [{ ...scrapedEvent, title: 'Updated Opening' }],
      scrapedAt: 2,
    });
    const events = await t.query(api.events.listUpcoming, {
      now: new Date(2026, 3, 24, 19, 0).getTime(),
      limit: 10,
    });
    const clubs = await t.query(api.clubs.list, {
      now: new Date(2026, 3, 24, 19, 0).getTime(),
      limit: 10,
    });

    expect(firstResult).toEqual({ received: 1, inserted: 1, updated: 0 });
    expect(secondResult).toEqual({ received: 1, inserted: 0, updated: 1 });
    expect(events).toHaveLength(1);
    expect(clubs).toHaveLength(1);
    expect(clubs[0]).toMatchObject({
      name: 'Club Aquarium',
      slug: 'club-aquarium',
      addressLine: 'St. Petersburger Str. 21, 01069 Dresden',
      postalCode: '01069',
      city: 'Dresden',
      nextEvent: {
        title: 'Updated Opening',
      },
    });
    expect(events[0]).toMatchObject({
      title: 'Updated Opening',
      source: 'vdsc',
      sourceKey: scrapedEvent.sourceKey,
      locationName: 'Club Aquarium e. V.',
      addressLine: 'St. Petersburger Str. 21, 01069 Dresden',
      city: 'Dresden',
      lastScrapedAt: 2,
    });
  });
});
