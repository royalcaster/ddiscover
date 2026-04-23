import { Heart, SlidersHorizontal } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { ScreenShell } from '@/components/screen-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

function dayLabel(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
  }).format(new Date(timestamp));
}

function timeLabel(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export default function CalendarScreen() {
  const theme = useTheme();
  const events = useQuery(api.events.listUpcoming, { limit: 12 }) ?? [];
  const activeDay = events[0]?.startsAt ?? Date.now();

  const dayBuckets = Array.from(
    new Map(
      events.map((event) => [
        new Date(event.startsAt).toDateString(),
        {
          key: new Date(event.startsAt).toDateString(),
          label: dayLabel(event.startsAt),
          events: events.filter(
            (candidate) =>
              new Date(candidate.startsAt).toDateString() === new Date(event.startsAt).toDateString(),
          ),
        },
      ]),
    ).values(),
  );

  const activeBucket = dayBuckets[0];

  return (
    <ScreenShell
      eyebrow="Kalender"
      title="Heute und die naechsten Slots"
      description="Dense event scheduling with fast club context, matching the screenshot structure more closely than the earlier feed."
      headerRight={
        <Button variant="secondary" size="icon">
          <SlidersHorizontal size={17} color={theme.foreground} />
        </Button>
      }>
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          {dayBuckets.map((bucket, index) => {
            const isActive = index === 0;
            return (
              <View
                key={bucket.key}
                className={isActive ? 'rounded-2xl bg-primary px-3 py-2' : 'rounded-2xl bg-card px-3 py-2'}>
                <Text
                  className={
                    isActive
                      ? 'text-center text-xs font-semibold text-primary-foreground'
                      : 'text-muted-foreground text-center text-xs font-medium'
                  }>
                  {bucket.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Button variant="outline" size="sm">
            <Text>Alle Clubs</Text>
          </Button>
          <Text className="text-muted-foreground text-sm">
            {dayLabel(activeDay)} • {activeBucket?.events.length ?? 0} Events
          </Text>
        </View>

        <View className="gap-3">
          {(activeBucket?.events ?? []).map((event, index) => (
            <Card key={event._id} className="py-4">
              <CardContent className="flex-row items-center gap-4 px-4">
                <View className="h-20 w-20 rounded-2xl bg-secondary" />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-muted-foreground text-xs">{timeLabel(event.startsAt)}</Text>
                    <Badge variant={index === 0 ? 'default' : 'outline'}>
                      <Text>{event.source?.toUpperCase() ?? 'VDSC'}</Text>
                    </Badge>
                  </View>
                  <CardTitle className="text-[18px]">{event.title}</CardTitle>
                  <CardDescription>{event.locationName ?? 'Venue pending'}</CardDescription>
                  <Text className="text-muted-foreground text-sm">
                    {timeLabel(event.startsAt)} • {new Date(event.startsAt).toLocaleDateString('de-DE')}
                  </Text>
                </View>
                <Button variant="ghost" size="icon">
                  <Heart size={18} color={theme.mutedForeground} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}
