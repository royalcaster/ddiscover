import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  clubs: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    googlePlaceId: v.optional(v.string()),
    googleTypes: v.optional(v.array(v.string())),
    googleBusinessStatus: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    regularOpeningHoursText: v.optional(v.string()),
    venueCategory: v.optional(v.string()),
    reviewStatus: v.optional(v.union(v.literal('approved'), v.literal('manual'))),
    sourceConfidence: v.optional(v.number()),
    source: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    lastScrapedAt: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_name', ['name'])
    .index('by_google_place_id', ['googlePlaceId']),

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
    imageStorageId: v.optional(v.id('_storage')),
    imageSourceUrl: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sourceConfidence: v.optional(v.number()),
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

  ingestionSources: defineTable({
    sourceKey: v.string(),
    name: v.string(),
    sourceType: v.union(
      v.literal('vdsc'),
      v.literal('venue_website'),
      v.literal('calendar_page'),
      v.literal('google_places'),
      v.literal('manual'),
      v.literal('other'),
    ),
    url: v.optional(v.string()),
    enabled: v.boolean(),
    lastFetchedAt: v.optional(v.number()),
    lastSuccessfulExtractAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    retryCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_source_key', ['sourceKey'])
    .index('by_enabled', ['enabled']),

  venueCandidates: defineTable({
    sourceKey: v.string(),
    sourceName: v.string(),
    sourceUrl: v.optional(v.string()),
    name: v.string(),
    normalizedName: v.string(),
    addressLine: v.optional(v.string()),
    city: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    googlePlaceId: v.optional(v.string()),
    googleName: v.optional(v.string()),
    googleFormattedAddress: v.optional(v.string()),
    googleWebsiteUri: v.optional(v.string()),
    googleBusinessStatus: v.optional(v.string()),
    googleTypes: v.optional(v.array(v.string())),
    googleLatitude: v.optional(v.number()),
    googleLongitude: v.optional(v.number()),
    googleRegularOpeningHoursText: v.optional(v.string()),
    evidenceSnippets: v.array(v.string()),
    warnings: v.array(v.string()),
    confidence: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('needs_recheck'),
    ),
    publicClubId: v.optional(v.id('clubs')),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_source_key', ['sourceKey'])
    .index('by_google_place_id', ['googlePlaceId']),

  eventCandidates: defineTable({
    sourceKey: v.string(),
    sourceName: v.string(),
    sourceUrl: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    venueName: v.string(),
    venueCandidateId: v.optional(v.id('venueCandidates')),
    publicClubId: v.optional(v.id('clubs')),
    ticketUrl: v.optional(v.string()),
    imageSourceUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    evidenceSnippets: v.array(v.string()),
    warnings: v.array(v.string()),
    confidence: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('needs_recheck'),
    ),
    publicEventId: v.optional(v.id('events')),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_source_key', ['sourceKey'])
    .index('by_starts_at', ['startsAt']),

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
