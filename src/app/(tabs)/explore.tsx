import { Building2, CalendarClock, Globe2, MapPinHouse, MapPinned } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { openEventDetail } from '@/lib/navigation';
import { useLanguage } from '@/providers/language-provider';

function formatStartsAt(timestamp: number | undefined, locale: string, fallback: string) {
  if (!timestamp) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
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
  const { locale, t } = useLanguage();
  const clubsQuery = usePublicConvexQuery(api.clubs.list, { limit: 24 });
  const clubs = clubsQuery.data;

  const clubsWithUpcomingEvent = clubs?.filter((club) => club.nextEvent !== null).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[860px] gap-6 px-4 pb-28 pt-4">
        <View className="gap-4">
          <View className="max-w-[620px] gap-3">
            <Badge variant="default">
              <Text>{t('common.studentClubs')}</Text>
            </Badge>
            <Text variant="h1" className="text-left">
              {t('explore.heroTitle')}
            </Text>
            <Text variant="muted">
              {t('explore.heroDescription')}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
                  {t('explore.loadedStat')}
                </Text>
                <Text className="text-4xl font-semibold">{clubs?.length ?? '...'}</Text>
              </CardHeader>
            </Card>
            <Card className="min-w-[170px] flex-1">
              <CardHeader className="gap-1 pb-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
                  {t('explore.withNextEventStat')}
                </Text>
                <Text className="text-4xl font-semibold">{clubsWithUpcomingEvent}</Text>
              </CardHeader>
            </Card>
          </View>
        </View>

        {clubsQuery.isLoading ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="h4">{t('explore.loadingTitle')}</Text>
              <Text variant="muted">{t('explore.loadingDescription')}</Text>
            </CardContent>
          </Card>
        ) : clubsQuery.error ? (
          <Card>
            <CardContent className="pt-4">
              <Text variant="h4">{t('explore.requestFailed')}</Text>
              <Text variant="muted">{clubsQuery.error.message}</Text>
            </CardContent>
          </Card>
        ) : (
          (clubs ?? []).map((club) => {
            const address = formatAddress(club.addressLine, club.postalCode, club.city);

            return (
              <Card key={club._id}>
                <CardHeader className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-3">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Badge variant="default">
                          <Text>{club.source?.toUpperCase() ?? t('explore.manual')}</Text>
                        </Badge>
                        <Badge variant="outline">
                          <Text>{club.slug}</Text>
                        </Badge>
                      </View>
                      <CardTitle className="text-2xl">{club.name}</CardTitle>
                    </View>

                    <View className="rounded-lg border border-border bg-secondary px-3 py-2">
                      <Text className="font-mono text-xs font-semibold uppercase tracking-[0.12em]">
                        {club.nextEvent ? formatStartsAt(club.nextEvent.startsAt, locale, t('explore.noNextEventShort')) : t('explore.noNextEventShort')}
                      </Text>
                    </View>
                  </View>
                </CardHeader>

                <CardContent>
                  <View className="gap-3">
                    <View className="flex-row items-start gap-2">
                      <Building2 size={16} color={theme.mutedForeground} style={{ marginTop: 2 }} />
                      <Text variant="muted">
                        {club.websiteUrl ? t('explore.sourceProfile') : t('explore.canonicalProfile')}
                      </Text>
                    </View>

                    {address ? (
                      <View className="flex-row items-start gap-2">
                        <MapPinHouse size={16} color={theme.mutedForeground} style={{ marginTop: 2 }} />
                        <Text variant="muted">{address}</Text>
                      </View>
                    ) : null}

                    {club.nextEvent ? (
                      <Pressable
                        className="gap-2 rounded-lg border border-border bg-secondary p-3"
                        onPress={() => openEventDetail(club.nextEvent!._id)}>
                        <View className="flex-row items-center gap-2">
                          <CalendarClock size={16} color={theme.mutedForeground} />
                          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.12em]">
                            {t('explore.nextEvent')}
                          </Text>
                        </View>
                        <Text variant="large">{club.nextEvent.title}</Text>
                        <View className="flex-row flex-wrap gap-4">
                          <View className="min-w-[180px] flex-1 flex-row items-center gap-2">
                            <MapPinned size={16} color={theme.mutedForeground} />
                            <Text variant="muted">
                              {club.nextEvent.locationName ?? club.name}
                            </Text>
                          </View>
                          <Text variant="muted">{formatStartsAt(club.nextEvent.startsAt, locale, t('explore.noNextEventShort'))}</Text>
                        </View>
                      </Pressable>
                    ) : (
                      <View className="rounded-lg border border-border bg-secondary p-3">
                        <Text variant="muted">{t('explore.noLinkedEvent')}</Text>
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
                      }}>
                      <Globe2 size={16} color={theme.foreground} />
                      <Text>{t('explore.website')}</Text>
                    </Button>
                  ) : null}
                  {club.nextEvent?.sourceUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        openEventDetail(club.nextEvent!._id);
                      }}>
                      <CalendarClock size={16} color={theme.foreground} />
                      <Text>{t('explore.eventDetails')}</Text>
                    </Button>
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
