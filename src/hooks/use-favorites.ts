import { useAuth } from '@clerk/expo';
import { ConvexHttpClient } from 'convex/browser';
import React from 'react';
import { Alert } from 'react-native';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { publicConvexUrl } from '@/lib/public-config';
import { useFavoriteSignInPrompt } from '@/providers/favorite-sign-in-provider';

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

type FavoriteIds = {
  clubIds: Set<Id<'clubs'>>;
  eventIds: Set<Id<'events'>>;
};

function createEmptyFavoriteIds(): FavoriteIds {
  return {
    clubIds: new Set<Id<'clubs'>>(),
    eventIds: new Set<Id<'events'>>(),
  };
}

function createAuthenticatedConvexClient(token: string) {
  if (!publicConvexUrl) {
    throw new Error('EXPO_PUBLIC_CONVEX_URL is not configured.');
  }

  return new ConvexHttpClient(publicConvexUrl, { auth: token, logger: false });
}

/**
 * Central favorite state facade used by screens and map actions. Favorites use
 * Convex's HTTP client so authenticated saves do not depend on realtime
 * WebSocket connectivity in standalone APK builds.
 */
export function useFavorites() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { showSignInPrompt } = useFavoriteSignInPrompt();
  const getTokenRef = React.useRef(getToken);
  const [favoriteIds, setFavoriteIds] = React.useState<FavoriteIds>(() => createEmptyFavoriteIds());
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [authError, setAuthError] = React.useState<Error | null>(null);
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const getConvexToken = React.useCallback(
    async (skipCache = false) => {
      const token = await getTokenRef.current({ template: 'convex', skipCache });
      if (!token) {
        throw new Error('Clerk did not return a Convex JWT.');
      }
      return token;
    },
    [],
  );

  const refresh = React.useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!isLoaded) {
      setFavoriteIds(createEmptyFavoriteIds());
      setHasLoaded(false);
      setAuthError(null);
      setIsLoading(false);
      return;
    }

    if (!isSignedIn) {
      setFavoriteIds(createEmptyFavoriteIds());
      setHasLoaded(false);
      setAuthError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const token = await getConvexToken();
      const client = createAuthenticatedConvexClient(token);
      const favorites = await client.query(api.favorites.listMyFavorites, {});

      if (requestId !== requestIdRef.current) return;

      setFavoriteIds({
        clubIds: new Set(favorites.clubIds),
        eventIds: new Set(favorites.eventIds),
      });
      setHasLoaded(true);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.warn('[Favorites] Could not load favorites', error);
      setFavoriteIds(createEmptyFavoriteIds());
      setHasLoaded(true);
      setAuthError(error instanceof Error ? error : new Error('Could not load favorites.'));
    } finally {
      if (requestId !== requestIdRef.current) return;
      setIsLoading(false);
    }
  }, [getConvexToken, isLoaded, isSignedIn]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const isClubFavorited = React.useCallback(
    (clubId: Id<'clubs'>) => favoriteIds.clubIds.has(clubId),
    [favoriteIds.clubIds],
  );
  const isEventFavorited = React.useCallback(
    (eventId: Id<'events'>) => favoriteIds.eventIds.has(eventId),
    [favoriteIds.eventIds],
  );

  const toggle = React.useCallback(async (args: ToggleFavoriteArgs) => {
    if (!isSignedIn) {
      showSignInPrompt();
      return null;
    }

    try {
      const token = await getConvexToken(true);
      const client = createAuthenticatedConvexClient(token);
      const result = await client.mutation(api.favorites.toggleFavorite, args);

      setAuthError(null);
      setFavoriteIds((current) => {
        const clubIds = new Set(current.clubIds);
        const eventIds = new Set(current.eventIds);

        if (args.entityType === 'club') {
          if (result.favorited) {
            clubIds.add(args.clubId);
          } else {
            clubIds.delete(args.clubId);
          }
        } else if (result.favorited) {
          eventIds.add(args.eventId);
        } else {
          eventIds.delete(args.eventId);
        }

        return { clubIds, eventIds };
      });

      return result;
    } catch (error) {
      console.error('[Favorites] Could not toggle favorite', error);
      setAuthError(error instanceof Error ? error : new Error('Could not save favorite.'));
      Alert.alert(
        'Speichern fehlgeschlagen',
        'Der Favorit konnte gerade nicht gespeichert werden. Bitte versuche es gleich noch einmal.',
      );
      return null;
    }
  }, [getConvexToken, isSignedIn, showSignInPrompt]);

  return {
    isSignedIn: Boolean(isSignedIn),
    isConvexAuthenticated: Boolean(isSignedIn && !authError),
    isLoading: !isLoaded || (Boolean(isSignedIn) && (!hasLoaded || isLoading)),
    clubIds: favoriteIds.clubIds,
    eventIds: favoriteIds.eventIds,
    isClubFavorited,
    isEventFavorited,
    toggle,
    refresh,
  };
}

export type { FavoriteEntityType };
