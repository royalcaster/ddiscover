import { useAuth } from '@clerk/expo';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
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
  const convexAuth = useConvexAuth();
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

    if (convexAuth.isLoading) {
      Alert.alert(
        'Bitte kurz warten',
        'Deine Anmeldung wird noch vorbereitet. Versuche es gleich erneut.',
      );
      return null;
    }

    if (!convexAuth.isAuthenticated) {
      if (__DEV__) {
        console.warn('[useFavorites] Clerk signed in but Convex auth is not authenticated.');
      }
      Alert.alert(
        'Speichern noch nicht moeglich',
        'Bitte oeffne dein Profil und melde dich erneut an.',
      );
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
        'Speichern fehlgeschlagen',
        'Favorit konnte nicht gespeichert werden. Bitte versuche es spaeter erneut.',
      );
      return null;
    }
  };

  return {
    isSignedIn: Boolean(isSignedIn),
    isConvexAuthenticated: convexAuth.isAuthenticated,
    isLoading: favorites === undefined || convexAuth.isLoading,
    clubIds,
    eventIds,
    isClubFavorited,
    isEventFavorited,
    toggle,
  };
}

export type { FavoriteEntityType };
