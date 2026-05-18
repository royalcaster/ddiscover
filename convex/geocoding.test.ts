/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { internal } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

describe('geocoding cache', () => {
  test('upserts and looks up cache entries by query key', async () => {
    const t = convexTest(schema, modules);

    const first = await t.mutation(internal.geocoding.upsertCacheEntries, {
      entries: [
        {
          queryKey: 'club aquarium st petersburger str 21 01069 dresden germany',
          queryText: 'Club Aquarium, St. Petersburger Str. 21, 01069 Dresden, Germany',
          provider: 'nominatim',
          latitude: 51.04012,
          longitude: 13.73876,
          displayName: 'Club Aquarium, Dresden, Germany',
          resolvedAt: 1,
        },
      ],
    });

    const second = await t.mutation(internal.geocoding.upsertCacheEntries, {
      entries: [
        {
          queryKey: 'club aquarium st petersburger str 21 01069 dresden germany',
          queryText: 'Club Aquarium, St. Petersburger Str. 21, 01069 Dresden, Germany',
          provider: 'nominatim',
          latitude: 51.04015,
          longitude: 13.73879,
          displayName: 'Club Aquarium e. V., Dresden, Germany',
          resolvedAt: 2,
        },
      ],
    });

    const lookup = await t.query(internal.geocoding.lookupCache, {
      queryKeys: [
        'club aquarium st petersburger str 21 01069 dresden germany',
        'missing query',
      ],
    });

    expect(first).toEqual({ received: 1, inserted: 1, updated: 0 });
    expect(second).toEqual({ received: 1, inserted: 0, updated: 1 });
    expect(lookup).toHaveLength(1);
    expect(lookup[0]).toMatchObject({
      queryKey: 'club aquarium st petersburger str 21 01069 dresden germany',
      provider: 'nominatim',
      latitude: 51.04015,
      longitude: 13.73879,
      displayName: 'Club Aquarium e. V., Dresden, Germany',
    });
  });
});

