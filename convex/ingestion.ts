import { v, type Infer } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';

const candidateStatusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
  v.literal('needs_recheck'),
);

const sourceTypeValidator = v.union(
  v.literal('vdsc'),
  v.literal('venue_website'),
  v.literal('calendar_page'),
  v.literal('google_places'),
  v.literal('manual'),
  v.literal('other'),
);

const ingestionSourceInputValidator = v.object({
  sourceKey: v.optional(v.string()),
  name: v.string(),
  sourceType: sourceTypeValidator,
  url: v.optional(v.string()),
  fetchedAt: v.optional(v.number()),
});

const googlePlaceInputValidator = v.object({
  placeId: v.string(),
  name: v.optional(v.string()),
  formattedAddress: v.optional(v.string()),
  websiteUri: v.optional(v.string()),
  businessStatus: v.optional(v.string()),
  types: v.optional(v.array(v.string())),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  regularOpeningHoursText: v.optional(v.string()),
});

const venueCandidateInputValidator = v.object({
  sourceKey: v.optional(v.string()),
  name: v.string(),
  addressLine: v.optional(v.string()),
  city: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  category: v.optional(v.string()),
  googlePlace: v.optional(googlePlaceInputValidator),
  evidenceSnippets: v.optional(v.array(v.string())),
  warnings: v.optional(v.array(v.string())),
  confidence: v.optional(v.number()),
});

const eventCandidateInputValidator = v.object({
  sourceKey: v.optional(v.string()),
  title: v.string(),
  description: v.optional(v.string()),
  startsAt: v.number(),
  endsAt: v.optional(v.number()),
  venueName: v.string(),
  venueCandidateSourceKey: v.optional(v.string()),
  sourceUrl: v.string(),
  ticketUrl: v.optional(v.string()),
  imageSourceUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  evidenceSnippets: v.optional(v.array(v.string())),
  warnings: v.optional(v.array(v.string())),
  confidence: v.optional(v.number()),
});

export const ingestionCandidatePayloadValidator = v.object({
  source: ingestionSourceInputValidator,
  venues: v.optional(v.array(venueCandidateInputValidator)),
  events: v.optional(v.array(eventCandidateInputValidator)),
});

type IngestionSourceInput = Infer<typeof ingestionSourceInputValidator>;

const MAX_LIST_ITEMS = 100;
const MAX_TEXT_LENGTH = 2000;
const DEFAULT_CONFIDENCE = 0.5;

function clampConfidence(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_CONFIDENCE;
  }

  return Math.max(0, Math.min(1, value));
}

function truncateText(value?: string, maxLength = MAX_TEXT_LENGTH) {
  const trimmed = value?.replace(/\s+/g, ' ').trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function normalizeList(values?: string[], maxItems = 8, maxLength = 500) {
  if (!values) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values) {
    const text = truncateText(value, maxLength);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    normalized.push(text);
    if (normalized.length >= maxItems) break;
  }

  return normalized;
}

function normalizeLookupValue(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugPart(value: string) {
  return normalizeLookupValue(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildSourceKey(parts: Array<string | number | undefined>) {
  return parts
    .map((part) => (typeof part === 'number' ? new Date(part).toISOString() : part))
    .filter((part): part is string => Boolean(part))
    .map(slugPart)
    .filter(Boolean)
    .join('__')
    .slice(0, 512);
}

function getAdminEmails() {
  return new Set(
    (process.env.DDISCOVER_ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const email = identity?.email?.trim().toLowerCase();
  const allowedEmails = getAdminEmails();

  if (!email || !allowedEmails.has(email)) {
    throw new Error('Admin access required');
  }

  return email;
}

async function upsertIngestionSource(
  ctx: MutationCtx,
  source: IngestionSourceInput,
  now: number,
) {
  const sourceKey = source.sourceKey?.trim() || buildSourceKey([source.sourceType, source.url, source.name]);
  const existing = await ctx.db
    .query('ingestionSources')
    .withIndex('by_source_key', (q) => q.eq('sourceKey', sourceKey))
    .unique();

  const document = {
    sourceKey,
    name: truncateText(source.name, 200) ?? sourceKey,
    sourceType: source.sourceType,
    url: truncateText(source.url, 1000),
    enabled: true,
    lastFetchedAt: source.fetchedAt ?? now,
    lastSuccessfulExtractAt: now,
    lastError: undefined,
    retryCount: 0,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, document);
  } else {
    await ctx.db.insert('ingestionSources', {
      ...document,
      createdAt: now,
    });
  }

  return sourceKey;
}

async function findPublicClubByVenueCandidate(
  ctx: MutationCtx,
  candidate: Doc<'venueCandidates'>,
) {
  if (candidate.publicClubId) {
    const club = await ctx.db.get(candidate.publicClubId);
    if (club) return club;
  }

  if (candidate.googlePlaceId) {
    const byGoogle = await ctx.db
      .query('clubs')
      .withIndex('by_google_place_id', (q) => q.eq('googlePlaceId', candidate.googlePlaceId))
      .unique();
    if (byGoogle) return byGoogle;
  }

  const slug = slugPart(candidate.googleName ?? candidate.name);
  if (!slug) return null;

  return await ctx.db
    .query('clubs')
    .withIndex('by_slug', (q) => q.eq('slug', slug))
    .unique();
}

export const ingestCandidatePayload = internalMutation({
  args: {
    payload: ingestionCandidatePayloadValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sourceKey = await upsertIngestionSource(ctx, args.payload.source, now);
    const sourceName = truncateText(args.payload.source.name, 200) ?? sourceKey;
    const sourceUrl = truncateText(args.payload.source.url, 1000);
    const venueIdBySourceKey = new Map<string, Id<'venueCandidates'>>();
    let venueCandidatesInserted = 0;
    let venueCandidatesUpdated = 0;
    let eventCandidatesInserted = 0;
    let eventCandidatesUpdated = 0;

    for (const venue of args.payload.venues ?? []) {
      const name = truncateText(venue.name, 200);
      if (!name) continue;

      const candidateSourceKey =
        venue.sourceKey?.trim() ||
        buildSourceKey([sourceKey, 'venue', venue.googlePlace?.placeId, name, venue.addressLine]);
      const normalizedName = normalizeLookupValue(venue.googlePlace?.name ?? name);
      const existing = await ctx.db
        .query('venueCandidates')
        .withIndex('by_source_key', (q) => q.eq('sourceKey', candidateSourceKey))
        .unique();
      const googleTypes = normalizeList(venue.googlePlace?.types, 16, 120);
      const document = {
        sourceKey: candidateSourceKey,
        sourceName,
        sourceUrl,
        name,
        normalizedName,
        addressLine: truncateText(venue.addressLine, 300),
        city: truncateText(venue.city, 120),
        websiteUrl: truncateText(venue.websiteUrl, 1000),
        category: truncateText(venue.category, 120),
        googlePlaceId: truncateText(venue.googlePlace?.placeId, 240),
        googleName: truncateText(venue.googlePlace?.name, 240),
        googleFormattedAddress: truncateText(venue.googlePlace?.formattedAddress, 500),
        googleWebsiteUri: truncateText(venue.googlePlace?.websiteUri, 1000),
        googleBusinessStatus: truncateText(venue.googlePlace?.businessStatus, 120),
        googleTypes: googleTypes.length > 0 ? googleTypes : undefined,
        googleLatitude: venue.googlePlace?.latitude,
        googleLongitude: venue.googlePlace?.longitude,
        googleRegularOpeningHoursText: truncateText(venue.googlePlace?.regularOpeningHoursText, 1200),
        evidenceSnippets: normalizeList(venue.evidenceSnippets, 8, 500),
        warnings: normalizeList(venue.warnings, 8, 300),
        confidence: clampConfidence(venue.confidence),
        updatedAt: now,
        lastSeenAt: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...document,
          status: existing.status === 'approved' || existing.status === 'rejected' ? existing.status : 'pending',
        });
        venueIdBySourceKey.set(candidateSourceKey, existing._id);
        venueCandidatesUpdated += 1;
      } else {
        const insertedId = await ctx.db.insert('venueCandidates', {
          ...document,
          status: 'pending',
          createdAt: now,
        });
        venueIdBySourceKey.set(candidateSourceKey, insertedId);
        venueCandidatesInserted += 1;
      }
    }

    for (const event of args.payload.events ?? []) {
      const title = truncateText(event.title, 240);
      const venueName = truncateText(event.venueName, 240);
      const sourceUrlValue = truncateText(event.sourceUrl, 1000);
      if (!title || !venueName || !sourceUrlValue) continue;

      const candidateSourceKey =
        event.sourceKey?.trim() ||
        buildSourceKey([sourceKey, 'event', event.startsAt, venueName, title, sourceUrlValue]);
      const venueCandidateId = event.venueCandidateSourceKey
        ? venueIdBySourceKey.get(event.venueCandidateSourceKey)
        : undefined;
      const existing = await ctx.db
        .query('eventCandidates')
        .withIndex('by_source_key', (q) => q.eq('sourceKey', candidateSourceKey))
        .unique();
      const document = {
        sourceKey: candidateSourceKey,
        sourceName,
        sourceUrl: sourceUrlValue,
        title,
        description: truncateText(event.description),
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        venueName,
        venueCandidateId: venueCandidateId ?? existing?.venueCandidateId,
        ticketUrl: truncateText(event.ticketUrl, 1000),
        imageSourceUrl: truncateText(event.imageSourceUrl, 1000),
        tags: normalizeList(event.tags, 12, 80),
        evidenceSnippets: normalizeList(event.evidenceSnippets, 8, 500),
        warnings: normalizeList(event.warnings, 8, 300),
        confidence: clampConfidence(event.confidence),
        updatedAt: now,
        lastSeenAt: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...document,
          status: existing.status === 'approved' || existing.status === 'rejected' ? existing.status : 'pending',
        });
        eventCandidatesUpdated += 1;
      } else {
        await ctx.db.insert('eventCandidates', {
          ...document,
          status: 'pending',
          createdAt: now,
        });
        eventCandidatesInserted += 1;
      }
    }

    return {
      venueCandidatesInserted,
      venueCandidatesUpdated,
      eventCandidatesInserted,
      eventCandidatesUpdated,
    };
  },
});

export const listReviewCandidates = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 40, MAX_LIST_ITEMS);
    const venueCandidates = await ctx.db
      .query('venueCandidates')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .take(limit);
    const eventCandidates = await ctx.db
      .query('eventCandidates')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .take(limit);
    const needsRecheckVenueCandidates = await ctx.db
      .query('venueCandidates')
      .withIndex('by_status', (q) => q.eq('status', 'needs_recheck'))
      .take(limit);
    const needsRecheckEventCandidates = await ctx.db
      .query('eventCandidates')
      .withIndex('by_status', (q) => q.eq('status', 'needs_recheck'))
      .take(limit);

    return {
      venueCandidates: [...venueCandidates, ...needsRecheckVenueCandidates].slice(0, limit),
      eventCandidates: [...eventCandidates, ...needsRecheckEventCandidates].slice(0, limit),
    };
  },
});

export const approveVenueCandidate = mutation({
  args: {
    candidateId: v.id('venueCandidates'),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireAdmin(ctx);
    const now = Date.now();
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      throw new Error('Venue candidate not found');
    }

    const existingClub = await findPublicClubByVenueCandidate(ctx, candidate);
    const publicDocument = {
      name: candidate.googleName ?? candidate.name,
      slug: slugPart(candidate.googleName ?? candidate.name),
      websiteUrl: candidate.googleWebsiteUri ?? candidate.websiteUrl,
      googlePlaceId: candidate.googlePlaceId,
      googleTypes: candidate.googleTypes,
      googleBusinessStatus: candidate.googleBusinessStatus,
      formattedAddress: candidate.googleFormattedAddress,
      regularOpeningHoursText: candidate.googleRegularOpeningHoursText,
      venueCategory: candidate.category,
      reviewStatus: 'approved' as const,
      sourceConfidence: candidate.confidence,
      source: candidate.sourceName,
      addressLine: candidate.googleFormattedAddress ?? candidate.addressLine,
      city: candidate.city ?? 'Dresden',
      latitude: candidate.googleLatitude ?? existingClub?.latitude,
      longitude: candidate.googleLongitude ?? existingClub?.longitude,
      lastScrapedAt: now,
    };

    const publicClubId =
      existingClub?._id ??
      (await ctx.db.insert('clubs', publicDocument));

    if (existingClub) {
      await ctx.db.patch(existingClub._id, publicDocument);
    }

    await ctx.db.patch(candidate._id, {
      status: 'approved',
      publicClubId,
      reviewedBy: reviewer,
      reviewedAt: now,
      updatedAt: now,
    });

    return { publicClubId };
  },
});

export const approveEventCandidate = mutation({
  args: {
    candidateId: v.id('eventCandidates'),
  },
  handler: async (ctx, args) => {
    const reviewer = await requireAdmin(ctx);
    const now = Date.now();
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      throw new Error('Event candidate not found');
    }

    let publicClubId = candidate.publicClubId;
    if (!publicClubId && candidate.venueCandidateId) {
      const venueCandidate = await ctx.db.get(candidate.venueCandidateId);
      publicClubId = venueCandidate?.publicClubId;
    }

    if (!publicClubId) {
      throw new Error('Approve or match the venue before approving this event');
    }

    const existingEvent = await ctx.db
      .query('events')
      .withIndex('by_source_and_source_key', (q) =>
        q.eq('source', candidate.sourceName).eq('sourceKey', candidate.sourceKey),
      )
      .unique();
    const eventDocument = {
      clubId: publicClubId,
      title: candidate.title,
      description: candidate.description,
      startsAt: candidate.startsAt,
      endsAt: candidate.endsAt,
      locationName: candidate.venueName,
      source: candidate.sourceName,
      sourceKey: candidate.sourceKey,
      sourceUrl: candidate.sourceUrl,
      imageSourceUrl: candidate.imageSourceUrl,
      ticketUrl: candidate.ticketUrl,
      tags: candidate.tags,
      sourceConfidence: candidate.confidence,
      lastScrapedAt: now,
    };

    const publicEventId =
      existingEvent?._id ??
      (await ctx.db.insert('events', eventDocument));

    if (existingEvent) {
      await ctx.db.patch(existingEvent._id, eventDocument);
    }

    await ctx.db.patch(candidate._id, {
      status: 'approved',
      publicClubId,
      publicEventId,
      reviewedBy: reviewer,
      reviewedAt: now,
      updatedAt: now,
    });

    return { publicEventId };
  },
});

export const updateCandidateStatus = mutation({
  args: {
    candidateType: v.union(v.literal('venue'), v.literal('event')),
    candidateId: v.string(),
    status: candidateStatusValidator,
  },
  handler: async (ctx, args) => {
    const reviewer = await requireAdmin(ctx);
    const now = Date.now();

    if (args.status === 'approved') {
      throw new Error('Use the approve action for approved candidates');
    }

    if (args.candidateType === 'venue') {
      await ctx.db.patch(args.candidateId as Id<'venueCandidates'>, {
        status: args.status,
        reviewedBy: reviewer,
        reviewedAt: now,
        updatedAt: now,
      });
      return { updated: true };
    }

    await ctx.db.patch(args.candidateId as Id<'eventCandidates'>, {
      status: args.status,
      reviewedBy: reviewer,
      reviewedAt: now,
      updatedAt: now,
    });
    return { updated: true };
  },
});
