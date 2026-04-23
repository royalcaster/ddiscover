import { Building2, CalendarClock, Globe2, MapPinHouse, MapPinned } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

function formatStartsAt(timestamp?: number) {
  if (!timestamp) {
    return 'No upcoming event';
  }

  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatAddress(addressLine?: string, postalCode?: string, city?: string) {
  return [addressLine, [postalCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export default function ClubsScreen() {
  const theme = useTheme();
  const clubs = useQuery(api.clubs.list, { limit: 24 });

  const clubsWithUpcomingEvent = clubs?.filter((club) => club.nextEvent !== null).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[860px] gap-6 px-4 pb-28 pt-4">
        <View className="gap-4">
          <View className="max-w-[620px] gap-3">
            <Badge variant="default" label="Clubs" />
            <Text variant="hero">Canonical club profiles with event context</Text>
            <Text variant="muted">
              This is the first normalized discovery layer on top of the VDSC import. Each club card
              is backed by the canonical Convex model rather than raw feed strings.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text variant="caption">Clubs loaded</Text>
                <Text variant="title">{clubs?.length ?? '...'}</Text>
              </CardHeader>
            </Card>
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text variant="caption">With next event</Text>
                <Text variant="title">{clubsWithUpcomingEvent}</Text>
              </CardHeader>
            </Card>
          </View>
        </View>

        {clubs === undefined ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="section">Loading clubs</Text>
              <Text variant="muted">Waiting for Convex to return the normalized club list.</Text>
            </CardContent>
          </Card>
        ) : (
          clubs.map((club) => {
            const address = formatAddress(club.addressLine, club.postalCode, club.city);

            return (
              <Card key={club._id}>
                <CardHeader className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-3">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Badge variant="default" label={club.source?.toUpperCase() ?? 'MANUAL'} />
                        <Badge variant="outline" label={club.slug} />
                      </View>
                      <Text variant="section">{club.name}</Text>
                    </View>

                    <View className="rounded-lg border border-border bg-secondary px-3 py-2">
                      <Text variant="mono">
                        {club.nextEvent ? formatStartsAt(club.nextEvent.startsAt) : 'NO NEXT EVENT'}
                      </Text>
                    </View>
                  </View>
                </CardHeader>

                <CardContent>
                  <View className="gap-3">
                    <View className="flex-row items-start gap-2">
                      <Building2 size={16} color={theme.textSecondary} style={{ marginTop: 2 }} />
                      <Text variant="muted">
                        {club.websiteUrl ? 'Club profile normalized from source metadata.' : 'Canonical club profile with normalized venue metadata.'}
                      </Text>
                    </View>

                    {address ? (
                      <View className="flex-row items-start gap-2">
                        <MapPinHouse size={16} color={theme.textSecondary} style={{ marginTop: 2 }} />
                        <Text variant="muted">{address}</Text>
                      </View>
                    ) : null}

                    {club.nextEvent ? (
                      <View className="gap-2 rounded-lg border border-border bg-secondary p-3">
                        <View className="flex-row items-center gap-2">
                          <CalendarClock size={16} color={theme.textSecondary} />
                          <Text variant="caption">Next event</Text>
                        </View>
                        <Text variant="label">{club.nextEvent.title}</Text>
                        <View className="flex-row flex-wrap gap-4">
                          <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                            <MapPinned size={16} color={theme.textSecondary} />
                            <Text variant="muted">
                              {club.nextEvent.locationName ?? club.name}
                            </Text>
                          </View>
                          <Text variant="muted">{formatStartsAt(club.nextEvent.startsAt)}</Text>
                        </View>
                      </View>
                    ) : (
                      <View className="rounded-lg border border-border bg-secondary p-3">
                        <Text variant="muted">No upcoming event is currently linked to this club.</Text>
                      </View>
                    )}
                  </View>
                </CardContent>

                <CardFooter>
                  {club.websiteUrl ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        void Linking.openURL(club.websiteUrl!);
                      }}
                      leadingIcon={<Globe2 size={16} color={theme.text} />}
                      label="Website"
                    />
                  ) : null}
                  {club.nextEvent?.sourceUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        void Linking.openURL(club.nextEvent!.sourceUrl!);
                      }}
                      leadingIcon={<CalendarClock size={16} color={theme.text} />}
                      label="Event source"
                    />
                  ) : null}
                </CardFooter>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
