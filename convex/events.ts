import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, internalQuery, query, type QueryCtx } from './_generated/server';
import { resolveClubProfile } from './scraping/clubCatalog';
import { scrapedVdscEventValidator } from './scraping/vdscTypes';

async function withImageUrl(ctx: QueryCtx, event: Doc<'events'>) {
  const imageUrl = event.imageStorageId ? await ctx.storage.getUrl(event.imageStorageId) : null;
  return {
    ...event,
    imageUrl,
  };
}

export const listUpcoming = query({
  args: {
    now: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const limit = args.limit ?? 25;

    const events = await ctx.db
      .query('events')
      .withIndex('by_starts_at', (q) => q.gte('startsAt', now))
      .order('asc')
      .take(limit);

    return await Promise.all(events.map((event) => withImageUrl(ctx, event)));
  },
});

export const getById = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    const club = await ctx.db.get(event.clubId);
    return {
      event: await withImageUrl(ctx, event),
      club,
    };
  },
});

export const listExistingImageRefs = internalQuery({
  args: {
    source: v.literal('vdsc'),
    sourceKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const refs: Array<{
      sourceKey: string;
      imageStorageId: Id<'_storage'>;
      imageSourceUrl: string;
    }> = [];

    for (const sourceKey of args.sourceKeys) {
      const event = await ctx.db
        .query('events')
        .withIndex('by_source_and_source_key', (q) =>
          q.eq('source', args.source).eq('sourceKey', sourceKey),
        )
        .unique();

      if (!event?.imageStorageId || !event.imageSourceUrl) {
        continue;
      }

      refs.push({
        sourceKey,
        imageStorageId: event.imageStorageId,
        imageSourceUrl: event.imageSourceUrl,
      });
    }

    return refs;
  },
});

export const upsertScrapedVdscEvents = internalMutation({
  args: {
    events: v.array(scrapedVdscEventValidator),
    scrapedAt: v.number(),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const event of args.events) {
      const clubProfile = resolveClubProfile(event.clubName, event.sourceUrl);
      const existingClub = await ctx.db
        .query('clubs')
        .withIndex('by_slug', (q) => q.eq('slug', clubProfile.slug))
        .unique();

      const clubId =
        existingClub?._id ??
        (await ctx.db.insert('clubs', {
          name: clubProfile.name,
          slug: clubProfile.slug,
          source: event.source,
          websiteUrl: clubProfile.websiteUrl,
          addressLine: event.addressLine,
          postalCode: event.postalCode,
          city: event.city,
          latitude: event.latitude,
          longitude: event.longitude,
          lastScrapedAt: args.scrapedAt,
        }));

      const existingEvent = await ctx.db
        .query('events')
        .withIndex('by_source_and_source_key', (q) =>
          q.eq('source', event.source).eq('sourceKey', event.sourceKey),
        )
        .unique();

      const eventDocument = {
        clubId,
        title: event.title,
        startsAt: event.startsAt,
        locationName: event.locationName,
        latitude: existingClub?.latitude ?? event.latitude ?? existingEvent?.latitude,
        longitude: existingClub?.longitude ?? event.longitude ?? existingEvent?.longitude,
        source: event.source,
        sourceKey: event.sourceKey,
        sourceUrl: event.sourceUrl,
        imageStorageId: event.imageStorageId ?? existingEvent?.imageStorageId,
        imageSourceUrl: event.imageSourceUrl ?? existingEvent?.imageSourceUrl,
        addressLine: event.addressLine,
        postalCode: event.postalCode,
        city: event.city,
        lastScrapedAt: args.scrapedAt,
      };

      if (existingEvent) {
        await ctx.db.patch(existingEvent._id, eventDocument);
        updated += 1;
      } else {
        await ctx.db.insert('events', eventDocument);
        inserted += 1;
      }
    }

    return {
      received: args.events.length,
      inserted,
      updated,
    };
  },
});
