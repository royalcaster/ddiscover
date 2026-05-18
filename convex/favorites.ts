import { v } from 'convex/values';

import type { MutationCtx } from './_generated/server';
import { mutation, query } from './_generated/server';

async function getIdentityTokenIdentifier(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.tokenIdentifier) {
    throw new Error('Authentication required');
  }
  return identity.tokenIdentifier;
}

export const toggleFavorite = mutation({
  args: {
    entityType: v.union(v.literal('club'), v.literal('event')),
    clubId: v.optional(v.id('clubs')),
    eventId: v.optional(v.id('events')),
  },
  handler: async (ctx, args) => {
    const userTokenIdentifier = await getIdentityTokenIdentifier(ctx);

    if (args.entityType === 'club') {
      if (!args.clubId || args.eventId) {
        throw new Error("For entityType='club', provide clubId only.");
      }

      const existing = await ctx.db
        .query('favorites')
        .withIndex('by_user_and_club', (q) =>
          q.eq('userTokenIdentifier', userTokenIdentifier).eq('clubId', args.clubId),
        )
        .unique();

      if (existing) {
        await ctx.db.delete(existing._id);
        return { favorited: false };
      }

      await ctx.db.insert('favorites', {
        userTokenIdentifier,
        entityType: 'club',
        clubId: args.clubId,
        createdAt: Date.now(),
      });
      return { favorited: true };
    }

    if (!args.eventId || args.clubId) {
      throw new Error("For entityType='event', provide eventId only.");
    }

    const existing = await ctx.db
      .query('favorites')
      .withIndex('by_user_and_event', (q) =>
        q.eq('userTokenIdentifier', userTokenIdentifier).eq('eventId', args.eventId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert('favorites', {
      userTokenIdentifier,
      entityType: 'event',
      eventId: args.eventId,
      createdAt: Date.now(),
    });
    return { favorited: true };
  },
});

export const listMyFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      return {
        clubIds: [],
        eventIds: [],
      };
    }

    const rows = await ctx.db
      .query('favorites')
      .withIndex('by_user_and_entity_type', (q) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .order('desc')
      .take(512);

    const clubIds = rows
      .filter((row) => row.entityType === 'club' && row.clubId !== undefined)
      .map((row) => row.clubId!);
    const eventIds = rows
      .filter((row) => row.entityType === 'event' && row.eventId !== undefined)
      .map((row) => row.eventId!);

    return { clubIds, eventIds };
  },
});

export const isFavorited = query({
  args: {
    entityType: v.union(v.literal('club'), v.literal('event')),
    clubId: v.optional(v.id('clubs')),
    eventId: v.optional(v.id('events')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      return { favorited: false };
    }

    if (args.entityType === 'club') {
      if (!args.clubId || args.eventId) {
        throw new Error("For entityType='club', provide clubId only.");
      }

      const existing = await ctx.db
        .query('favorites')
        .withIndex('by_user_and_club', (q) =>
          q.eq('userTokenIdentifier', identity.tokenIdentifier).eq('clubId', args.clubId),
        )
        .unique();
      return { favorited: Boolean(existing) };
    }

    if (!args.eventId || args.clubId) {
      throw new Error("For entityType='event', provide eventId only.");
    }

    const existing = await ctx.db
      .query('favorites')
      .withIndex('by_user_and_event', (q) =>
        q.eq('userTokenIdentifier', identity.tokenIdentifier).eq('eventId', args.eventId),
      )
      .unique();
    return { favorited: Boolean(existing) };
  },
});
