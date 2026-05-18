import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  clubs: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    source: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    lastScrapedAt: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_name', ['name']),

  events: defineTable({
    clubId: v.id('clubs'),
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    locationName: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    source: v.optional(v.string()),
    sourceKey: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    lastScrapedAt: v.optional(v.number()),
  })
    .index('by_club', ['clubId'])
    .index('by_club_and_starts_at', ['clubId', 'startsAt'])
    .index('by_starts_at', ['startsAt'])
    .index('by_source_and_source_key', ['source', 'sourceKey']),

  geocodingCache: defineTable({
    queryKey: v.string(),
    queryText: v.string(),
    provider: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    displayName: v.optional(v.string()),
    lastResolvedAt: v.number(),
  }).index('by_query_key', ['queryKey']),

  favorites: defineTable({
    userTokenIdentifier: v.string(),
    entityType: v.union(v.literal('club'), v.literal('event')),
    clubId: v.optional(v.id('clubs')),
    eventId: v.optional(v.id('events')),
    createdAt: v.number(),
  })
    .index('by_user_and_entity_type', ['userTokenIdentifier', 'entityType'])
    .index('by_user_and_club', ['userTokenIdentifier', 'clubId'])
    .index('by_user_and_event', ['userTokenIdentifier', 'eventId']),
});
