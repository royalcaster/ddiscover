import { v } from 'convex/values';

import { internalMutation, internalQuery } from './_generated/server';

export const lookupCache = internalQuery({
  args: {
    queryKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const rows: Array<{
      queryKey: string;
      latitude: number;
      longitude: number;
      displayName?: string;
      queryText: string;
      provider: string;
    }> = [];

    for (const queryKey of args.queryKeys) {
      const cached = await ctx.db
        .query('geocodingCache')
        .withIndex('by_query_key', (q) => q.eq('queryKey', queryKey))
        .unique();

      if (!cached) {
        continue;
      }

      rows.push({
        queryKey: cached.queryKey,
        latitude: cached.latitude,
        longitude: cached.longitude,
        displayName: cached.displayName,
        queryText: cached.queryText,
        provider: cached.provider,
      });
    }

    return rows;
  },
});

export const upsertCacheEntries = internalMutation({
  args: {
    entries: v.array(
      v.object({
        queryKey: v.string(),
        queryText: v.string(),
        provider: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        displayName: v.optional(v.string()),
        resolvedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const entry of args.entries) {
      const existing = await ctx.db
        .query('geocodingCache')
        .withIndex('by_query_key', (q) => q.eq('queryKey', entry.queryKey))
        .unique();

      if (!existing) {
        await ctx.db.insert('geocodingCache', {
          queryKey: entry.queryKey,
          queryText: entry.queryText,
          provider: entry.provider,
          latitude: entry.latitude,
          longitude: entry.longitude,
          displayName: entry.displayName,
          lastResolvedAt: entry.resolvedAt,
        });
        inserted += 1;
        continue;
      }

      await ctx.db.patch(existing._id, {
        queryText: entry.queryText,
        provider: entry.provider,
        latitude: entry.latitude,
        longitude: entry.longitude,
        displayName: entry.displayName ?? existing.displayName,
        lastResolvedAt: entry.resolvedAt,
      });
      updated += 1;
    }

    return { received: args.entries.length, inserted, updated };
  },
});

