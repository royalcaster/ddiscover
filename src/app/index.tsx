import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { Heart, MapPin, Route as RouteIcon, Search, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { DiscoverMap } from '@/components/discover-map';
import { ScreenShell } from '@/components/screen-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { previewClubs } from '@/lib/discovery';

function formatStartsAt(timestamp?: number) {
  if (!timestamp) return 'Heute';
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export default function DiscoverScreen() {
  const theme = useTheme();
  const clubs = useQuery(api.clubs.list, { limit: 8 });
  const featuredClub = clubs?.find((club) => club.nextEvent) ?? clubs?.[0] ?? null;
  const nextEvent = featuredClub?.nextEvent ?? null;
  const heroClub = previewClubs[2];
  const nearbyClubs = previewClubs.slice(0, 3);

  return (
    <ScreenShell
      title="Entdecken"
      headerRight={
        <View className="flex-row items-center gap-2">
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full">
            <Search size={16} color={theme.foreground} />
          </Button>
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full">
            <SlidersHorizontal size={16} color={theme.foreground} />
          </Button>
        </View>
      }>
      <View className="gap-4">
        <DiscoverMap />

        <Card className="-mt-[92px] mx-3 rounded-[22px] border-border/70 bg-card/95 py-0">
          <CardContent className="gap-3 px-3 py-3">
            <View className="flex-row gap-3">
              <Image source={heroClub.imageUrl} contentFit="cover" className="h-20 w-24 rounded-[14px]" />
              <View className="flex-1 justify-between py-0.5">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="gap-1">
                    <CardTitle className="text-[20px]">{featuredClub?.name ?? heroClub.name}</CardTitle>
                    <Text className="text-muted-foreground text-[13px]">
                      {featuredClub?.city ?? heroClub.district} • {heroClub.category}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground pt-0.5 text-[12px]">{heroClub.walkDistance}</Text>
                </View>

                <View className="gap-0.5">
                  <Text className="text-[13px] font-medium">Heute: {nextEvent?.title ?? heroClub.tonight}</Text>
                  <Text className="text-muted-foreground text-[12px]">
                    {formatStartsAt(nextEvent?.startsAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <Button variant="outline" size="sm" className="rounded-full px-4">
                <Text>Alle Clubs</Text>
              </Button>
              <View className="flex-row items-center gap-2">
                <Badge variant="default" className="rounded-full px-3 py-1">
                  <Text>{previewClubs.length} Spots</Text>
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  <Text>{clubs?.length ?? 0} Clubs</Text>
                </Badge>
              </View>
            </View>
          </CardContent>
        </Card>

        <View className="gap-3 pt-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-lg font-semibold">In der Nähe</Text>
            <Text className="text-muted-foreground text-sm">Kurzstrecke zuerst</Text>
          </View>

          {nearbyClubs.map((club) => (
            <Card key={club.id} className="gap-0 rounded-[22px] py-0">
              <CardContent className="flex-row items-center gap-3 px-3 py-3">
                <Image source={club.imageUrl} contentFit="cover" className="h-20 w-20 rounded-[16px]" />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1 gap-0.5">
                      <Text className="text-base font-semibold">{club.name}</Text>
                      <Text className="text-muted-foreground text-[13px]">
                        {club.category} • {club.district}
                      </Text>
                    </View>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Heart size={16} color={theme.mutedForeground} />
                    </Button>
                  </View>
                  <Text className="text-[13px] font-medium">{club.tonight}</Text>
                  <Text className="text-muted-foreground text-[12px]">
                    {club.walkDistance} • {club.minutesAway} Min.
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        <Card className="rounded-[22px] py-0">
          <CardContent className="gap-4 px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="gap-0.5">
                <Text className="text-[15px] font-semibold">Schnellzugriffe</Text>
                <Text className="text-muted-foreground text-[12px]">
                  Kalender, Wege und Favoriten auf dem gleichen Niveau.
                </Text>
              </View>
              <MapPin size={18} color={theme.primary} />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2 rounded-[18px] bg-secondary p-3">
                <Text className="text-muted-foreground text-[12px] font-semibold uppercase tracking-[0.16em]">
                  Nächste Route
                </Text>
                <Text className="text-[15px] font-semibold">Louisenstraße → Pulse</Text>
                <Text className="text-muted-foreground text-[12px]">23 Min. mit Tram 7</Text>
              </View>
              <View className="flex-1 gap-2 rounded-[18px] bg-secondary p-3">
                <Text className="text-muted-foreground text-[12px] font-semibold uppercase tracking-[0.16em]">
                  Datenstand
                </Text>
                <Text className="text-[15px] font-semibold">VDSC + Clubs</Text>
                <Text className="text-muted-foreground text-[12px]">
                  {clubs?.length ?? 0} Clubs verknüpft
                </Text>
              </View>
            </View>

            <Button variant="default" className="rounded-full">
              <RouteIcon size={16} color={theme.primaryForeground} />
              <Text className="text-primary-foreground">Route starten</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScreenShell>
  );
}
