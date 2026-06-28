import { Heart, Music2 } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Image as NativeImage,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { openEventDetail } from '@/lib/navigation';
import { useLanguage } from '@/providers/language-provider';

const EVENT_THUMBNAIL = require('../../../assets/images/logo-glow.png');
const CALENDAR_DAY_COUNT = 7;
const MAX_CONTENT_WIDTH = 560;
const SCREEN_HORIZONTAL_PADDING = 32;
const HORIZONTAL_DRAG_THRESHOLD = 10;
const PAGE_SWIPE_DISTANCE = 56;
const PAGE_SWIPE_VELOCITY = 0.35;

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    height: 54,
    zIndex: 1,
  },
  dayHighlight: {
    bottom: 0,
    position: 'absolute',
    borderRadius: 12,
    left: 0,
    top: 0,
  },
  daySelector: {
    height: 54,
    overflow: 'hidden',
    position: 'relative',
  },
  eventThumbnail: {
    height: '100%',
    width: '100%',
  },
  pageContent: {
    alignItems: 'center',
    paddingBottom: 112,
    paddingTop: 16,
  },
  pagerTrack: {
    flexDirection: 'row',
  },
  pagerViewport: {
    flex: 1,
    overflow: 'hidden',
  },
});

function toDayKey(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, dayOffset: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + dayOffset);
  return nextDate;
}

function formatWeekday(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' })
    .format(new Date(timestamp))
    .slice(0, 2);
}

function formatDayNumber(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(new Date(timestamp));
}

function formatTime(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
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

export default function CalendarScreen() {
  const theme = useTheme();
  const { locale, t } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const eventsQuery = usePublicConvexQuery(api.events.listUpcoming, { limit: 96 });
  const clubsQuery = usePublicConvexQuery(api.clubs.list, { limit: 72 });
  const events = React.useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const clubs = React.useMemo(() => clubsQuery.data ?? [], [clubsQuery.data]);
  const favorites = useFavorites();
  const [activeDayIndex, setActiveDayIndex] = React.useState(0);
  const [daySelectorWidth, setDaySelectorWidth] = React.useState(0);
  const previousWindowWidth = React.useRef(windowWidth);
  const activeDayIndexRef = React.useRef(0);
  const dragStartTranslateX = React.useRef(0);
  const pageTranslateX = React.useRef(new Animated.Value(0)).current;

  const days = React.useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: CALENDAR_DAY_COUNT }, (_, index) => {
      const date = addDays(today, index);
      return {
        key: toDayKey(date.getTime()),
        timestamp: date.getTime(),
        isToday: index === 0,
      };
    });
  }, []);

  const contentWidth = Math.max(0, Math.min(windowWidth - SCREEN_HORIZONTAL_PADDING, MAX_CONTENT_WIDTH));
  const dayCellWidth = daySelectorWidth / CALENDAR_DAY_COUNT;
  const dayHighlightTranslateX = React.useMemo(
    () =>
      pageTranslateX.interpolate({
        inputRange: days.map((_, index) => -index * windowWidth),
        outputRange: days.map((_, index) => index * dayCellWidth),
        extrapolate: 'clamp',
      }),
    [dayCellWidth, days, pageTranslateX, windowWidth],
  );

  const clubsById = React.useMemo(() => new Map(clubs.map((club) => [club._id, club])), [clubs]);
  const eventsByDay = React.useMemo(() => {
    const groupedEvents = new Map<string, typeof events>();

    for (const day of days) {
      groupedEvents.set(day.key, []);
    }

    for (const event of events) {
      const eventDay = groupedEvents.get(toDayKey(event.startsAt));

      if (eventDay) {
        eventDay.push(event);
      }
    }

    return groupedEvents;
  }, [days, events]);

  React.useEffect(() => {
    activeDayIndexRef.current = activeDayIndex;
  }, [activeDayIndex]);

  const animateToDay = React.useCallback(
    (index: number) => {
      const boundedIndex = Math.max(0, Math.min(days.length - 1, index));
      activeDayIndexRef.current = boundedIndex;
      setActiveDayIndex(boundedIndex);

      Animated.spring(pageTranslateX, {
        toValue: -boundedIndex * windowWidth,
        useNativeDriver: true,
        damping: 26,
        stiffness: 260,
        mass: 0.85,
      }).start();
    },
    [days.length, pageTranslateX, windowWidth],
  );

  React.useEffect(() => {
    if (previousWindowWidth.current === windowWidth) {
      return;
    }

    pageTranslateX.setValue(-activeDayIndexRef.current * windowWidth);
    previousWindowWidth.current = windowWidth;
  }, [pageTranslateX, windowWidth]);

  const selectDay = React.useCallback(
    (index: number) => {
      animateToDay(index);
    },
    [animateToDay],
  );

  const pagePanResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const horizontalMovement = Math.abs(gestureState.dx);
          const verticalMovement = Math.abs(gestureState.dy);

          return (
            horizontalMovement > HORIZONTAL_DRAG_THRESHOLD &&
            horizontalMovement > verticalMovement * 1.25
          );
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const horizontalMovement = Math.abs(gestureState.dx);
          const verticalMovement = Math.abs(gestureState.dy);

          return (
            horizontalMovement > HORIZONTAL_DRAG_THRESHOLD &&
            horizontalMovement > verticalMovement * 1.25
          );
        },
        onPanResponderGrant: () => {
          pageTranslateX.stopAnimation((value) => {
            dragStartTranslateX.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const minTranslateX = -(days.length - 1) * windowWidth;
          const maxTranslateX = 0;
          const rawTranslateX = dragStartTranslateX.current + gestureState.dx;
          const boundedTranslateX =
            rawTranslateX > maxTranslateX
              ? maxTranslateX + (rawTranslateX - maxTranslateX) * 0.28
              : rawTranslateX < minTranslateX
                ? minTranslateX + (rawTranslateX - minTranslateX) * 0.28
                : rawTranslateX;

          pageTranslateX.setValue(boundedTranslateX);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentIndex = activeDayIndexRef.current;
          const shouldMoveForward =
            gestureState.dx < -PAGE_SWIPE_DISTANCE || gestureState.vx < -PAGE_SWIPE_VELOCITY;
          const shouldMoveBackward =
            gestureState.dx > PAGE_SWIPE_DISTANCE || gestureState.vx > PAGE_SWIPE_VELOCITY;

          if (shouldMoveForward) {
            animateToDay(currentIndex + 1);
            return;
          }

          if (shouldMoveBackward) {
            animateToDay(currentIndex - 1);
            return;
          }

          animateToDay(currentIndex);
        },
        onPanResponderTerminate: () => {
          animateToDay(activeDayIndexRef.current);
        },
      }),
    [animateToDay, days.length, pageTranslateX, windowWidth],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-auto w-full max-w-[560px] gap-4 px-4 pt-2">
        <Text className="pt-2 text-[28px] font-bold leading-9 text-foreground">{t('calendar.title')}</Text>

        <View
          className="flex-row"
          onLayout={(event) => setDaySelectorWidth(event.nativeEvent.layout.width)}
          style={styles.daySelector}>
          {dayCellWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.dayHighlight,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateX: dayHighlightTranslateX }],
                  width: dayCellWidth,
                },
              ]}
            />
          ) : null}
          {days.map((day, index) => {
            const selected = activeDayIndex === index;
            return (
              <Pressable
                key={day.key}
                android_ripple={{ color: theme.secondary }}
                className="items-center justify-center rounded-[12px] px-1"
                onPress={() => selectDay(index)}
                style={styles.dayCell}>
                <Text
                  className={
                    selected
                      ? 'text-[11px] font-semibold text-primary-foreground'
                      : 'text-[11px] font-semibold text-foreground'
                  }>
                  {day.isToday ? t('common.today') : formatWeekday(day.timestamp, locale)}
                </Text>
                <Text
                  className={
                    selected
                      ? 'text-[13px] font-bold text-primary-foreground'
                      : 'text-[13px] font-bold text-foreground'
                  }>
                  {formatDayNumber(day.timestamp, locale)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="flex-1" style={styles.pagerViewport} {...pagePanResponder.panHandlers}>
        <Animated.View
          style={[
            styles.pagerTrack,
            {
              transform: [{ translateX: pageTranslateX }],
              width: windowWidth * days.length,
            },
          ]}>
          {days.map((day) => {
            const dayEvents = eventsByDay.get(day.key) ?? [];

            return (
              <ScrollView
                key={day.key}
                contentContainerStyle={styles.pageContent}
                directionalLockEnabled
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{ width: windowWidth }}>
                <View
                  className="overflow-hidden rounded-[14px] border border-border bg-card"
                  style={{ width: contentWidth }}>
                  {eventsQuery.isLoading || clubsQuery.isLoading ? (
                    <View className="px-4 py-6">
                      <Text className="text-muted-foreground text-sm">{t('calendar.eventsLoading')}</Text>
                    </View>
                  ) : eventsQuery.error || clubsQuery.error ? (
                    <View className="px-4 py-6">
                      <Text className="text-destructive text-sm">
                        {t('errors.convexLoadPrefix', { message: eventsQuery.error?.message ?? clubsQuery.error?.message ?? '' })}
                      </Text>
                    </View>
                  ) : dayEvents.length === 0 ? (
                    <View className="px-4 py-6">
                      <Text className="text-muted-foreground text-sm">{t('calendar.noEventsForDay')}</Text>
                    </View>
                  ) : (
                    dayEvents.map((event, index) => {
                      const club = clubsById.get(event.clubId);
                      const favorited = favorites.isEventFavorited(event._id);
                      const isLast = index === dayEvents.length - 1;
                      const imageSource = event.imageUrl ? { uri: event.imageUrl } : EVENT_THUMBNAIL;

                      return (
                        <Pressable
                          key={event._id}
                          android_ripple={{ color: theme.secondary }}
                          className={
                            isLast
                              ? 'flex-row gap-3 px-3 py-3'
                              : 'flex-row gap-3 border-b border-border px-3 py-3'
                          }
                          onPress={() => openEventDetail(event._id)}>
                          <View className="h-[76px] w-[76px] overflow-hidden rounded-[10px] bg-secondary">
                            <NativeImage source={imageSource} resizeMode="cover" style={styles.eventThumbnail} />
                            {event.imageUrl ? (
                              <View className="absolute inset-0 bg-black/10 dark:bg-black/20" />
                            ) : (
                              <View className="absolute inset-0 items-center justify-center bg-black/20 dark:bg-black/35">
                                <Music2 size={20} color="#ffffff" />
                              </View>
                            )}
                          </View>

                          <View className="min-w-0 flex-1 gap-1">
                            <Text className="text-muted-foreground text-xs font-semibold">{formatTime(event.startsAt, locale)}</Text>
                            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                              {event.title}
                            </Text>
                            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                              {club?.name ?? event.locationName ?? t('calendar.fallbackClub')}
                            </Text>
                            <Text className="text-muted-foreground/70 text-xs" numberOfLines={1}>
                              {inferGenre(event.title, t)}
                            </Text>
                          </View>

                          <Pressable
                            android_ripple={{ color: theme.secondary, borderless: true }}
                            className="h-10 w-10 items-center justify-center rounded-full"
                            onPress={(pressEvent) => {
                              pressEvent.stopPropagation();
                              void favorites.toggle({ entityType: 'event', eventId: event._id });
                            }}>
                            <Heart
                              size={19}
                              color={favorited ? theme.foreground : theme.mutedForeground}
                              fill={favorited ? theme.foreground : 'transparent'}
                            />
                          </Pressable>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            );
          })}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
