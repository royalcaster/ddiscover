import { v } from 'convex/values';

import { internalMutation, query } from './_generated/server';
import { resolveClubProfile } from './scraping/clubCatalog';

export const list = query({
  args: {
    now: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const limit = args.limit ?? 20;
    const clubs = await ctx.db.query('clubs').withIndex('by_name').take(limit);

    const clubsWithUpcoming = await Promise.all(
      clubs.map(async (club) => {
        const nextEvent = await ctx.db
          .query('events')
          .withIndex('by_club_and_starts_at', (q) => q.eq('clubId', club._id).gte('startsAt', now))
          .order('asc')
          .take(1);

        return {
          ...club,
          nextEvent: nextEvent[0] ?? null,
        };
      }),
    );
    return clubsWithUpcoming;
  },
});

export const cleanupOrphaned = internalMutation({
  args: {
    allowMvpClubChanges: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.allowMvpClubChanges !== true) {
      return { scanned: 0, deleted: 0, skipped: true };
    }

    const limit = args.limit ?? 100;
    const clubs = await ctx.db.query('clubs').take(limit);
    let deleted = 0;

    for (const club of clubs) {
      const eventRefs = await ctx.db
        .query('events')
        .withIndex('by_club', (q) => q.eq('clubId', club._id))
        .take(1);

      if (eventRefs.length === 0) {
        await ctx.db.delete(club._id);
        deleted += 1;
      }
    }

    return { scanned: clubs.length, deleted };
  },
});

export const mergeLegacyDuplicates = internalMutation({
  args: {
    allowMvpClubChanges: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.allowMvpClubChanges !== true) {
      return { scanned: 0, merged: 0, renamed: 0, skipped: true };
    }

    const limit = args.limit ?? 100;
    const clubs = await ctx.db.query('clubs').take(limit);
    let merged = 0;
    let renamed = 0;

    for (const club of clubs) {
      const profile = resolveClubProfile(club.name, club.websiteUrl);

      if (club.slug === profile.slug) {
        if (club.name !== profile.name || (!club.websiteUrl && profile.websiteUrl)) {
          await ctx.db.patch(club._id, {
            name: profile.name,
            websiteUrl: club.websiteUrl ?? profile.websiteUrl,
          });
          renamed += 1;
        }
        continue;
      }

      const canonicalClub = await ctx.db
        .query('clubs')
        .withIndex('by_slug', (q) => q.eq('slug', profile.slug))
        .unique();

      if (!canonicalClub) {
        await ctx.db.patch(club._id, {
          name: profile.name,
          slug: profile.slug,
          websiteUrl: club.websiteUrl ?? profile.websiteUrl,
        });
        renamed += 1;
        continue;
      }

      const linkedEvents = await ctx.db
        .query('events')
        .withIndex('by_club', (q) => q.eq('clubId', club._id))
        .take(256);

      for (const event of linkedEvents) {
        await ctx.db.patch(event._id, { clubId: canonicalClub._id });
      }

      await ctx.db.patch(canonicalClub._id, {
        websiteUrl: canonicalClub.websiteUrl ?? club.websiteUrl ?? profile.websiteUrl,
        addressLine: canonicalClub.addressLine ?? club.addressLine,
        postalCode: canonicalClub.postalCode ?? club.postalCode,
        city: canonicalClub.city ?? club.city,
        lastScrapedAt: Math.max(canonicalClub.lastScrapedAt ?? 0, club.lastScrapedAt ?? 0) || undefined,
      });

      await ctx.db.delete(club._id);
      merged += 1;
    }

    return { scanned: clubs.length, merged, renamed };
  },
});
