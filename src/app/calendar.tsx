import { useQuery } from 'convex/react';
import { CalendarClock, ExternalLink, Heart } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { ScreenShell } from '@/components/screen-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';

function toDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function formatDayHeader(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(timestamp));
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export default function CalendarScreen() {
  const eventsQuery = useQuery(api.events.listUpcoming, { limit: 64 });
  const clubsQuery = useQuery(api.clubs.list, { limit: 72 });
  const events = React.useMemo(() => eventsQuery ?? [], [eventsQuery]);
  const clubs = React.useMemo(() => clubsQuery ?? [], [clubsQuery]);
  const favorites = useFavorites();
  const [activeDay, setActiveDay] = React.useState<string | null>(null);

  const days = React.useMemo(() => {
    const uniqueDays: { key: string; timestamp: number }[] = [];
    for (const event of events) {
      const key = toDayKey(event.startsAt);
      if (!uniqueDays.some((day) => day.key === key)) {
        uniqueDays.push({ key, timestamp: event.startsAt });
      }
    }
    return uniqueDays.slice(0, 7);
  }, [events]);

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
    <ScreenShell title="Kalender" headerSubtitle="Alle kommenden Events aus dem VDSC Feed.">
      <View className="gap-3">
        <View className="flex-row flex-wrap gap-2">
          {days.map((day) => {
            const selected = activeDay === day.key;
            return (
              <Pressable
                key={day.key}
                className={selected ? 'rounded-[10px] bg-primary px-3 py-2' : 'rounded-[10px] border border-border px-3 py-2'}
                onPress={() => setActiveDay(day.key)}>
                <Text className={selected ? 'text-xs font-semibold text-primary-foreground' : 'text-muted-foreground text-xs'}>
                  {formatDayHeader(day.timestamp)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between">
          <Badge variant="default" className="rounded-full px-3 py-1">
            <Text>{filteredEvents.length} Events</Text>
          </Badge>
          <Text className="text-muted-foreground text-xs">Sortiert nach Startzeit</Text>
        </View>

        <View className="gap-2">
          {filteredEvents.map((event) => {
            const club = clubs.find((entry) => entry._id === event.clubId);
            const favorited = favorites.isEventFavorited(event._id);
            return (
              <Card key={event._id} className="rounded-[12px] py-0">
                <CardContent className="gap-3 px-4 py-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-primary">{formatTime(event.startsAt)}</Text>
                      <Text className="text-base font-semibold">{event.title}</Text>
                      <Text className="text-muted-foreground text-xs">
                        {club?.name ?? event.locationName ?? 'Club'} • {new Date(event.startsAt).toLocaleDateString('de-DE')}
                      </Text>
                    </View>
                    <Button
                      variant={favorited ? 'default' : 'outline'}
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onPress={() =>
                        void favorites.toggle({
                          entityType: 'event',
                          eventId: event._id,
                        })
                      }>
                      <Heart size={14} color={favorited ? '#111' : '#f4d63d'} fill={favorited ? '#111' : 'transparent'} />
                    </Button>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {club ? (
                      <Button
                        variant={favorites.isClubFavorited(club._id) ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onPress={() =>
                          void favorites.toggle({
                            entityType: 'club',
                            clubId: club._id,
                          })
                        }>
                        <CalendarClock size={14} color={favorites.isClubFavorited(club._id) ? '#111' : '#f4d63d'} />
                        <Text>{favorites.isClubFavorited(club._id) ? 'Club gespeichert' : 'Club speichern'}</Text>
                      </Button>
                    ) : null}

                    {event.sourceUrl ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onPress={() => void Linking.openURL(event.sourceUrl!)}>
                        <ExternalLink size={14} />
                        <Text>Quelle</Text>
                      </Button>
                    ) : null}
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>
      </View>
    </ScreenShell>
  );
}
