import type { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Building2, CalendarClock, ExternalLink, Heart, MapPin } from 'lucide-react-native';
import React from 'react';
import { Linking, View } from 'react-native';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { DiscoverMap } from '@/components/discover-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { resolveClubCoordinates, DRESDEN_CENTER } from '@/lib/club-locations';

type MarkerItem = {
  id: string;
  clubId: Id<'clubs'>;
  name: string;
  district?: string;
  latitude: number;
  longitude: number;
};

const INITIAL_REGION: Region = {
  latitude: DRESDEN_CENTER.latitude,
  longitude: DRESDEN_CENTER.longitude,
  latitudeDelta: 0.09,
  longitudeDelta: 0.08,
};

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
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

  const markers = React.useMemo<MarkerItem[]>(
    () =>
      clubs.map((club) => {
        const coordinates = resolveClubCoordinates(club.slug, club.latitude, club.longitude);
        return {
          id: club._id,
          clubId: club._id,
          name: club.name,
          district: club.city,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      }),
    [clubs],
  );

  React.useEffect(() => {
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
            .sort((a, b) => a.startsAt - b.startsAt)
        : [],
    [events, selectedClub],
  );

  const selectedEvent = selectedClubEvents[0] ?? null;

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
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={setRegion}
        onSelectMarker={setSelectedMarkerId}
      />

      <View
        className="absolute left-3 right-3"
        style={{ bottom: Math.max(insets.bottom - 6, 4) }}>
        {selectedClub ? (
          <Card className="rounded-[14px] border-border/80 py-0">
            <CardContent className="gap-3 px-4 py-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-semibold">{selectedClub.name}</Text>
                  <View className="flex-row items-center gap-2">
                    <MapPin size={13} color="#8c8d90" />
                    <Text className="text-muted-foreground text-sm">
                      {selectedClub.city ?? 'Dresden'}
                    </Text>
                  </View>
                </View>
                <Badge variant="outline" className="rounded-full px-2.5 py-1">
                  <Text>{selectedClubEvents.length} Events</Text>
                </Badge>
              </View>

              {selectedEvent ? (
                <View className="gap-2">
                  <Text className="text-base font-semibold">{selectedEvent.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <CalendarClock size={14} color="#8c8d90" />
                    <Text className="text-muted-foreground text-sm">
                      {formatDateTime(selectedEvent.startsAt)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-muted-foreground text-sm">
                  Keine bevorstehenden Events fuer diesen Club.
                </Text>
              )}

              <View className="flex-row flex-wrap gap-2">
                {selectedEvent ? (
                  <Button
                    variant={favorites.isEventFavorited(selectedEvent._id) ? 'default' : 'outline'}
                    className="rounded-full"
                    onPress={() =>
                      void favorites.toggle({
                        entityType: 'event',
                        eventId: selectedEvent._id,
                      })
                    }>
                    <Heart
                      size={14}
                      color={favorites.isEventFavorited(selectedEvent._id) ? '#111' : '#f4d63d'}
                      fill={favorites.isEventFavorited(selectedEvent._id) ? '#111' : 'transparent'}
                    />
                    <Text>
                      {favorites.isEventFavorited(selectedEvent._id) ? 'Event gespeichert' : 'Event speichern'}
                    </Text>
                  </Button>
                ) : null}

                <Button
                  variant={favorites.isClubFavorited(selectedClub._id) ? 'default' : 'outline'}
                  className="rounded-full"
                  onPress={() =>
                    void favorites.toggle({
                      entityType: 'club',
                      clubId: selectedClub._id,
                    })
                  }>
                  <Building2 size={14} color={favorites.isClubFavorited(selectedClub._id) ? '#111' : '#f4d63d'} />
                  <Text>{favorites.isClubFavorited(selectedClub._id) ? 'Club gespeichert' : 'Club speichern'}</Text>
                </Button>

                {selectedEvent?.sourceUrl ? (
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onPress={() => openSource(selectedEvent.sourceUrl)}>
                    <ExternalLink size={14} />
                    <Text>Quelle</Text>
                  </Button>
                ) : null}
              </View>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-[14px] py-0">
            <CardContent className="px-4 py-4">
              <Text className="text-muted-foreground text-sm">
                Keine Clubs verfuegbar.
              </Text>
            </CardContent>
          </Card>
        )}
      </View>
    </View>
  );
}
