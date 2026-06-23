"use node";

import * as dvb from 'dvbjs';
import { v } from 'convex/values';

import { action } from './_generated/server';

type DvbPoint = {
  id: string;
  name: string;
  city: string;
};

function compactPoint(point: { id: string; name: string; city: string }): DvbPoint {
  return {
    id: point.id,
    name: point.name,
    city: point.city,
  };
}

function timestamp(value: Date | undefined) {
  return value ? value.getTime() : null;
}

function trimString(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export const planRoute = action({
  args: {
    originQuery: v.string(),
    destinationAddress: v.optional(v.string()),
    destinationName: v.optional(v.string()),
    destinationLatitude: v.optional(v.number()),
    destinationLongitude: v.optional(v.number()),
    arrivalAt: v.number(),
  },
  handler: async (_ctx, args) => {
    const originQuery = trimString(args.originQuery);
    if (!originQuery) {
      return {
        status: 'error' as const,
        message: 'Bitte gib eine Start-Haltestelle ein.',
      };
    }

    const originMatches = await dvb.findStop(originQuery, 8000);
    const origin = originMatches[0];
    if (!origin) {
      return {
        status: 'error' as const,
        message: 'Keine passende Start-Haltestelle gefunden.',
      };
    }

    const destinationStops =
      args.destinationLatitude !== undefined && args.destinationLongitude !== undefined
        ? (await dvb.findAddress(args.destinationLongitude, args.destinationLatitude, 8000))?.stops ?? []
        : trimString(args.destinationAddress)
          ? await dvb.findNearbyStops(trimString(args.destinationAddress)!, 8000)
          : trimString(args.destinationName)
            ? await dvb.findStop(trimString(args.destinationName)!, 8000)
            : [];

    const destination = destinationStops[0];
    if (!destination) {
      return {
        status: 'error' as const,
        message: 'Keine nahe DVB-Haltestelle fuer den Veranstaltungsort gefunden.',
        origin: compactPoint(origin),
      };
    }

    const route = await dvb.route(origin.id, destination.id, new Date(args.arrivalAt), true, 12000);

    return {
      status: 'ok' as const,
      origin: compactPoint(origin),
      destination: compactPoint(destination),
      trips: route.trips.slice(0, 3).map((trip) => ({
        duration: trip.duration,
        interchanges: trip.interchanges,
        departureTime: timestamp(trip.departure?.time),
        arrivalTime: timestamp(trip.arrival?.time),
        legs: trip.nodes.map((node) => ({
          line: node.line,
          direction: node.direction,
          mode: node.mode?.title ?? node.mode?.name ?? null,
          duration: node.duration,
          departureStop: node.departure?.name ?? null,
          arrivalStop: node.arrival?.name ?? null,
          departureTime: timestamp(node.departure?.time),
          arrivalTime: timestamp(node.arrival?.time),
          stopCount: node.stops.length,
        })),
      })),
    };
  },
});
