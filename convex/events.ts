import { v } from 'convex/values';

import { internalMutation, query } from './_generated/server';
import { resolveClubProfile } from './scraping/clubCatalog';
import { scrapedVdscEventValidator } from './scraping/vdscTypes';

export const listUpcoming = query({
  args: {
    now: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const limit = args.limit ?? 25;

    return await ctx.db
      .query('events')
      .withIndex('by_starts_at', (q) => q.gte('startsAt', now))
      .order('asc')
      .take(limit);
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

      if (existingClub) {
        await ctx.db.patch(existingClub._id, {
          name: clubProfile.name,
          source: event.source,
          websiteUrl: existingClub.websiteUrl ?? clubProfile.websiteUrl,
          addressLine: event.addressLine ?? existingClub.addressLine,
          postalCode: event.postalCode ?? existingClub.postalCode,
          city: event.city ?? existingClub.city,
          latitude: existingClub.latitude ?? event.latitude,
          longitude: existingClub.longitude ?? event.longitude,
          lastScrapedAt: args.scrapedAt,
        });
      }

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
        latitude: event.latitude ?? existingEvent?.latitude,
        longitude: event.longitude ?? existingEvent?.longitude,
        source: event.source,
        sourceKey: event.sourceKey,
        sourceUrl: event.sourceUrl,
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
