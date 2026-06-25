import { Heart, Music2 } from 'lucide-react-native';
import React from 'react';
import { Image as NativeImage, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { openEventDetail } from '@/lib/navigation';

const EVENT_THUMBNAIL = require('../../../assets/images/logo-glow.png');

const styles = StyleSheet.create({
  eventThumbnail: {
    height: '100%',
    width: '100%',
  },
});

function toDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
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

  const filteredEvents = React.useMemo(() => {
    if (!activeDay) return events;
    return events.filter((event) => toDayKey(event.startsAt) === activeDay);
  }, [activeDay, events]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[560px] gap-4 px-4 pb-28 pt-2">
        <Text className="pt-2 text-[28px] font-bold leading-9 text-foreground">Kalender</Text>

        <View className="flex-row justify-between gap-1">
          {days.map((day) => {
            const selected = activeDay === day.key;
            return (
              <Pressable
                key={day.key}
                android_ripple={{ color: theme.secondary }}
                className={
                  selected
                    ? 'min-h-[54px] min-w-[42px] items-center justify-center rounded-[12px] bg-primary px-2'
                    : 'min-h-[54px] min-w-[42px] items-center justify-center rounded-[12px] px-2'
                }
                onPress={() => setActiveDay(day.key)}>
                <Text className={selected ? 'text-[11px] font-semibold text-primary-foreground' : 'text-[11px] font-semibold text-foreground'}>
                  {day.isToday ? 'Heute' : formatWeekday(day.timestamp)}
                </Text>
                <Text className={selected ? 'text-[13px] font-bold text-primary-foreground' : 'text-[13px] font-bold text-foreground'}>
                  {formatDayNumber(day.timestamp)}
                </Text>
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
