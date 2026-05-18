/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

async function seedClubAndEvent(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const clubId = await ctx.db.insert('clubs', {
      name: 'Club Aquarium',
      slug: 'club-aquarium',
      city: 'Dresden',
    });
    const eventId = await ctx.db.insert('events', {
      clubId,
      title: 'Kollektiv Nacht',
      startsAt: Date.now() + 60_000,
      source: 'vdsc',
      sourceKey: 'seed-event',
    });
    return { clubId, eventId };
  });
}

describe('favorites', () => {
  test('rejects toggleFavorite when unauthenticated', async () => {
    const t = convexTest(schema, modules);
    const { eventId } = await seedClubAndEvent(t);

    await expect(
      t.mutation(api.favorites.toggleFavorite, {
        entityType: 'event',
        eventId,
      }),
    ).rejects.toThrow('Authentication required');
  });

  test('toggles event favorites for the signed-in user', async () => {
    const t = convexTest(schema, modules);
    const user = t.withIdentity({ tokenIdentifier: 'clerk:user_1' });
    const { eventId } = await seedClubAndEvent(t);

    const first = await user.mutation(api.favorites.toggleFavorite, {
      entityType: 'event',
      eventId,
    });
    const favoritedAfterFirst = await user.query(api.favorites.isFavorited, {
      entityType: 'event',
      eventId,
    });
    const listAfterFirst = await user.query(api.favorites.listMyFavorites, {});

    const second = await user.mutation(api.favorites.toggleFavorite, {
      entityType: 'event',
      eventId,
    });
    const favoritedAfterSecond = await user.query(api.favorites.isFavorited, {
      entityType: 'event',
      eventId,
    });
    const listAfterSecond = await user.query(api.favorites.listMyFavorites, {});

    expect(first).toEqual({ favorited: true });
    expect(favoritedAfterFirst).toEqual({ favorited: true });
    expect(listAfterFirst.eventIds).toHaveLength(1);
    expect(listAfterFirst.clubIds).toHaveLength(0);

    expect(second).toEqual({ favorited: false });
    expect(favoritedAfterSecond).toEqual({ favorited: false });
    expect(listAfterSecond.eventIds).toHaveLength(0);
  });

  test('supports club favorites and isolates data by identity', async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: 'clerk:alice' });
    const bob = t.withIdentity({ tokenIdentifier: 'clerk:bob' });
    const { clubId } = await seedClubAndEvent(t);

    await alice.mutation(api.favorites.toggleFavorite, {
      entityType: 'club',
      clubId,
    });

    const aliceList = await alice.query(api.favorites.listMyFavorites, {});
    const bobList = await bob.query(api.favorites.listMyFavorites, {});
    const bobIsFavorited = await bob.query(api.favorites.isFavorited, {
      entityType: 'club',
      clubId,
    });

    expect(aliceList.clubIds).toHaveLength(1);
    expect(bobList.clubIds).toHaveLength(0);
    expect(bobIsFavorited).toEqual({ favorited: false });
  });
});
