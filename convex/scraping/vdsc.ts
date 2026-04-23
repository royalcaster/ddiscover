"use node";

import { v } from 'convex/values';

import { internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';
import { parseVdscCalendarEvents } from './vdscParser';

const VDSC_EVENTS_URL = 'https://events.vdsc.de/calendar.json';

async function fetchVdscEvents() {
  const response = await fetch(VDSC_EVENTS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch VDSC events: ${response.status} ${response.statusText}`);
  }

  const json: unknown = await response.json();
  return parseVdscCalendarEvents(json);
}

export const previewEvents = action({
  args: {},
  handler: async () => {
    const events = await fetchVdscEvents();

    return {
      scraped: events.length,
      sample: events.slice(0, 5),
    };
  },
});

export const importEvents = internalAction({
  args: {},
  handler: async (ctx) => {
    const scrapedAt = Date.now();
    const events = await fetchVdscEvents();

    const stored: {
      received: number;
      inserted: number;
      updated: number;
    } = await ctx.runMutation(internal.events.upsertScrapedVdscEvents, {
      events,
      scrapedAt,
    });

    return {
      scraped: events.length,
      stored,
    };
  },
});
