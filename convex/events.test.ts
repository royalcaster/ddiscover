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
      latitude: 51.04012,
      longitude: 13.73876,
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
      latitude: 51.04012,
      longitude: 13.73876,
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
      latitude: 51.04012,
      longitude: 13.73876,
      lastScrapedAt: 2,
    });
  });

  test('keeps existing coordinates when later scrape has no geocoding result', async () => {
    const t = convexTest(schema, modules);
    const baseEvent = {
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

    await t.mutation(internal.events.upsertScrapedVdscEvents, {
      events: [{ ...baseEvent, latitude: 51.04012, longitude: 13.73876 }],
      scrapedAt: 1,
    });
    await t.mutation(internal.events.upsertScrapedVdscEvents, {
      events: [{ ...baseEvent, title: 'No Coordinates Update' }],
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

    expect(events[0]).toMatchObject({
      title: 'No Coordinates Update',
      latitude: 51.04012,
      longitude: 13.73876,
    });
    expect(clubs[0]).toMatchObject({
      latitude: 51.04012,
      longitude: 13.73876,
    });
  });

  test('does not overwrite existing MVP club rows during event import', async () => {
    const t = convexTest(schema, modules);
    const reviewedLatitude = 51.0319016;
    const reviewedLongitude = 13.7307345;

    await t.run(async (ctx) => {
      await ctx.db.insert('clubs', {
        name: 'Club 11',
        slug: 'club-11',
        websiteUrl: 'https://clubelf.de',
        addressLine: 'Hochschulstrasse 48',
        postalCode: '01069',
        city: 'Dresden',
        latitude: reviewedLatitude,
        longitude: reviewedLongitude,
        source: 'manual-mvp',
      });
    });

    await t.mutation(internal.events.upsertScrapedVdscEvents, {
      events: [
        {
          clubName: 'Club 11 e. V.',
          locationName: 'Club 11 e. V.',
          rawLocation: 'Club 11 e. V.\nHochschulstraße 48\n01069 Dresden',
          addressLine: 'Wrong imported address',
          postalCode: '01069',
          city: 'Dresden',
          dayText: '2026-06-12',
          timeText: '20:00',
          title: 'Springbreak',
          startsAt: new Date(2026, 5, 12, 20, 0).getTime(),
          latitude: 51.0463,
          longitude: 13.7412,
          source: 'vdsc' as const,
          sourceKey: 'springbreak-club-11',
          sourceUrl: 'https://clubelf.de/kalender/',
        },
      ],
      scrapedAt: 3,
    });

    const clubs = await t.query(api.clubs.list, {
      now: new Date(2026, 5, 12, 19, 0).getTime(),
      limit: 10,
    });
    const events = await t.query(api.events.listUpcoming, {
      now: new Date(2026, 5, 12, 19, 0).getTime(),
      limit: 10,
    });

    expect(clubs[0]).toMatchObject({
      name: 'Club 11',
      slug: 'club-11',
      source: 'manual-mvp',
      addressLine: 'Hochschulstrasse 48',
      latitude: reviewedLatitude,
      longitude: reviewedLongitude,
    });
    expect(events[0]).toMatchObject({
      title: 'Springbreak',
      latitude: reviewedLatitude,
      longitude: reviewedLongitude,
    });
  });
});
