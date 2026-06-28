import type { Id } from '../../../convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarClock, ExternalLink, Footprints, Globe2, Heart, MapPin, Music2, Navigation, Route, Share2 } from 'lucide-react-native';
import React from 'react';
import { Image as NativeImage, Linking, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/providers/language-provider';

const EVENT_HERO = require('../../../assets/images/logo-glow.png');

const styles = StyleSheet.create({
  heroImage: {
    height: '100%',
    opacity: 0.9,
    width: '100%',
  },
});

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatEventDate(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}

function formatEventTime(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatShortDateTime(timestamp: number | null, locale: string, fallback: string) {
  if (!timestamp) return fallback;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatAddress(addressLine?: string, postalCode?: string, city?: string) {
  return [addressLine, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

function EventHeroFallback() {
  const theme = useTheme();

  return (
    <View className="absolute inset-0 items-center justify-center bg-zinc-200 dark:bg-zinc-900">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-white/75 dark:bg-white/10">
        <Music2 size={38} color={theme.foreground} />
      </View>
    </View>
  );
}

function inferGenre(title: string, translate: ReturnType<typeof useLanguage>['t']) {
  const normalized = title.toLowerCase();
  if (normalized.includes('techno')) return translate('genres.techno');
  if (normalized.includes('bass')) return translate('genres.bass');
  if (normalized.includes('house')) return translate('genres.house');
  if (normalized.includes('karaoke')) return translate('genres.karaoke');
  if (normalized.includes('quiz')) return translate('genres.quiz');
  return translate('genres.studentClubEvent');
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
      trips: {
        duration: number;
        interchanges: number;
        departureTime: number | null;
        arrivalTime: number | null;
        legs: {
          line: string;
          direction: string;
          mode: string | null;
          duration: number;
          departureStop: string | null;
          arrivalStop: string | null;
          departureTime: number | null;
          arrivalTime: number | null;
          stopCount: number;
        }[];
      }[];
    };

type DvbRouteLeg = Extract<DvbRouteResult, { status: 'ok' }>['trips'][number]['legs'][number];

function isWalkingLeg(leg: DvbRouteLeg) {
  const mode = leg.mode?.toLowerCase() ?? '';
  const line = leg.line.toLowerCase();
  return mode.includes('walk') || mode.includes('foot') || line.includes('fuss') || line.includes('fuß');
}

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
  const { locale, t } = useLanguage();
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
        message: t('eventDetail.dvb.error'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [arrivalAt, destinationAddress, destinationName, latitude, longitude, originQuery, planRoute, t]);

  return (
    <View className="gap-4 rounded-[14px] border border-border bg-card px-4 py-4">
      <View className="flex-row items-center gap-2">
        <Navigation size={18} color={theme.foreground} />
        <Text className="text-base font-semibold">{t('eventDetail.dvb.title')}</Text>
      </View>

      <View className="gap-2">
        <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('eventDetail.dvb.start')}</Text>
        <TextInput
          value={originQuery}
          onChangeText={setOriginQuery}
          placeholder={t('eventDetail.dvb.startPlaceholder')}
          placeholderTextColor={theme.mutedForeground}
          autoCapitalize="words"
          className="rounded-[12px] border border-border bg-secondary px-3 py-3 text-foreground"
        />
      </View>

      <View className="gap-1">
        <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('eventDetail.dvb.destination')}</Text>
        <Text className="text-sm font-semibold">{destinationName || destinationAddress || t('eventDetail.dvb.destinationFallback')}</Text>
      </View>

      <Button
        variant="secondary"
        android_ripple={{ color: theme.secondary }}
        className="rounded-full"
        disabled={!canPlanRoute || isLoading}
        onPress={() => void loadRoute()}>
        <Route size={16} color={theme.foreground} />
        <Text>{isLoading ? t('eventDetail.dvb.loadingRoute') : t('eventDetail.dvb.loadRoute')}</Text>
      </Button>

      {!canPlanRoute ? (
        <Text className="text-muted-foreground text-sm">{t('eventDetail.dvb.missingAddress')}</Text>
      ) : routeResult?.status === 'error' ? (
        <Text className="text-muted-foreground text-sm">{routeResult.message}</Text>
      ) : routeResult?.status === 'ok' ? (
        <View className="gap-3">
          <Text className="text-muted-foreground text-xs">
            {routeResult.origin.name} {'->'} {routeResult.destination.name}
          </Text>
          {routeResult.trips.length === 0 ? (
            <Text className="text-muted-foreground text-sm">{t('eventDetail.dvb.noConnection')}</Text>
          ) : (
            routeResult.trips.map((trip, tripIndex) => (
              <View key={`${trip.departureTime}-${tripIndex}`} className="gap-3 rounded-[12px] bg-secondary px-3 py-3">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-sm font-semibold">
                    {formatShortDateTime(trip.departureTime, locale, t('common.unknownTime'))} - {formatShortDateTime(trip.arrivalTime, locale, t('common.unknownTime'))}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {t('eventDetail.dvb.tripSummary', {
                      duration: trip.duration,
                      interchanges: trip.interchanges,
                      interchangesLabel: trip.interchanges === 1
                        ? t('eventDetail.dvb.changeSingular')
                        : t('eventDetail.dvb.changePlural'),
                    })}
                  </Text>
                </View>
                <View className="gap-2">
                  {trip.legs.map((leg, legIndex) => (
                    <View key={`${leg.line}-${legIndex}`} className="flex-row items-center gap-2">
                      <View className="min-h-10 min-w-[42px] flex-row items-center justify-center rounded-full bg-primary px-2">
                        {isWalkingLeg(leg) ? (
                          <Footprints size={15} color={theme.primaryForeground} strokeWidth={2.5} />
                        ) : (
                          <Text
                            className="text-center text-xs font-bold text-primary-foreground"
                            style={{ lineHeight: 14 }}>
                            {leg.line || leg.mode || t('eventDetail.dvb.walking')}
                          </Text>
                        )}
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold" numberOfLines={1}>
                          {leg.direction || leg.arrivalStop || t('common.connection')}
                        </Text>
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                          {formatShortDateTime(leg.departureTime, locale, t('common.unknownTime'))} {leg.departureStop ?? ''} {'->'}{' '}
                          {formatShortDateTime(leg.arrivalTime, locale, t('common.unknownTime'))} {leg.arrivalStop ?? ''}
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
          {t('eventDetail.dvb.description')}
        </Text>
      )}
    </View>
  );
}

export default function EventDetailScreen() {
  const theme = useTheme();
  const { locale, t } = useLanguage();
  const favorites = useFavorites();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = getParamValue(params.eventId) as Id<'events'> | undefined;
  const detailQuery = usePublicConvexQuery(api.events.getById, eventId ? { eventId } : null);
  const detail = detailQuery.data;
  const event = detail?.event;
  const club = detail?.club;
  const favorited = event ? favorites.isEventFavorited(event._id) : false;
  const [heroImageFailed, setHeroImageFailed] = React.useState(false);
  const remoteHeroUrl = event?.imageUrl ?? null;
  const showRemoteHero = Boolean(remoteHeroUrl && !heroImageFailed);
  const heroImageSource = showRemoteHero && remoteHeroUrl ? { uri: remoteHeroUrl } : EVENT_HERO;

  React.useEffect(() => {
    setHeroImageFailed(false);
  }, [event?._id, event?.imageUrl]);

  const address = event
    ? formatAddress(event.addressLine ?? club?.addressLine, event.postalCode ?? club?.postalCode, event.city ?? club?.city)
    : '';
  const websiteUrl = club?.websiteUrl;

  const shareEvent = () => {
    if (!event) return;
    void Share.share({
      message: t('eventDetail.shareMessage', {
        title: event.title,
        date: formatEventDate(event.startsAt, locale),
        time: formatEventTime(event.startsAt, locale),
        location: club?.name ?? event.locationName ?? t('app.name'),
      }),
      title: event.title,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        <View className="relative h-[300px] overflow-hidden bg-secondary">
          {showRemoteHero ? (
            <View className="absolute inset-0 bg-zinc-200 dark:bg-zinc-900" />
          ) : (
            <EventHeroFallback />
          )}
          <NativeImage
            key={event?._id ?? 'event-loading'}
            source={heroImageSource}
            resizeMode="cover"
            onError={() => setHeroImageFailed(true)}
            style={styles.heroImage}
          />
          <View className="absolute inset-0 bg-black/35" />
          <View className="absolute left-4 right-4 top-3 flex-row items-center justify-between">
            <Pressable
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
              onPress={() => router.back()}>
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View className="flex-row gap-2">
              {event ? (
                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
                  className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                  onPress={() => void favorites.toggle({ entityType: 'event', eventId: event._id })}>
                  <Heart size={19} color="#fff" fill={favorited ? '#f4d63d' : 'transparent'} />
                </Pressable>
              ) : null}
              <Pressable
                android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                onPress={shareEvent}>
                <Share2 size={19} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {detailQuery.isLoading ? (
          <View className="mx-auto w-full max-w-[560px] px-4 py-6">
            <Text className="text-muted-foreground text-sm">{t('eventDetail.loading')}</Text>
          </View>
        ) : detailQuery.error || !event ? (
          <View className="mx-auto w-full max-w-[560px] gap-3 px-4 py-6">
            <Text className="text-xl font-semibold">{t('eventDetail.notFoundTitle')}</Text>
            <Text className="text-muted-foreground text-sm">
              {detailQuery.error
                ? t('errors.convexLoadPrefix', { message: detailQuery.error.message })
                : t('common.eventUnavailable')}
            </Text>
          </View>
        ) : (
          <View className="mx-auto -mt-6 w-full max-w-[560px] gap-4 px-4">
            <View className="gap-3 rounded-[16px] border border-border bg-card px-4 py-4">
              <View className="gap-1">
                <Text className="text-[28px] font-bold leading-9 text-foreground">{event.title}</Text>
                <Text className="text-muted-foreground text-sm">{club?.name ?? event.locationName ?? t('common.dresden')}</Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                  <Music2 size={14} color={theme.foreground} />
                  <Text className="text-xs font-semibold">{inferGenre(event.title, t)}</Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                  <CalendarClock size={14} color={theme.foreground} />
                  <Text className="text-xs font-semibold">{formatEventTime(event.startsAt, locale)}</Text>
                </View>
              </View>
            </View>

            <View className="overflow-hidden rounded-[14px] border border-border bg-card">
              <View className="gap-1 border-b border-border px-4 py-4">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('eventDetail.date')}</Text>
                <Text className="text-sm font-semibold">{formatEventDate(event.startsAt, locale)}</Text>
              </View>
              <View className="gap-1 border-b border-border px-4 py-4">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('eventDetail.address')}</Text>
                <View className="flex-row items-start gap-2">
                  <MapPin size={16} color={theme.mutedForeground} style={{ marginTop: 1 }} />
                  <Text className="flex-1 text-sm">{address || event.locationName || club?.name || t('common.dresden')}</Text>
                </View>
              </View>
              {websiteUrl ? (
                <Pressable
                  android_ripple={{ color: theme.secondary }}
                  className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-4"
                  onPress={() => void Linking.openURL(websiteUrl)}>
                  <View className="gap-1">
                    <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('eventDetail.studentClubWebsite')}</Text>
                    <Text className="text-sm font-semibold">{websiteUrl.replace(/^https?:\/\//, '')}</Text>
                  </View>
                  <Globe2 size={18} color={theme.mutedForeground} />
                </Pressable>
              ) : null}
              {event.sourceUrl ? (
                <Pressable
                  android_ripple={{ color: theme.secondary }}
                  className="flex-row items-center justify-between gap-3 px-4 py-4"
                  onPress={() => void Linking.openURL(event.sourceUrl!)}>
                  <View className="gap-1">
                    <Text className="text-muted-foreground text-xs font-semibold uppercase">{t('common.source')}</Text>
                    <Text className="text-sm font-semibold">{t('eventDetail.originalEventPage')}</Text>
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
              android_ripple={{ color: theme.secondary }}
              className="rounded-full"
              onPress={() => void favorites.toggle({ entityType: 'event', eventId: event._id })}>
              <Heart
                size={16}
                color={favorited ? theme.primaryForeground : theme.foreground}
                fill={favorited ? theme.primaryForeground : 'transparent'}
              />
              <Text>{favorited ? t('eventDetail.eventSaved') : t('eventDetail.saveEvent')}</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
