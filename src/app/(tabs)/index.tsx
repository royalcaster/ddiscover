import type { Id } from '../../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import * as Location from 'expo-location';
import React from 'react';
import { Alert, Linking, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { DiscoverBottomSheet } from '@/components/discover-bottom-sheet';
import { DiscoverMap } from '@/components/discover-map';
import { useFavorites } from '@/hooks/use-favorites';
import { resolveClubCoordinates, DRESDEN_CENTER } from '@/lib/club-locations';
import type { MapRegion } from '@/lib/map-types';
import { openEventDetail } from '@/lib/navigation';

type MarkerItem = {
  id: string;
  clubId: Id<'clubs'>;
  name: string;
  district?: string;
  latitude: number;
  longitude: number;
};

const INITIAL_REGION: MapRegion = {
  latitude: DRESDEN_CENTER.latitude,
  longitude: DRESDEN_CENTER.longitude,
  latitudeDelta: 0.09,
  longitudeDelta: 0.08,
};

function toLocalDayKey(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const clubsQuery = useQuery(api.clubs.list, { limit: 72 });
  const eventsQuery = useQuery(api.events.listUpcoming, { limit: 120 });
  const clubs = React.useMemo(() => clubsQuery ?? [], [clubsQuery]);
  const events = React.useMemo(() => eventsQuery ?? [], [eventsQuery]);
  const favorites = useFavorites();

  const [, setRegion] = React.useState(INITIAL_REGION);
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string | null>(null);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [cameraTarget, setCameraTarget] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [openTodayOnly, setOpenTodayOnly] = React.useState(false);

  const todayKey = React.useMemo(() => toLocalDayKey(Date.now()), []);
  const clubIdsWithEventsToday = React.useMemo(
    () =>
      new Set(
        events
          .filter((event) => toLocalDayKey(event.startsAt) === todayKey)
          .map((event) => event.clubId),
      ),
    [events, todayKey],
  );

  const markers = React.useMemo<MarkerItem[]>(() => {
    return clubs
      .filter((club) => !openTodayOnly || clubIdsWithEventsToday.has(club._id))
      .map((club) => {
        const coordinates = resolveClubCoordinates(club.slug, club.latitude, club.longitude);
        return {
          id: club._id,
          clubId: club._id,
          name: club.name,
          district: club.city,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      });
  }, [clubIdsWithEventsToday, clubs, openTodayOnly]);

  React.useEffect(() => {
    if (selectedMarkerId && !markers.some((marker) => marker.id === selectedMarkerId)) {
      setSelectedMarkerId(markers[0]?.id ?? null);
      setCameraTarget(null);
      return;
    }

    if (!selectedMarkerId && markers.length > 0) {
      setSelectedMarkerId(markers[0].id);
    }
  }, [markers, selectedMarkerId]);

  const markerById = React.useMemo(
    () => new Map(markers.map((marker) => [marker.id, marker])),
    [markers],
  );

  const selectedMarker = selectedMarkerId ? markerById.get(selectedMarkerId) : null;
  const selectedClub = selectedMarker ? clubs.find((club) => club._id === selectedMarker.clubId) ?? null : null;

  const selectedClubEvents = React.useMemo(
    () =>
      selectedClub
        ? events
            .filter((event) => event.clubId === selectedClub._id)
            .filter((event) => !openTodayOnly || toLocalDayKey(event.startsAt) === todayKey)
            .sort((a, b) => a.startsAt - b.startsAt)
        : [],
    [events, openTodayOnly, selectedClub, todayKey],
  );

  const centerOnUserLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Standort nicht freigegeben',
          'Erlaube den Standortzugriff, um die Karte auf deine Position zu zentrieren.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coordinates);
      setCameraTarget(coordinates);
    } catch (error) {
      console.warn('Failed to get current location', error);
      Alert.alert('Standort nicht verfuegbar', 'Dein Standort konnte gerade nicht geladen werden.');
    }
  };

  const openSource = (url?: string) => {
    if (!url) return;
    void Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-background">
      <DiscoverMap
        markers={markers.map((marker) => ({
          id: marker.id,
          title: marker.name,
          subtitle: marker.district,
          latitude: marker.latitude,
          longitude: marker.longitude,
        }))}
        selectedMarkerId={selectedMarkerId}
        userLocation={userLocation}
        cameraTarget={cameraTarget}
        initialRegion={INITIAL_REGION}
        openTodayOnly={openTodayOnly}
        onRegionChangeComplete={setRegion}
        onSelectMarker={(markerId) => {
          setCameraTarget(null);
          setSelectedMarkerId(markerId);
        }}
        onCenterUserLocation={() => {
          void centerOnUserLocation();
        }}
        onToggleOpenToday={() => setOpenTodayOnly((value) => !value)}
      />

      <DiscoverBottomSheet
        selectedClub={selectedClub}
        events={selectedClubEvents}
        bottomInset={Math.max(insets.bottom, 8)}
        isClubFavorited={favorites.isClubFavorited}
        isEventFavorited={favorites.isEventFavorited}
        onToggleClubFavorite={(clubId) =>
          void favorites.toggle({
            entityType: 'club',
            clubId,
          })
        }
        onToggleEventFavorite={(eventId) =>
          void favorites.toggle({
            entityType: 'event',
            eventId,
          })
        }
        onOpenEvent={openEventDetail}
        onOpenSource={openSource}
      />
    </View>
  );
}
