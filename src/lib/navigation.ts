import { router } from 'expo-router';

import type { Id } from '../../convex/_generated/dataModel';

export function openEventDetail(eventId: Id<'events'>) {
  router.push({ pathname: '/event/[eventId]', params: { eventId } });
}
