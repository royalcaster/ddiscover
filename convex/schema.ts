import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  clubs: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    lastScrapedAt: v.optional(v.number()),
  }).index('by_slug', ['slug']),

  events: defineTable({
    clubId: v.id('clubs'),
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    locationName: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
    lastScrapedAt: v.optional(v.number()),
  })
    .index('by_club', ['clubId'])
    .index('by_starts_at', ['startsAt']),
});
