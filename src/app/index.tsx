import { CalendarDays, Heart, MapPin, Route as RouteIcon, Search } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { View } from 'react-native';

import { api } from '../../convex/_generated/api';
import { DiscoverMap } from '@/components/discover-map';
import { ScreenShell } from '@/components/screen-shell';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { previewClubs } from '@/lib/discovery';
import { useTheme } from '@/hooks/use-theme';

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

  return (
    <ScreenShell
      eyebrow="Entdecken"
      title="Dein Abend in Dresden"
      description="Map-first discovery for clubs, events, and the next useful route. This replaces the prototype feed with the actual product structure."
      headerRight={<ThemeModeToggle />}>
      <View className="gap-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Button variant="secondary" size="icon">
              <Search size={18} color={theme.foreground} />
            </Button>
            <Button variant="outline" size="sm">
              <Text>Alle Clubs</Text>
            </Button>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge variant="outline">
              <Text>{clubs?.length ?? 0} Clubs</Text>
            </Badge>
            <Badge variant="default">
              <Text>{previewClubs.length} Spots</Text>
            </Badge>
          </View>
        </View>

        <DiscoverMap />

        <Card className="-mt-24 ml-3 mr-3 border-border/80 bg-card/95 py-4">
          <CardContent className="gap-4 px-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="gap-2">
                <CardTitle className="text-[22px]">{featuredClub?.name ?? 'Pulse'}</CardTitle>
                <CardDescription className="text-sm">
                  {featuredClub?.city ?? 'Neustadt'} • {featuredClub?.source?.toUpperCase() ?? 'VDSC'}
                </CardDescription>
              </View>
              <Text className="text-muted-foreground text-sm">
                {nextEvent ? '350 m' : 'Live'}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-4">
              <View className="min-w-[180px] flex-1 gap-1">
                <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Heute
                </Text>
                <Text className="text-base font-medium">
                  {nextEvent?.title ?? 'Kollektiv Nacht'}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {formatStartsAt(nextEvent?.startsAt)}
                </Text>
              </View>
              <View className="min-w-[180px] flex-1 gap-1">
                <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Fokus
                </Text>
                <Text className="text-base font-medium">
                  {featuredClub?.websiteUrl ? 'Club Profil bereit' : 'Mehr Daten folgen'}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {featuredClub?.addressLine ?? 'Koenigsbruecker Str. 39'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View className="gap-3 pt-2">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-lg font-semibold">In der Naehe</Text>
            <Text className="text-muted-foreground text-sm">Kurzstrecke zuerst</Text>
          </View>

          {previewClubs.map((club) => (
            <Card key={club.id} className="gap-0 py-4">
              <CardContent className="flex-row items-center gap-4 px-4">
                <View className="h-16 w-16 rounded-2xl bg-secondary" />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-semibold">{club.name}</Text>
                    <Badge variant="outline">
                      <Text>{club.category}</Text>
                    </Badge>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    {club.district} • {club.minutesAway} Min.
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Heute: {featuredClub?.nextEvent?.title ?? 'Kollektiv Nacht'}
                  </Text>
                </View>
                <Button variant="ghost" size="icon">
                  <Heart size={18} color={theme.mutedForeground} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        <View className="grid gap-3">
          <View className="flex-row gap-3">
            <Card className="min-h-[132px] flex-1 py-4">
              <CardContent className="gap-3 px-4">
                <MapPin size={18} color={theme.primary} />
                <Text className="text-base font-semibold">Lokale Transparenz</Text>
                <Text className="text-muted-foreground text-sm leading-5">
                  Automatisierte Club- und Eventdaten statt verstreuter Links.
                </Text>
              </CardContent>
            </Card>
            <Card className="min-h-[132px] flex-1 py-4">
              <CardContent className="gap-3 px-4">
                <CalendarDays size={18} color={theme.primary} />
                <Text className="text-base font-semibold">Kalender zuerst</Text>
                <Text className="text-muted-foreground text-sm leading-5">
                  Zeitraster, Clubfilter und dichte Eventkarten statt Listenblöcke.
                </Text>
              </CardContent>
            </Card>
          </View>
          <Card className="py-4">
            <CardFooter className="justify-between gap-3 px-4">
              <View className="gap-1">
                <Text className="text-base font-semibold">Naechster Schritt</Text>
                <Text className="text-muted-foreground text-sm">
                  Build the real event detail and route flows on top of this shell.
                </Text>
              </View>
              <Button variant="default">
                <RouteIcon size={16} color={theme.primaryForeground} />
                <Text className="text-primary-foreground">Route starten</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </View>
    </ScreenShell>
  );
}
