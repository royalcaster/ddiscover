import { Heart, Music2 } from 'lucide-react-native';
import React from 'react';
import { Animated, Image as NativeImage, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { openEventDetail } from '@/lib/navigation';

const EVENT_THUMBNAIL = require('../../../assets/images/logo-glow.png');
const HORIZONTAL_GESTURE_THRESHOLD = 14;
const SWIPE_DISTANCE_THRESHOLD = 44;
const SWIPE_VELOCITY_THRESHOLD = 0.35;

type DayLayout = {
  x: number;
  width: number;
};

const styles = StyleSheet.create({
  dayButton: {
    minHeight: 54,
    minWidth: 42,
    zIndex: 1,
  },
  dayHighlight: {
    bottom: 0,
    position: 'absolute',
    top: 0,
  },
  daySelector: {
    minHeight: 54,
    position: 'relative',
  },
  eventThumbnail: {
    height: '100%',
    width: '100%',
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

function formatWeekday(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' })
    .format(new Date(timestamp))
    .slice(0, 2);
}

function formatDayNumber(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit' }).format(new Date(timestamp));
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function inferGenre(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('techno')) return 'Techno';
  if (normalized.includes('bass')) return 'Drum & Bass';
  if (normalized.includes('house')) return 'House';
  if (normalized.includes('karaoke')) return 'Karaoke';
  if (normalized.includes('quiz')) return 'Quiz';
  return 'Studentenclub Event';
}

export default function CalendarScreen() {
  const theme = useTheme();
  const eventsQuery = usePublicConvexQuery(api.events.listUpcoming, { limit: 96 });
  const clubsQuery = usePublicConvexQuery(api.clubs.list, { limit: 72 });
  const events = React.useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const clubs = React.useMemo(() => clubsQuery.data ?? [], [clubsQuery.data]);
  const favorites = useFavorites();
  const [activeDay, setActiveDay] = React.useState<string | null>(null);
  const [dayLayouts, setDayLayouts] = React.useState<Partial<Record<string, DayLayout>>>({});
  const dayHighlightLeft = React.useRef(new Animated.Value(0)).current;
  const dayHighlightOpacity = React.useRef(new Animated.Value(0)).current;
  const dayHighlightWidth = React.useRef(new Animated.Value(0)).current;
  const hasPositionedDayHighlight = React.useRef(false);

  const days = React.useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index);
      return {
        key: toDayKey(date.getTime()),
        timestamp: date.getTime(),
        isToday: index === 0,
      };
    });
  }, []);

  React.useEffect(() => {
    if (!activeDay && days.length > 0) {
      setActiveDay(days[0].key);
    }
  }, [activeDay, days]);

  const activeDayLayout = activeDay ? dayLayouts[activeDay] : null;

  React.useEffect(() => {
    if (!activeDayLayout) {
      return;
    }

    const duration = hasPositionedDayHighlight.current ? 220 : 0;

    Animated.parallel([
      Animated.timing(dayHighlightLeft, {
        toValue: activeDayLayout.x,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(dayHighlightWidth, {
        toValue: activeDayLayout.width,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(dayHighlightOpacity, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
    ]).start();

    hasPositionedDayHighlight.current = true;
  }, [activeDayLayout, dayHighlightLeft, dayHighlightOpacity, dayHighlightWidth]);

  const filteredEvents = React.useMemo(() => {
    if (!activeDay) return events;
    return events.filter((event) => toDayKey(event.startsAt) === activeDay);
  }, [activeDay, events]);

  const selectDayByOffset = React.useCallback(
    (offset: number) => {
      const currentIndex = activeDay ? days.findIndex((day) => day.key === activeDay) : 0;
      const boundedCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = Math.max(0, Math.min(days.length - 1, boundedCurrentIndex + offset));
      const nextDay = days[nextIndex];

      if (nextDay && nextDay.key !== activeDay) {
        setActiveDay(nextDay.key);
      }
    },
    [activeDay, days],
  );

  const daySwipeResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const horizontalMovement = Math.abs(gestureState.dx);
          const verticalMovement = Math.abs(gestureState.dy);

          return (
            horizontalMovement > HORIZONTAL_GESTURE_THRESHOLD &&
            horizontalMovement > verticalMovement * 1.25
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldSwipe =
            Math.abs(gestureState.dx) > SWIPE_DISTANCE_THRESHOLD ||
            Math.abs(gestureState.vx) > SWIPE_VELOCITY_THRESHOLD;

          if (!shouldSwipe) {
            return;
          }

          selectDayByOffset(gestureState.dx < 0 ? 1 : -1);
        },
      }),
    [selectDayByOffset],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        {...daySwipeResponder.panHandlers}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[560px] gap-4 px-4 pb-28 pt-2">
        <Text className="pt-2 text-[28px] font-bold leading-9 text-foreground">Kalender</Text>

        <View className="flex-row justify-between gap-1" style={styles.daySelector}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dayHighlight,
              {
                backgroundColor: theme.primary,
                borderRadius: 12,
                left: dayHighlightLeft,
                opacity: dayHighlightOpacity,
                width: dayHighlightWidth,
              },
            ]}
          />
          {days.map((day) => {
            const selected = activeDay === day.key;
            return (
              <Pressable
                key={day.key}
                android_ripple={{ color: theme.secondary }}
                className="items-center justify-center rounded-[12px] px-2"
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  setDayLayouts((previousLayouts) => {
                    const currentLayout = previousLayouts[day.key];

                    if (currentLayout?.x === x && currentLayout.width === width) {
                      return previousLayouts;
                    }

                    return {
                      ...previousLayouts,
                      [day.key]: { x, width },
                    };
                  });
                }}
                onPress={() => setActiveDay(day.key)}>
                <View style={styles.dayButton} className="items-center justify-center">
                  <Text
                    className={
                      selected
                        ? 'text-[11px] font-semibold text-primary-foreground'
                        : 'text-[11px] font-semibold text-foreground'
                    }>
                    {day.isToday ? 'Heute' : formatWeekday(day.timestamp)}
                  </Text>
                  <Text
                    className={
                      selected
                        ? 'text-[13px] font-bold text-primary-foreground'
                        : 'text-[13px] font-bold text-foreground'
                    }>
                    {formatDayNumber(day.timestamp)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="overflow-hidden rounded-[14px] border border-border bg-card">
          {eventsQuery.isLoading || clubsQuery.isLoading ? (
            <View className="px-4 py-6">
              <Text className="text-muted-foreground text-sm">Events werden geladen...</Text>
            </View>
          ) : eventsQuery.error || clubsQuery.error ? (
            <View className="px-4 py-6">
              <Text className="text-destructive text-sm">
                Convex konnte nicht geladen werden: {eventsQuery.error?.message ?? clubsQuery.error?.message}
              </Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View className="px-4 py-6">
              <Text className="text-muted-foreground text-sm">Keine Events für diesen Tag.</Text>
            </View>
          ) : (
            filteredEvents.map((event, index) => {
              const club = clubs.find((entry) => entry._id === event.clubId);
              const favorited = favorites.isEventFavorited(event._id);
              const isLast = index === filteredEvents.length - 1;
              const imageSource = event.imageUrl ? { uri: event.imageUrl } : EVENT_THUMBNAIL;

              return (
                <Pressable
                  key={event._id}
                  android_ripple={{ color: theme.secondary }}
                  className={isLast ? 'flex-row gap-3 px-3 py-3' : 'flex-row gap-3 border-b border-border px-3 py-3'}
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
                    <Text className="text-muted-foreground text-xs font-semibold">{formatTime(event.startsAt)}</Text>
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                      {club?.name ?? event.locationName ?? 'Studentenclub'}
                    </Text>
                    <Text className="text-muted-foreground/70 text-xs" numberOfLines={1}>
                      {inferGenre(event.title)}
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
    </SafeAreaView>
  );
}
