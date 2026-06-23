import { v } from 'convex/values';

import { internalMutation, type MutationCtx } from './_generated/server';

async function deleteAllFromTable(
  ctx: MutationCtx,
  table: 'events' | 'clubs' | 'geocodingCache' | 'favorites',
) {
  let deleted = 0;

  // Keep batches bounded to stay within mutation limits.
  while (true) {
    const rows = await ctx.db.query(table).take(128);
    if (rows.length === 0) {
      return deleted;
    }

    for (const row of rows) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }
  }
}

export const wipeAllData = internalMutation({
  args: {
    includeClubs: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const deletedEvents = await deleteAllFromTable(ctx, 'events');
    const deletedClubs = args.includeClubs === true ? await deleteAllFromTable(ctx, 'clubs') : 0;
    const deletedGeocodingCache = await deleteAllFromTable(ctx, 'geocodingCache');
    const deletedFavorites = await deleteAllFromTable(ctx, 'favorites');

    return {
      deletedEvents,
      deletedClubs,
      skippedClubs: args.includeClubs !== true,
      deletedGeocodingCache,
      deletedFavorites,
    };
  },
});
