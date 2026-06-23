import { useAuth } from '@clerk/expo';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { api } from '../../convex/_generated/api';
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
  const favorites = useQuery(api.favorites.listMyFavorites, {});
  const toggleFavorite = useMutation(api.favorites.toggleFavorite);

  const clubIds = new Set(favorites?.clubIds ?? []);
  const eventIds = new Set(favorites?.eventIds ?? []);

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

    try {
      if (args.entityType === 'club') {
        return await toggleFavorite({ entityType: 'club', clubId: args.clubId });
      }

      return await toggleFavorite({ entityType: 'event', eventId: args.eventId });
    } catch (error) {
      if (__DEV__) {
        console.error('[useFavorites] toggleFavorite failed:', error);
      }
      Alert.alert(
        'Speichern noch nicht moeglich',
        'Favoriten brauchen noch die Convex-Anbindung an Clerk. Clubs und Events bleiben trotzdem verfuegbar.',
      );
      return null;
    }
  };

  return {
    isSignedIn: Boolean(isSignedIn),
    isConvexAuthenticated: false,
    isLoading: favorites === undefined,
    clubIds,
    eventIds,
    isClubFavorited,
    isEventFavorited,
    toggle,
  };
}

export type { FavoriteEntityType };
