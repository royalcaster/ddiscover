import type { Id } from '../../../convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarClock, ExternalLink, Globe2, Heart, MapPin, Music2, Navigation, Route, Share2 } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, ScrollView, Share, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';

const EVENT_HERO = require('../../../assets/images/logo-glow.png');

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatEventDate(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}

function formatEventTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatShortDateTime(timestamp: number | null) {
  if (!timestamp) return '--:--';
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatAddress(addressLine?: string, postalCode?: string, city?: string) {
  return [addressLine, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

function inferGenre(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('techno')) return 'Techno';
  if (normalized.includes('bass')) return 'Drum & Bass';
  if (normalized.includes('house')) return 'House';
  if (normalized.includes('karaoke')) return 'Karaoke';
  if (normalized.includes('quiz')) return 'Quiz';
  return 'Club Event';
}

type DvbRouteResult =
  | {
      status: 'error';
      message: string;
      origin?: {
        id: string;
        name: string;
        city: string;
      };
    }
  | {
      status: 'ok';
      origin: {
        id: string;
        name: string;
        city: string;
      };
      destination: {
        id: string;
        name: string;
        city: string;
      };
      trips: Array<{
        duration: number;
        interchanges: number;
        departureTime: number | null;
        arrivalTime: number | null;
        legs: Array<{
          line: string;
          direction: string;
          mode: string | null;
          duration: number;
          departureStop: string | null;
          arrivalStop: string | null;
          departureTime: number | null;
          arrivalTime: number | null;
          stopCount: number;
        }>;
      }>;
    };

type DvbRoutePlannerProps = {
  destinationAddress: string;
  destinationName: string;
  latitude?: number;
  longitude?: number;
  arrivalAt: number;
};

function DvbRoutePlanner({
  destinationAddress,
  destinationName,
  latitude,
  longitude,
  arrivalAt,
}: DvbRoutePlannerProps) {
  const theme = useTheme();
  const planRoute = useAction(api.dvb.planRoute);
  const [originQuery, setOriginQuery] = React.useState('Hauptbahnhof');
  const [routeResult, setRouteResult] = React.useState<DvbRouteResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const canPlanRoute = Boolean(destinationAddress || destinationName || (latitude !== undefined && longitude !== undefined));

  const loadRoute = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await planRoute({
        originQuery,
        destinationAddress: destinationAddress || undefined,
        destinationName: destinationName || undefined,
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        arrivalAt: Math.max(Date.now(), arrivalAt - 15 * 60 * 1000),
      });
      setRouteResult(result);
    } catch (error) {
      console.warn('Failed to load DVB route', error);
      setRouteResult({
        status: 'error',
        message: 'DVB-Verbindung konnte gerade nicht geladen werden.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [arrivalAt, destinationAddress, destinationName, latitude, longitude, originQuery, planRoute]);

  return (
    <View className="gap-4 rounded-[14px] border border-border bg-card px-4 py-4">
      <View className="flex-row items-center gap-2">
        <Navigation size={18} color={theme.primary} />
        <Text className="text-base font-semibold">DVB Anreise</Text>
      </View>

      <View className="gap-2">
        <Text className="text-muted-foreground text-xs font-semibold uppercase">Start</Text>
        <TextInput
          value={originQuery}
          onChangeText={setOriginQuery}
          placeholder="Start-Haltestelle"
          placeholderTextColor={theme.mutedForeground}
          autoCapitalize="words"
          className="rounded-[12px] border border-border bg-secondary px-3 py-3 text-foreground"
        />
      </View>

      <View className="gap-1">
        <Text className="text-muted-foreground text-xs font-semibold uppercase">Ziel</Text>
        <Text className="text-sm font-semibold">{destinationName || destinationAddress || 'Veranstaltungsort'}</Text>
      </View>

      <Button
        variant="secondary"
        className="rounded-full"
        disabled={!canPlanRoute || isLoading}
        onPress={() => void loadRoute()}>
        <Route size={16} color={theme.foreground} />
        <Text>{isLoading ? 'Route wird geladen...' : 'Route berechnen'}</Text>
      </Button>

      {!canPlanRoute ? (
        <Text className="text-muted-foreground text-sm">Fuer dieses Event fehlen noch Adressdaten.</Text>
      ) : routeResult?.status === 'error' ? (
        <Text className="text-muted-foreground text-sm">{routeResult.message}</Text>
      ) : routeResult?.status === 'ok' ? (
        <View className="gap-3">
          <Text className="text-muted-foreground text-xs">
            {routeResult.origin.name} {'->'} {routeResult.destination.name}
          </Text>
          {routeResult.trips.length === 0 ? (
            <Text className="text-muted-foreground text-sm">Keine passende Verbindung gefunden.</Text>
          ) : (
            routeResult.trips.map((trip, tripIndex) => (
              <View key={`${trip.departureTime}-${tripIndex}`} className="gap-3 rounded-[12px] bg-secondary px-3 py-3">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-sm font-semibold">
                    {formatShortDateTime(trip.departureTime)} - {formatShortDateTime(trip.arrivalTime)}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {trip.duration} Min, {trip.interchanges} Umstieg{trip.interchanges === 1 ? '' : 'e'}
                  </Text>
                </View>
                <View className="gap-2">
                  {trip.legs.map((leg, legIndex) => (
                    <View key={`${leg.line}-${legIndex}`} className="flex-row gap-2">
                      <View className="min-w-[46px] items-center rounded-full bg-primary px-2 py-1">
                        <Text className="text-xs font-bold text-primary-foreground">{leg.line || leg.mode || 'Fuss'}</Text>
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold" numberOfLines={1}>
                          {leg.direction || leg.arrivalStop || 'Verbindung'}
                        </Text>
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                          {formatShortDateTime(leg.departureTime)} {leg.departureStop ?? ''} {'->'}{' '}
                          {formatShortDateTime(leg.arrivalTime)} {leg.arrivalStop ?? ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      ) : (
        <Text className="text-muted-foreground text-sm">
          Berechnet eine DVB-Verbindung zur naechsten Haltestelle am Veranstaltungsort.
        </Text>
      )}
    </View>
  );
}

export default function EventDetailScreen() {
  const theme = useTheme();
  const favorites = useFavorites();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = getParamValue(params.eventId) as Id<'events'> | undefined;
  const detailQuery = usePublicConvexQuery(api.events.getById, eventId ? { eventId } : null);
  const detail = detailQuery.data;
  const event = detail?.event;
  const club = detail?.club;
  const favorited = event ? favorites.isEventFavorited(event._id) : false;
  const heroImageSource = event?.imageUrl ? { uri: event.imageUrl } : EVENT_HERO;

  const address = event
    ? formatAddress(event.addressLine ?? club?.addressLine, event.postalCode ?? club?.postalCode, event.city ?? club?.city)
    : '';
  const websiteUrl = club?.websiteUrl;

  const shareEvent = () => {
    if (!event) return;
    void Share.share({
      message: `${event.title} - ${formatEventDate(event.startsAt)}, ${formatEventTime(event.startsAt)} bei ${club?.name ?? event.locationName ?? 'DDiscover'}`,
      title: event.title,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        <View className="relative h-[300px] overflow-hidden bg-secondary">
          <Image source={heroImageSource} className="h-full w-full opacity-90" contentFit="cover" />
          <View className="absolute inset-0 bg-black/35" />
          <View className="absolute left-4 right-4 top-3 flex-row items-center justify-between">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/45" onPress={() => router.back()}>
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View className="flex-row gap-2">
              {event ? (
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                  onPress={() => void favorites.toggle({ entityType: 'event', eventId: event._id })}>
                  <Heart size={19} color="#fff" fill={favorited ? '#f4d63d' : 'transparent'} />
                </Pressable>
              ) : null}
              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/45" onPress={shareEvent}>
                <Share2 size={19} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {detailQuery.isLoading ? (
          <View className="mx-auto w-full max-w-[560px] px-4 py-6">
            <Text className="text-muted-foreground text-sm">Event wird geladen...</Text>
          </View>
        ) : detailQuery.error || !event ? (
          <View className="mx-auto w-full max-w-[560px] gap-3 px-4 py-6">
            <Text className="text-xl font-semibold">Event nicht gefunden</Text>
            <Text className="text-muted-foreground text-sm">
              {detailQuery.error
                ? `Convex konnte nicht geladen werden: ${detailQuery.error.message}`
                : 'Dieses Event ist nicht mehr verfuegbar.'}
            </Text>
          </View>
        ) : (
          <View className="mx-auto -mt-6 w-full max-w-[560px] gap-4 px-4">
            <View className="gap-3 rounded-[16px] border border-border bg-card px-4 py-4">
              <View className="gap-1">
                <Text className="text-[28px] font-bold leading-9 text-foreground">{event.title}</Text>
                <Text className="text-muted-foreground text-sm">{club?.name ?? event.locationName ?? 'Dresden'}</Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                  <Music2 size={14} color={theme.primary} />
                  <Text className="text-xs font-semibold">{inferGenre(event.title)}</Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                  <CalendarClock size={14} color={theme.primary} />
                  <Text className="text-xs font-semibold">{formatEventTime(event.startsAt)}</Text>
                </View>
              </View>
            </View>

            <View className="overflow-hidden rounded-[14px] border border-border bg-card">
              <View className="gap-1 border-b border-border px-4 py-4">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">Datum</Text>
                <Text className="text-sm font-semibold">{formatEventDate(event.startsAt)}</Text>
              </View>
              <View className="gap-1 border-b border-border px-4 py-4">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">Adresse</Text>
                <View className="flex-row items-start gap-2">
                  <MapPin size={16} color={theme.mutedForeground} style={{ marginTop: 1 }} />
                  <Text className="flex-1 text-sm">{address || event.locationName || club?.name || 'Dresden'}</Text>
                </View>
              </View>
              {websiteUrl ? (
                <Pressable className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-4" onPress={() => void Linking.openURL(websiteUrl)}>
                  <View className="gap-1">
                    <Text className="text-muted-foreground text-xs font-semibold uppercase">Club Website</Text>
                    <Text className="text-sm font-semibold">{websiteUrl.replace(/^https?:\/\//, '')}</Text>
                  </View>
                  <Globe2 size={18} color={theme.mutedForeground} />
                </Pressable>
              ) : null}
              {event.sourceUrl ? (
                <Pressable className="flex-row items-center justify-between gap-3 px-4 py-4" onPress={() => void Linking.openURL(event.sourceUrl!)}>
                  <View className="gap-1">
                    <Text className="text-muted-foreground text-xs font-semibold uppercase">Quelle</Text>
                    <Text className="text-sm font-semibold">Original Eventseite</Text>
                  </View>
                  <ExternalLink size={18} color={theme.mutedForeground} />
                </Pressable>
              ) : null}
            </View>

            <DvbRoutePlanner
              destinationAddress={address}
              destinationName={club?.name ?? event.locationName ?? event.title}
              latitude={event.latitude ?? club?.latitude}
              longitude={event.longitude ?? club?.longitude}
              arrivalAt={event.startsAt}
            />

            <Button
              variant={favorited ? 'default' : 'outline'}
              className="rounded-full"
              onPress={() => void favorites.toggle({ entityType: 'event', eventId: event._id })}>
              <Heart size={16} color={favorited ? '#111' : theme.primary} fill={favorited ? '#111' : 'transparent'} />
              <Text>{favorited ? 'Event gespeichert' : 'Event speichern'}</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
