import { CalendarDays, Clock3, Globe2, MapPinned } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

function formatStartsAt(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function sourceLabel(source?: string) {
  return source ? source.toUpperCase() : 'MANUAL';
}

export default function EventsScreen() {
  const theme = useTheme();
  const upcomingEvents = useQuery(api.events.listUpcoming, { limit: 20 });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[860px] gap-6 px-4 pb-28 pt-4">
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="max-w-[560px] gap-3">
              <Badge variant="default">
                <Text>Live Calendar</Text>
              </Badge>
              <Text variant="h1" className="text-left">
                Upcoming events across Dresden student clubs
              </Text>
              <Text variant="muted">
                Imported from the VDSC feed and streamed through Convex into the app.
              </Text>
            </View>
            <ThemeModeToggle />
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
                  Events loaded
                </Text>
                <Text className="text-4xl font-semibold">{upcomingEvents?.length ?? '...'}</Text>
              </CardHeader>
            </Card>
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
                  Data source
                </Text>
                <Text variant="large">VDSC JSON feed</Text>
              </CardHeader>
            </Card>
          </View>
        </View>

        {upcomingEvents === undefined ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="h4">Loading events</Text>
              <Text variant="muted">Waiting for the Convex query to resolve.</Text>
            </CardContent>
          </Card>
        ) : upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="h4">No imported events yet</Text>
              <Text variant="muted">
                Run the import action and this list will populate automatically.
              </Text>
            </CardContent>
          </Card>
        ) : (
          upcomingEvents.map((event) => (
            <Card key={event._id}>
              <CardHeader className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-3">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Badge variant="default">
                        <Text>{sourceLabel(event.source)}</Text>
                      </Badge>
                      <Badge variant="outline">
                        <Text>{event.locationName ?? 'Venue pending'}</Text>
                      </Badge>
                    </View>
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                  </View>
                  <View className="rounded-lg border border-border bg-secondary px-3 py-2">
                    <Text className="font-mono text-xs font-semibold uppercase tracking-[0.12em]">
                      {formatStartsAt(event.startsAt)}
                    </Text>
                  </View>
                </View>
              </CardHeader>

              <CardContent>
                <View className="flex-row flex-wrap gap-4">
                  <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                    <Clock3 size={16} color={theme.mutedForeground} />
                    <Text variant="muted">{formatStartsAt(event.startsAt)}</Text>
                  </View>
                  <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                    <MapPinned size={16} color={theme.mutedForeground} />
                    <Text variant="muted">{event.locationName ?? 'Unknown venue'}</Text>
                  </View>
                </View>
              </CardContent>

              {event.sourceUrl ? (
                <CardFooter>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      void Linking.openURL(event.sourceUrl!);
                    }}>
                    <Globe2 size={16} color={theme.foreground} />
                    <Text>Open source</Text>
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          ))
        )}

        <View className="pt-2">
          <View className="flex-row items-center gap-2">
            <CalendarDays size={16} color={theme.mutedForeground} />
            <Text variant="muted">Event data refreshes immediately when Convex documents change.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
