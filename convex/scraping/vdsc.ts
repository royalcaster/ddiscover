"use node";

import { v } from 'convex/values';

import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { action, internalAction, type ActionCtx } from '../_generated/server';
import { resolveClubProfile } from './clubCatalog';
import { extractEventImageUrlFromHtml } from './eventImages';
import { buildClubGeocodingQuery, buildGeocodingQueryKey, geocodeWithNominatim } from './geocoding';
import { parseVdscCalendarEvents } from './vdscParser';
import type { ScrapedVdscEvent } from './vdscTypes';

const VDSC_EVENTS_URL = 'https://events.vdsc.de/calendar.json';
const DEFAULT_IMAGE_DELAY_MS = 200;
const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

async function fetchEventImageSourceUrl(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return extractEventImageUrlFromHtml(html, sourceUrl);
  } catch (error) {
    console.warn(`Failed to fetch event page for image: ${sourceUrl}`, error);
    return null;
  }
}

async function storeImageFromUrl(ctx: ActionCtx, imageUrl: string) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    const maxBytes = Number(process.env.DDISCOVER_IMAGE_MAX_BYTES ?? DEFAULT_MAX_IMAGE_BYTES);
    const contentLength = Number(response.headers.get('content-length') ?? '0');
    if (contentLength > maxBytes) {
      return null;
    }

    const imageBytes = await response.arrayBuffer();
    if (imageBytes.byteLength > maxBytes) {
      return null;
    }

    return await ctx.storage.store(new Blob([imageBytes], { type: contentType }));
  } catch (error) {
    console.warn(`Failed to store event image: ${imageUrl}`, error);
    return null;
  }
}

async function enrichEventsWithImages(ctx: ActionCtx, events: ScrapedVdscEvent[]) {
  const sourceKeys = events.map((event) => event.sourceKey);
  const existingRefs: Array<{
    sourceKey: string;
    imageStorageId: Id<'_storage'>;
    imageSourceUrl: string;
  }> = await ctx.runQuery(internal.events.listExistingImageRefs, {
    source: 'vdsc',
    sourceKeys,
  });
  const existingRefBySourceKey = new Map(existingRefs.map((entry) => [entry.sourceKey, entry]));
  const imageDelayMs = Number(process.env.DDISCOVER_IMAGE_DELAY_MS ?? DEFAULT_IMAGE_DELAY_MS);
  const enrichedEvents: ScrapedVdscEvent[] = [];

  for (const event of events) {
    if (!event.sourceUrl) {
      enrichedEvents.push(event);
      continue;
    }

    const imageSourceUrl = await fetchEventImageSourceUrl(event.sourceUrl);
    const existingRef = existingRefBySourceKey.get(event.sourceKey);

    if (!imageSourceUrl) {
      enrichedEvents.push(
        existingRef
          ? {
              ...event,
              imageStorageId: existingRef.imageStorageId,
              imageSourceUrl: existingRef.imageSourceUrl,
            }
          : event,
      );
      continue;
    }

    if (existingRef?.imageSourceUrl === imageSourceUrl) {
      enrichedEvents.push({
        ...event,
        imageStorageId: existingRef.imageStorageId,
        imageSourceUrl,
      });
      continue;
    }

    const imageStorageId = await storeImageFromUrl(ctx, imageSourceUrl);
    enrichedEvents.push(
      imageStorageId
        ? {
            ...event,
            imageStorageId,
            imageSourceUrl,
          }
        : existingRef
          ? {
              ...event,
              imageStorageId: existingRef.imageStorageId,
              imageSourceUrl: existingRef.imageSourceUrl,
            }
          : event,
    );

    if (imageDelayMs > 0) {
      await sleep(imageDelayMs);
    }
  }

  return enrichedEvents;
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
    images: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const scrapedAt = Date.now();
    const events = await fetchVdscEvents();
    const withCoordinates =
      args.geocode === false ? events : await enrichEventsWithGeocoding(ctx, events);
    const withImages =
      args.images === false ? withCoordinates : await enrichEventsWithImages(ctx, withCoordinates);

    const stored: {
      received: number;
      inserted: number;
      updated: number;
    } = await ctx.runMutation(internal.events.upsertScrapedVdscEvents, {
      events: withImages,
      scrapedAt,
    });

    return {
      scraped: withImages.length,
      stored,
    };
  },
});
