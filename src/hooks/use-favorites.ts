import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import type { Id } from '../../convex/_generated/dataModel';

type FavoriteEntityType = 'club' | 'event';

type ToggleFavoriteArgs =
  | {
      entityType: 'club';
      clubId: Id<'clubs'>;
    }
  | {
      entityType: 'event';
      eventId: Id<'events'>;
    };

export function useFavorites() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const clubIds = new Set<Id<'clubs'>>();
  const eventIds = new Set<Id<'events'>>();

  const isClubFavorited = (clubId: Id<'clubs'>) => clubIds.has(clubId);
  const isEventFavorited = (eventId: Id<'events'>) => eventIds.has(eventId);

  const requestSignIn = () => {
    Alert.alert(
      'Anmeldung erforderlich',
      'Zum Speichern von Favoriten melde dich bitte im Profil an.',
      [{ text: 'Zum Profil', onPress: () => router.push('/profile') }, { text: 'Abbrechen', style: 'cancel' }],
    );
  };

  const toggle = async (args: ToggleFavoriteArgs) => {
    if (!isSignedIn) {
      requestSignIn();
      return null;
    }

    Alert.alert(
      'Speichern noch nicht moeglich',
      'Favoriten brauchen noch die Convex-Anbindung an Clerk. Clubs und Events bleiben trotzdem verfuegbar.',
    );
    return null;
  };

  return {
    isSignedIn: Boolean(isSignedIn),
    isConvexAuthenticated: false,
    isLoading: false,
    clubIds,
    eventIds,
    isClubFavorited,
    isEventFavorited,
    toggle,
  };
}

export type { FavoriteEntityType };
