import { CalendarDays, Clock3, Globe2, MapPinned } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
              <Badge variant="default" label="Live Calendar" />
              <Text variant="hero">Upcoming events across Dresden student clubs</Text>
              <Text variant="muted">
                Imported from the VDSC feed and streamed through Convex into the app.
              </Text>
            </View>
            <ThemeModeToggle />
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text variant="caption">Events loaded</Text>
                <Text variant="title">{upcomingEvents?.length ?? '...'}</Text>
              </CardHeader>
            </Card>
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text variant="caption">Data source</Text>
                <Text variant="section">VDSC JSON feed</Text>
              </CardHeader>
            </Card>
          </View>
        </View>

        {upcomingEvents === undefined ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="section">Loading events</Text>
              <Text variant="muted">Waiting for the Convex query to resolve.</Text>
            </CardContent>
          </Card>
        ) : upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="section">No imported events yet</Text>
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
                      <Badge variant="default" label={sourceLabel(event.source)} />
                      <Badge variant="outline" label={event.locationName ?? 'Venue pending'} />
                    </View>
                    <Text variant="section">{event.title}</Text>
                  </View>
                  <View className="rounded-lg border border-border bg-secondary px-3 py-2">
                    <Text variant="mono">{formatStartsAt(event.startsAt)}</Text>
                  </View>
                </View>
              </CardHeader>

              <CardContent>
                <View className="flex-row flex-wrap gap-4">
                  <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                    <Clock3 size={16} color={theme.textSecondary} />
                    <Text variant="muted">{formatStartsAt(event.startsAt)}</Text>
                  </View>
                  <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                    <MapPinned size={16} color={theme.textSecondary} />
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
                    }}
                    leadingIcon={<Globe2 size={16} color={theme.text} />}
                    label="Open source"
                  />
                </CardFooter>
              ) : null}
            </Card>
          ))
        )}

        <View className="pt-2">
          <View className="flex-row items-center gap-2">
            <CalendarDays size={16} color={theme.textSecondary} />
            <Text variant="muted">Event data refreshes immediately when Convex documents change.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
