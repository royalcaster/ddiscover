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
import type { Id } from '../../../convex/_generated/dataModel';
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

type CalendarClub = {
  _id: Id<'clubs'>;
  name: string;
};

type CalendarEvent = {
  _id: Id<'events'>;
  clubId: Id<'clubs'>;
  imageUrl?: string | null;
  locationName?: string;
  startsAt: number;
  title: string;
};

type TranslationFunction = ReturnType<typeof useLanguage>['t'];

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    height: 54,
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
  dayTextRow: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    top: 0,
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

type CalendarEventRowProps = {
  club?: CalendarClub;
  event: CalendarEvent;
  favoriteFillColor: string;
  favoriteStrokeColor: string;
  favorited: boolean;
  isLast: boolean;
  locale: string;
  mutedIconColor: string;
  rippleColor: string;
  t: TranslationFunction;
  onToggleFavorite: (eventId: Id<'events'>) => void;
};

const CalendarEventRow = React.memo(function CalendarEventRow({
  club,
  event,
  favoriteFillColor,
  favoriteStrokeColor,
  favorited,
  isLast,
  locale,
  mutedIconColor,
  rippleColor,
  t,
  onToggleFavorite,
}: CalendarEventRowProps) {
  const imageSource = event.imageUrl ? { uri: event.imageUrl } : EVENT_THUMBNAIL;

  return (
    <Pressable
      android_ripple={{ color: rippleColor }}
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
        android_ripple={{ color: rippleColor, borderless: true }}
        className="h-10 w-10 items-center justify-center rounded-full"
        onPress={(pressEvent) => {
          pressEvent.stopPropagation();
          onToggleFavorite(event._id);
        }}>
        <Heart
          size={19}
          color={favorited ? favoriteStrokeColor : mutedIconColor}
          fill={favorited ? favoriteFillColor : 'transparent'}
        />
      </Pressable>
    </Pressable>
  );
});

type CalendarDayPageProps = {
  clubsById: Map<Id<'clubs'>, CalendarClub>;
  contentWidth: number;
  dayEvents: CalendarEvent[];
  errorMessage?: string;
  favoriteFillColor: string;
  favoriteStrokeColor: string;
  isEventFavorited: (eventId: Id<'events'>) => boolean;
  isLoading: boolean;
  locale: string;
  mutedIconColor: string;
  pageWidth: number;
  rippleColor: string;
  t: TranslationFunction;
  onToggleFavorite: (eventId: Id<'events'>) => void;
};

const CalendarDayPage = React.memo(function CalendarDayPage({
  clubsById,
  contentWidth,
  dayEvents,
  errorMessage,
  favoriteFillColor,
  favoriteStrokeColor,
  isEventFavorited,
  isLoading,
  locale,
  mutedIconColor,
  pageWidth,
  rippleColor,
  t,
  onToggleFavorite,
}: CalendarDayPageProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.pageContent}
      directionalLockEnabled
      nestedScrollEnabled
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      style={{ width: pageWidth }}>
      <View
        className="overflow-hidden rounded-[14px] border border-border bg-card"
        style={{ width: contentWidth }}>
        {isLoading ? (
          <View className="px-4 py-6">
            <Text className="text-muted-foreground text-sm">{t('calendar.eventsLoading')}</Text>
          </View>
        ) : errorMessage ? (
          <View className="px-4 py-6">
            <Text className="text-destructive text-sm">
              {t('errors.convexLoadPrefix', { message: errorMessage })}
            </Text>
          </View>
        ) : dayEvents.length === 0 ? (
          <View className="px-4 py-6">
            <Text className="text-muted-foreground text-sm">{t('calendar.noEventsForDay')}</Text>
          </View>
        ) : (
          dayEvents.map((event, index) => (
            <CalendarEventRow
              key={event._id}
              club={clubsById.get(event.clubId)}
              event={event}
              favoriteFillColor={favoriteFillColor}
              favoriteStrokeColor={favoriteStrokeColor}
              favorited={isEventFavorited(event._id)}
              isLast={index === dayEvents.length - 1}
              locale={locale}
              mutedIconColor={mutedIconColor}
              rippleColor={rippleColor}
              t={t}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
});

export default function CalendarScreen() {
  const theme = useTheme();
  const { locale, t } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const eventsQuery = usePublicConvexQuery(api.events.listUpcoming, { limit: 96 });
  const clubsQuery = usePublicConvexQuery(api.clubs.list, { limit: 72 });
  const events = React.useMemo<CalendarEvent[]>(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const clubs = React.useMemo<CalendarClub[]>(() => clubsQuery.data ?? [], [clubsQuery.data]);
  const favorites = useFavorites();
  const { isEventFavorited, toggle: toggleFavorite } = favorites;
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
  const pageWidth = contentWidth;
  const dayCellWidth = daySelectorWidth / CALENDAR_DAY_COUNT;
  const lastPageTranslateX = -(days.length - 1) * pageWidth;
  const dayHighlightTranslateX = React.useMemo(
    () =>
      pageTranslateX.interpolate({
        inputRange: [lastPageTranslateX, 0],
        outputRange: [(days.length - 1) * dayCellWidth, 0],
        extrapolate: 'clamp',
      }),
    [dayCellWidth, days.length, lastPageTranslateX, pageTranslateX],
  );
  const dayHighlightTextTranslateX = React.useMemo(
    () =>
      pageTranslateX.interpolate({
        inputRange: [lastPageTranslateX, 0],
        outputRange: [-(days.length - 1) * dayCellWidth, 0],
        extrapolate: 'clamp',
      }),
    [dayCellWidth, days.length, lastPageTranslateX, pageTranslateX],
  );

  const clubsById = React.useMemo(() => new Map(clubs.map((club) => [club._id, club])), [clubs]);
  const eventsByDay = React.useMemo(() => {
    const groupedEvents = new Map<string, CalendarEvent[]>();

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

  const animateToDay = React.useCallback(
    (index: number) => {
      const boundedIndex = Math.max(0, Math.min(days.length - 1, index));
      activeDayIndexRef.current = boundedIndex;

      Animated.spring(pageTranslateX, {
        toValue: -boundedIndex * pageWidth,
        useNativeDriver: true,
        damping: 26,
        stiffness: 260,
        mass: 0.85,
      }).start();
    },
    [days.length, pageTranslateX, pageWidth],
  );

  React.useEffect(() => {
    if (previousWindowWidth.current === windowWidth) {
      return;
    }

    pageTranslateX.setValue(-activeDayIndexRef.current * pageWidth);
    previousWindowWidth.current = windowWidth;
  }, [pageTranslateX, pageWidth, windowWidth]);

  const selectDay = React.useCallback(
    (index: number) => {
      animateToDay(index);
    },
    [animateToDay],
  );

  const toggleEventFavorite = React.useCallback(
    (eventId: Id<'events'>) => {
      void toggleFavorite({ entityType: 'event', eventId });
    },
    [toggleFavorite],
  );

  const calendarErrorMessage = eventsQuery.error?.message ?? clubsQuery.error?.message;
  const isCalendarLoading = eventsQuery.isLoading || clubsQuery.isLoading;

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
          const minTranslateX = -(days.length - 1) * pageWidth;
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
    [animateToDay, days.length, pageTranslateX, pageWidth],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-auto w-full max-w-[560px] gap-4 px-4 pt-2">
        <Text className="pt-2 text-[28px] font-bold leading-9 text-foreground">{t('calendar.title')}</Text>

        <View
          className="flex-row"
          onLayout={(event) => setDaySelectorWidth(event.nativeEvent.layout.width)}
          style={styles.daySelector}>
          <View pointerEvents="none" style={[styles.dayTextRow, { width: daySelectorWidth }]}>
            {days.map((day) => (
              <View key={day.key} className="items-center justify-center px-1" style={styles.dayCell}>
                <Text className="text-[11px] font-semibold text-foreground">
                  {day.isToday ? t('common.today') : formatWeekday(day.timestamp, locale)}
                </Text>
                <Text className="text-[13px] font-bold text-foreground">
                  {formatDayNumber(day.timestamp, locale)}
                </Text>
              </View>
            ))}
          </View>
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
              ]}>
              <Animated.View
                style={[
                  styles.dayTextRow,
                  {
                    transform: [{ translateX: dayHighlightTextTranslateX }],
                    width: daySelectorWidth,
                  },
                ]}>
                {days.map((day) => (
                  <View key={day.key} className="items-center justify-center px-1" style={styles.dayCell}>
                    <Text className="text-[11px] font-semibold text-primary-foreground">
                      {day.isToday ? t('common.today') : formatWeekday(day.timestamp, locale)}
                    </Text>
                    <Text className="text-[13px] font-bold text-primary-foreground">
                      {formatDayNumber(day.timestamp, locale)}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            </Animated.View>
          ) : null}
          {days.map((day, index) => (
            <Pressable
              key={day.key}
              android_ripple={{ color: theme.secondary }}
              className="items-center justify-center rounded-[12px] px-1"
              onPress={() => selectDay(index)}
              style={styles.dayCell}
            />
          ))}
        </View>
      </View>

      <View
        className="flex-1"
        removeClippedSubviews={false}
        style={[styles.pagerViewport, { alignSelf: 'center', width: pageWidth }]}
        {...pagePanResponder.panHandlers}>
        <Animated.View
          style={[
            styles.pagerTrack,
            {
              transform: [{ translateX: pageTranslateX }],
              width: pageWidth * days.length,
            },
          ]}>
          {days.map((day) => (
            <CalendarDayPage
              key={day.key}
              clubsById={clubsById}
              contentWidth={contentWidth}
              dayEvents={eventsByDay.get(day.key) ?? []}
              errorMessage={calendarErrorMessage}
              favoriteFillColor={theme.foreground}
              favoriteStrokeColor={theme.foreground}
              isEventFavorited={isEventFavorited}
              isLoading={isCalendarLoading}
              locale={locale}
              mutedIconColor={theme.mutedForeground}
              pageWidth={pageWidth}
              rippleColor={theme.secondary}
              t={t}
              onToggleFavorite={toggleEventFavorite}
            />
          ))}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
