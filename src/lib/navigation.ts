import { router } from 'expo-router';

import type { Id } from '../../convex/_generated/dataModel';

/**
 * Opens the canonical event detail route for a Convex event id.
 */
export function openEventDetail(eventId: Id<'events'>) {
  router.push({ pathname: '/event/[eventId]', params: { eventId } });
}

/**
 * Opens the calendar tab from nested discovery/event UI actions.
 */
export function openCalendar() {
  router.push('/calendar');
}
