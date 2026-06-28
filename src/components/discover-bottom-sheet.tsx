import type { Id } from '../../convex/_generated/dataModel';
import { Building2, CalendarClock, ExternalLink, GripHorizontal, Heart, MapPin, Music2, Share2 } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Image as NativeImage,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useLanguage } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

const COLLAPSED_CLUB_SUMMARY_HEIGHT = 122;
const COLLAPSED_EMPTY_HEIGHT = 112;

type SheetSnapState = 'collapsed' | 'half' | 'expanded';

type DiscoverSheetMetrics = ReturnType<typeof getDiscoverSheetMetrics>;

type DiscoverSheetClub = {
  _id: Id<'clubs'>;
  name: string;
  city?: string;
  addressLine?: string;
  websiteUrl?: string;
};

type DiscoverSheetEvent = {
  _id: Id<'events'>;
  title: string;
  startsAt: number;
  locationName?: string;
  imageUrl?: string | null;
  sourceUrl?: string;
};

type DiscoverBottomSheetProps = {
  selectedClub: DiscoverSheetClub | null;
  events: DiscoverSheetEvent[];
  isLoading?: boolean;
  errorMessage?: string | null;
  bottomInset: number;
  metrics: DiscoverSheetMetrics;
  translateY: Animated.Value;
  isClubFavorited: (clubId: Id<'clubs'>) => boolean;
  isEventFavorited: (eventId: Id<'events'>) => boolean;
  onToggleClubFavorite: (clubId: Id<'clubs'>) => void;
  onToggleEventFavorite: (eventId: Id<'events'>) => void;
  onOpenEvent: (eventId: Id<'events'>) => void;
  onOpenSource: (url?: string) => void;
  onSeeAllEvents: () => void;
};

function formatDateTime(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Calculates stable bottom-sheet dimensions and snap points for the Discover
 * map. Sharing these metrics with the map lets floating controls follow the
 * drawer without duplicating layout math.
 */
export function getDiscoverSheetMetrics(screenHeight: number, hasSelectedClub: boolean) {
  const maxSheetHeight = Math.min(screenHeight * 0.78, 680);
  const collapsedHeight = hasSelectedClub
    ? Math.min(maxSheetHeight - 24, COLLAPSED_CLUB_SUMMARY_HEIGHT)
    : COLLAPSED_EMPTY_HEIGHT;

  return {
    maxSheetHeight,
    collapsedHeight,
    snapPoints: {
      expanded: 0,
      half: Math.max(0, maxSheetHeight * 0.38),
      collapsed: Math.max(0, maxSheetHeight - collapsedHeight),
    },
  };
}

export function DiscoverBottomSheet({
  selectedClub,
  events,
  isLoading = false,
  errorMessage = null,
  bottomInset,
  metrics,
  translateY,
  isClubFavorited,
  isEventFavorited,
  onToggleClubFavorite,
  onToggleEventFavorite,
  onOpenEvent,
  onOpenSource,
  onSeeAllEvents,
}: DiscoverBottomSheetProps) {
  const { colors, resolvedTheme } = useAppTheme();
  const { locale, t } = useLanguage();
  const { maxSheetHeight, snapPoints } = metrics;
  const dragStartY = React.useRef(snapPoints.collapsed);
  const currentTranslateY = React.useRef(snapPoints.collapsed);
  const dragBaselineReady = React.useRef(true);
  const [, setSnapState] = React.useState<SheetSnapState>('collapsed');
  const nextEvent = events[0] ?? null;
  const maxVisibleEventRows = maxSheetHeight >= 620 ? 2 : maxSheetHeight >= 540 ? 1 : 0;
  const additionalEvents = events.slice(1);
  const listedEvents = additionalEvents.slice(0, maxVisibleEventRows);
  const hiddenEventCount = Math.max(0, additionalEvents.length - listedEvents.length);
  const clubFavorited = selectedClub ? isClubFavorited(selectedClub._id) : false;
  const sheetBackgroundColor = resolvedTheme === 'light' ? 'hsl(0 0% 97%)' : colors.card;
  const rippleColor = resolvedTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';

  const shareSelectedClub = React.useCallback(() => {
    if (!selectedClub) return;

    const eventText = nextEvent
      ? t('discover.shareNextEvent', {
          eventTitle: nextEvent.title,
          dateTime: formatDateTime(nextEvent.startsAt, locale),
        })
      : '';
    const locationText = selectedClub.addressLine ?? selectedClub.city ?? t('common.dresden');
    const url = selectedClub.websiteUrl ?? nextEvent?.sourceUrl;

    void Share.share({
      message: [
        t('discover.shareTitle', { clubName: selectedClub.name }),
        locationText,
        eventText,
        url,
      ].filter(Boolean).join('\n'),
      title: selectedClub.name,
      url,
    });
  }, [locale, nextEvent, selectedClub, t]);

  const animateTo = React.useCallback(
    (toValue: number, nextState?: SheetSnapState) => {
      if (nextState) {
        setSnapState(nextState);
      }
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 26,
        stiffness: 230,
        mass: 0.9,
      }).start(({ finished }) => {
        if (finished) {
          currentTranslateY.current = toValue;
          dragStartY.current = toValue;
        }
      });
    },
    [translateY],
  );

  React.useEffect(() => {
    const listenerId = translateY.addListener(({ value }) => {
      currentTranslateY.current = value;
    });

    return () => {
      translateY.removeListener(listenerId);
    };
  }, [translateY]);

  React.useEffect(() => {
    animateTo(snapPoints.collapsed, 'collapsed');
  }, [animateTo, selectedClub?._id, snapPoints.collapsed]);

  const nearestSnap = React.useCallback(
    (projectedY: number): SheetSnapState => {
      const entries = Object.entries(snapPoints) as [SheetSnapState, number][];
      return entries.reduce((nearest, entry) =>
        Math.abs(entry[1] - projectedY) < Math.abs(nearest[1] - projectedY) ? entry : nearest,
      )[0];
    },
    [snapPoints],
  );

  const shouldDragSheet = React.useCallback(
    (dy: number, dx: number) => {
      if (Math.abs(dy) <= 5 || Math.abs(dy) <= Math.abs(dx)) {
        return false;
      }

      if (currentTranslateY.current > snapPoints.expanded + 2) {
        return true;
      }

      return dy > 0;
    },
    [snapPoints.expanded],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldDragSheet(gestureState.dy, gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          shouldDragSheet(gestureState.dy, gestureState.dx),
        onPanResponderGrant: () => {
          dragBaselineReady.current = false;
          dragStartY.current = currentTranslateY.current;
          translateY.stopAnimation((value) => {
            dragStartY.current = value;
            currentTranslateY.current = value;
            dragBaselineReady.current = true;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          if (!dragBaselineReady.current) {
            return;
          }

          const nextTranslateY = Math.min(
            snapPoints.collapsed,
            Math.max(0, dragStartY.current + gestureState.dy),
          );
          currentTranslateY.current = nextTranslateY;
          translateY.setValue(nextTranslateY);
        },
        onPanResponderRelease: (_, gestureState) => {
          dragBaselineReady.current = true;
          const projectedY = currentTranslateY.current + gestureState.vy * 120;
          const nextState = nearestSnap(projectedY);
          animateTo(snapPoints[nextState], nextState);
        },
        onPanResponderTerminate: () => {
          dragBaselineReady.current = true;
          const nextState = nearestSnap(currentTranslateY.current);
          animateTo(snapPoints[nextState], nextState);
        },
      }),
    [animateTo, nearestSnap, shouldDragSheet, snapPoints, translateY],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[28px] border border-border bg-card"
      style={[
        styles.sheet,
        {
          maxHeight: maxSheetHeight,
          minHeight: maxSheetHeight,
          transform: [{ translateY }],
          backgroundColor: sheetBackgroundColor,
          borderColor: colors.border,
        },
      ]}>
      <View className="items-center px-5 pb-2 pt-2">
        <View className="h-1.5 w-12 rounded-full bg-muted" />
      </View>

      {selectedClub ? (
        <View className="gap-4 px-4" style={{ paddingBottom: bottomInset + 22 }}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                    <Building2 size={12} color={colors.foreground} />
                    <Text>{t('common.studentClub')}</Text>
                  </Badge>
                  <Text className="text-muted-foreground text-xs font-medium">
                    {events.length} {events.length === 1 ? t('common.event') : t('common.events')}
                  </Text>
                </View>
                <Text className="text-2xl font-bold leading-8 text-foreground" numberOfLines={1}>
                  {selectedClub.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                    {selectedClub.addressLine ?? selectedClub.city ?? t('common.dresden')}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('discover.shareClub')}
                  android_ripple={{ color: rippleColor, borderless: true }}
                  className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                  onPress={shareSelectedClub}>
                  <Share2 size={19} color={colors.foreground} />
                </Pressable>

                {selectedClub.websiteUrl ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('discover.openClubWebsite')}
                    android_ripple={{ color: rippleColor, borderless: true }}
                    className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                    onPress={() => onOpenSource(selectedClub.websiteUrl)}>
                    <ExternalLink size={19} color={colors.foreground} />
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    clubFavorited
                      ? t('discover.removeClubFavorite')
                      : t('discover.saveClub')
                  }
                  android_ripple={{ color: rippleColor, borderless: true }}
                  className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                  onPress={() => onToggleClubFavorite(selectedClub._id)}>
                  <Heart
                    size={20}
                    color={colors.foreground}
                    fill={clubFavorited ? colors.foreground : 'transparent'}
                  />
                </Pressable>
              </View>
            </View>

            <View className="gap-3 rounded-[18px] border border-border bg-background px-3 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Badge className="rounded-full px-2.5 py-1">
                    <Text>{t('common.event')}</Text>
                  </Badge>
                  <Text className="text-sm font-semibold text-foreground">{t('discover.nextEvent')}</Text>
                </View>
                <GripHorizontal size={16} color={colors.mutedForeground} />
              </View>

              {nextEvent ? (
                <Pressable
                  android_ripple={{ color: rippleColor }}
                  className="gap-2"
                  onPress={() => onOpenEvent(nextEvent._id)}>
                  <Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
                    {nextEvent.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <CalendarClock size={14} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-sm">
                      {formatDateTime(nextEvent.startsAt, locale)}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Text className="text-muted-foreground text-sm">
                  {t('discover.noUpcomingEvents')}
                </Text>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {nextEvent ? (
                <>
                  <Button
                    size="sm"
                    variant={isEventFavorited(nextEvent._id) ? 'default' : 'outline'}
                    android_ripple={{ color: rippleColor }}
                    className="rounded-full"
                    onPress={() => onToggleEventFavorite(nextEvent._id)}>
                    <Heart
                      size={14}
                      color={isEventFavorited(nextEvent._id) ? colors.primaryForeground : colors.foreground}
                      fill={isEventFavorited(nextEvent._id) ? colors.primaryForeground : 'transparent'}
                    />
                    <Text>{isEventFavorited(nextEvent._id) ? t('discover.eventSaved') : t('discover.saveEvent')}</Text>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    android_ripple={{ color: rippleColor }}
                    className="rounded-full"
                    onPress={() => onOpenEvent(nextEvent._id)}>
                    <CalendarClock size={14} color={colors.foreground} />
                    <Text>{t('common.details')}</Text>
                  </Button>

                  {nextEvent.sourceUrl ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      android_ripple={{ color: rippleColor }}
                      className="rounded-full"
                      onPress={() => onOpenSource(nextEvent.sourceUrl)}>
                      <ExternalLink size={14} color={colors.foreground} />
                      <Text>{t('common.source')}</Text>
                    </Button>
                  ) : null}
                </>
              ) : null}

            </View>

            <View className="gap-2 pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">{t('discover.moreEvents')}</Text>
                <Text className="text-muted-foreground text-sm">{additionalEvents.length}</Text>
              </View>

              {listedEvents.length > 0 ? (
                listedEvents.map((event) => {
                  const favorited = isEventFavorited(event._id);
                  return (
                    <Pressable
                      key={event._id}
                      android_ripple={{ color: rippleColor }}
                      className="flex-row gap-3 rounded-[16px] border border-border bg-background px-3 py-3"
                      onPress={() => onOpenEvent(event._id)}>
                      <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-secondary">
                        {event.imageUrl ? (
                          <NativeImage
                            source={{ uri: event.imageUrl }}
                            resizeMode="cover"
                            style={styles.eventThumbnail}
                          />
                        ) : (
                          <Music2 size={18} color={colors.foreground} />
                        )}
                      </View>
                      <View className="min-w-0 flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <Badge variant="outline" className="px-2 py-0.5">
                            <Text>{t('common.event')}</Text>
                          </Badge>
                          <Text className="text-muted-foreground text-xs">
                            {formatDateTime(event.startsAt, locale)}
                          </Text>
                        </View>
                        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                          {event.locationName ?? selectedClub.name}
                        </Text>
                      </View>
                      <Pressable
                        android_ripple={{ color: rippleColor, borderless: true }}
                        className="h-10 w-10 items-center justify-center rounded-full"
                        onPress={(pressEvent) => {
                          pressEvent.stopPropagation();
                          onToggleEventFavorite(event._id);
                        }}>
                        <Heart
                          size={18}
                          color={favorited ? colors.foreground : colors.mutedForeground}
                          fill={favorited ? colors.foreground : 'transparent'}
                        />
                      </Pressable>
                    </Pressable>
                  );
                })
              ) : (
                hiddenEventCount === 0 ? (
                  <View className="rounded-[16px] border border-border bg-background px-3 py-5">
                    <Text className="text-muted-foreground text-sm">
                      {t('discover.noMoreEvents')}
                    </Text>
                  </View>
                ) : null
              )}

              {hiddenEventCount > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  android_ripple={{ color: rippleColor }}
                  className="rounded-full"
                  onPress={onSeeAllEvents}>
                  <CalendarClock size={14} color="#ffffff" />
                  <Text>{t('discover.seeAllEvents', { count: hiddenEventCount })}</Text>
                </Button>
              ) : null}
            </View>
          </View>
      ) : (
        <View className="gap-2 px-5 pb-8">
          <Text className="text-lg font-semibold text-foreground">
            {isLoading ? t('discover.clubsLoading') : t('discover.noClubs')}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {errorMessage
              ? t('errors.convexLoadPrefix', { message: errorMessage })
              : t('discover.currentCategoryNote')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  eventThumbnail: {
    height: '100%',
    width: '100%',
  },
});
