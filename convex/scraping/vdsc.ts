"use node";

import { v } from 'convex/values';

import { internal } from '../_generated/api';
import { action, internalAction, type ActionCtx } from '../_generated/server';
import { resolveClubProfile } from './clubCatalog';
import { buildClubGeocodingQuery, buildGeocodingQueryKey, geocodeWithNominatim } from './geocoding';
import { parseVdscCalendarEvents } from './vdscParser';
import type { ScrapedVdscEvent } from './vdscTypes';

const VDSC_EVENTS_URL = 'https://events.vdsc.de/calendar.json';

async function fetchVdscEvents() {
  const response = await fetch(VDSC_EVENTS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch VDSC events: ${response.status} ${response.statusText}`);
  }

  const json: unknown = await response.json();
  return parseVdscCalendarEvents(json);
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function enrichEventsWithGeocoding(
  ctx: ActionCtx,
  events: ScrapedVdscEvent[],
) {
  const geocodeDelayMs = Number(process.env.DDISCOVER_GEOCODE_DELAY_MS ?? '1100');
  const geocodeLookup = new Map<
    string,
    { queryKey: string; queryText: string; preferredCity: string }
  >();

  for (const event of events) {
    const clubProfile = resolveClubProfile(event.clubName, event.sourceUrl);
    if (geocodeLookup.has(clubProfile.slug)) {
      continue;
    }

    const queryText = buildClubGeocodingQuery(event, clubProfile.name);
    geocodeLookup.set(clubProfile.slug, {
      queryKey: buildGeocodingQueryKey(queryText),
      queryText,
      preferredCity: event.city ?? 'Dresden',
    });
  }

  if (geocodeLookup.size === 0) {
    return events;
  }

  const queryKeys = Array.from(geocodeLookup.values()).map((entry) => entry.queryKey);
  const cached = await ctx.runQuery(internal.geocoding.lookupCache, { queryKeys });
  const cachedByQueryKey = new Map(cached.map((entry) => [entry.queryKey, entry]));

  const resolvedBySlug = new Map<string, { latitude: number; longitude: number }>();
  for (const [slug, entry] of geocodeLookup) {
    const fromCache = cachedByQueryKey.get(entry.queryKey);
    if (fromCache) {
      resolvedBySlug.set(slug, {
        latitude: fromCache.latitude,
        longitude: fromCache.longitude,
      });
    }
  }

  const newlyResolved: Array<{
    queryKey: string;
    queryText: string;
    provider: string;
    latitude: number;
    longitude: number;
    displayName?: string;
    resolvedAt: number;
  }> = [];

  for (const [slug, entry] of geocodeLookup) {
    if (resolvedBySlug.has(slug)) {
      continue;
    }

    const resolved = await geocodeWithNominatim(entry.queryText, entry.preferredCity);
    if (resolved) {
      resolvedBySlug.set(slug, {
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      });
      newlyResolved.push({
        queryKey: entry.queryKey,
        queryText: entry.queryText,
        provider: 'nominatim',
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        displayName: resolved.displayName,
        resolvedAt: Date.now(),
      });
    }

    if (geocodeDelayMs > 0) {
      await sleep(geocodeDelayMs);
    }
  }

  if (newlyResolved.length > 0) {
    await ctx.runMutation(internal.geocoding.upsertCacheEntries, {
      entries: newlyResolved,
    });
  }

  return events.map((event) => {
    const clubProfile = resolveClubProfile(event.clubName, event.sourceUrl);
    const resolved = resolvedBySlug.get(clubProfile.slug);

    if (!resolved) {
      return event;
    }

    return {
      ...event,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
    };
  });
}

export const previewEvents = action({
  args: {},
  handler: async () => {
    const events = await fetchVdscEvents();

    return {
      scraped: events.length,
      sample: events.slice(0, 5),
    };
  },
});

export const importEvents = internalAction({
  args: {
    geocode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const scrapedAt = Date.now();
    const events = await fetchVdscEvents();
    const withCoordinates =
      args.geocode === false ? events : await enrichEventsWithGeocoding(ctx, events);

    const stored: {
      received: number;
      inserted: number;
      updated: number;
    } = await ctx.runMutation(internal.events.upsertScrapedVdscEvents, {
      events: withCoordinates,
      scrapedAt,
    });

    return {
      scraped: withCoordinates.length,
      stored,
    };
  },
});
