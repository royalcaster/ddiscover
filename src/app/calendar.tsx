import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { Heart, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { ScreenShell } from '@/components/screen-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { calendarDays, previewClubs } from '@/lib/discovery';

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
  const events = useQuery(api.events.listUpcoming, { limit: 8 }) ?? [];

  const eventCards = events.map((event, index) => ({
    event,
    imageUrl: previewClubs[index % previewClubs.length]?.imageUrl,
  }));

  return (
    <ScreenShell
      title="Kalender"
      headerRight={
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full">
          <SlidersHorizontal size={16} color={theme.foreground} />
        </Button>
      }>
      <View className="gap-4">
        <View className="flex-row items-center justify-between gap-2">
          {calendarDays.map((item, index) => {
            const isActive = index === 5;
            return (
              <View
                key={`${item.shortLabel}-${item.day}`}
                className={
                  isActive
                    ? 'items-center rounded-[16px] bg-primary px-2.5 py-2'
                    : 'items-center rounded-[16px] px-2.5 py-2'
                }>
                <Text
                  className={
                    isActive
                      ? 'text-[11px] font-medium text-primary-foreground'
                      : 'text-muted-foreground text-[11px] font-medium'
                  }>
                  {item.shortLabel}
                </Text>
                <Text
                  className={
                    isActive
                      ? 'text-[13px] font-semibold text-primary-foreground'
                      : 'text-[13px] font-semibold'
                  }>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Button variant="outline" size="sm" className="rounded-full px-4">
            <Text>Alle Clubs</Text>
          </Button>
          <Text className="text-muted-foreground text-[13px]">
            {events[0] ? `${dayLabel(events[0].startsAt)} · ${events.length} Events` : 'Keine Events'}
          </Text>
        </View>

        <View className="gap-3">
          {eventCards.map(({ event, imageUrl }, index) => (
            <Card key={event._id} className="gap-0 rounded-[22px] py-0">
              <CardContent className="flex-row gap-3 px-3 py-3">
                <Image source={imageUrl} contentFit="cover" className="h-24 w-24 rounded-[16px]" />

                <View className="flex-1 justify-between">
                  <View className="gap-1">
                    <Text className="text-muted-foreground text-[12px]">{timeLabel(event.startsAt)}</Text>
                    <CardTitle className="text-[18px]">{event.title}</CardTitle>
                    <CardDescription className="text-[13px]">
                      {event.locationName ?? 'Club folgt'}
                    </CardDescription>
                    <Text className="text-muted-foreground text-[12px]">
                      {event.source?.toUpperCase() ?? 'VDSC'} •{' '}
                      {new Date(event.startsAt).toLocaleDateString('de-DE')}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between gap-2 pt-1">
                    <Text className="text-[12px] font-medium">
                      {previewClubs[index % previewClubs.length]?.tonight ?? 'Heute im Club'}
                    </Text>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Heart size={16} color={theme.mutedForeground} />
                    </Button>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}
