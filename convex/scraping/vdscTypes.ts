import { v } from 'convex/values';

import type { Id } from '../_generated/dataModel';

export const scrapedVdscEventValidator = v.object({
  clubName: v.string(),
  locationName: v.string(),
  rawLocation: v.string(),
  addressLine: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  city: v.optional(v.string()),
  dayText: v.string(),
  timeText: v.string(),
  title: v.string(),
  startsAt: v.number(),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  source: v.literal('vdsc'),
  sourceKey: v.string(),
  sourceUrl: v.optional(v.string()),
  imageStorageId: v.optional(v.id('_storage')),
  imageSourceUrl: v.optional(v.string()),
});

export type ScrapedVdscEvent = {
  clubName: string;
  locationName: string;
  rawLocation: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
  dayText: string;
  timeText: string;
  title: string;
  startsAt: number;
  latitude?: number;
  longitude?: number;
  source: 'vdsc';
  sourceKey: string;
  sourceUrl?: string;
  imageStorageId?: Id<'_storage'>;
  imageSourceUrl?: string;
};
