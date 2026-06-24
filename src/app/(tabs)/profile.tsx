import { useIsFocused } from '@react-navigation/native';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { ArrowLeft, Building2, CalendarClock, Heart, MoonStar, Settings, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { api } from '../../../convex/_generated/api';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { ScreenShell } from '@/components/screen-shell';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useFavorites } from '@/hooks/use-favorites';
import { usePublicConvexQuery } from '@/hooks/use-public-convex-query';
import { useTheme } from '@/hooks/use-theme';
import { clerkEnabled } from '@/lib/auth';
import { openEventDetail } from '@/lib/navigation';

function formatEventDate(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function SignedInCard() {
  const theme = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Clerk Konto';
  const email = user?.primaryEmailAddress?.emailAddress ?? 'Angemeldet';
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageUrl = user?.imageUrl;
  const showProfileImage = Boolean(imageUrl && !imageFailed);

  return (
    <Card className="rounded-[22px] py-0">
      <CardContent className="gap-4 px-4 py-4">
        <View className="flex-row items-center gap-3">
          {showProfileImage ? (
            <Image
              source={{ uri: imageUrl }}
              contentFit="cover"
              onError={() => setImageFailed(true)}
              style={styles.profileImage}
            />
          ) : (
            <View className="items-center justify-center rounded-full bg-secondary" style={styles.profileImage}>
              <ShieldCheck size={20} color={theme.primary} />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold">{displayName}</Text>
            <Text className="text-muted-foreground text-sm">{email}</Text>
          </View>
        </View>

        <Button variant="outline" className="rounded-full" onPress={() => void signOut()}>
          <Text>Abmelden</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

function FavoritesSection() {
  const theme = useTheme();
  const favorites = useFavorites();
  const clubsQuery = usePublicConvexQuery(api.clubs.list, { limit: 72 });
  const eventsQuery = usePublicConvexQuery(api.events.listUpcoming, { limit: 120 });
  const clubs = clubsQuery.data ?? [];
  const events = eventsQuery.data ?? [];

  const favoriteClubs = React.useMemo(
    () => clubs.filter((club) => favorites.clubIds.has(club._id)),
    [clubs, favorites.clubIds],
  );
  const favoriteEvents = React.useMemo(
    () => events.filter((event) => favorites.eventIds.has(event._id)),
    [events, favorites.eventIds],
  );
  const favoriteCount = favoriteClubs.length + favoriteEvents.length;
  const isLoading = favorites.isLoading || clubsQuery.isLoading || eventsQuery.isLoading;

  return (
    <Card className="rounded-[22px] py-0">
      <CardContent className="gap-4 px-4 py-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Heart size={18} color={theme.primary} fill={favoriteCount > 0 ? theme.primary : 'transparent'} />
            <Text className="text-lg font-semibold">Favorites</Text>
          </View>
          <Badge variant="secondary" className="px-2.5 py-1">
            <Text>{favoriteCount}</Text>
          </Badge>
        </View>

        {isLoading ? (
          <Text className="text-muted-foreground text-sm">Favoriten werden geladen...</Text>
        ) : clubsQuery.error || eventsQuery.error ? (
          <Text className="text-destructive text-sm">
            Convex konnte nicht geladen werden: {clubsQuery.error?.message ?? eventsQuery.error?.message}
          </Text>
        ) : favoriteCount === 0 ? (
          <Text className="text-muted-foreground text-sm">
            Gespeicherte Clubs und Events erscheinen hier.
          </Text>
        ) : (
          <View className="gap-3">
            {favoriteClubs.length > 0 ? (
              <View className="gap-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">Clubs</Text>
                {favoriteClubs.slice(0, 5).map((club) => (
                  <View key={club._id} className="flex-row items-center gap-3 rounded-[12px] bg-secondary px-3 py-3">
                    <Building2 size={16} color={theme.primary} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold">{club.name}</Text>
                      <Text className="text-muted-foreground text-xs">{club.city ?? 'Dresden'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {favoriteEvents.length > 0 ? (
              <View className="gap-2">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">Events</Text>
                {favoriteEvents.slice(0, 5).map((event) => (
                  <Pressable
                    key={event._id}
                    className="flex-row items-center gap-3 rounded-[12px] bg-secondary px-3 py-3"
                    onPress={() => openEventDetail(event._id)}>
                    <CalendarClock size={16} color={theme.primary} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold">{event.title}</Text>
                      <Text className="text-muted-foreground text-xs">{formatEventDate(event.startsAt)}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

function SignedOutAuthSurface() {
  const isFocused = useIsFocused();

  if (!isFocused) {
    return (
      <View className="min-h-[560px] items-center justify-center">
        <Text className="text-muted-foreground text-sm">Profil wird geladen...</Text>
      </View>
    );
  }

  return (
    <View className="min-h-[320px] justify-center gap-4">
      <View className="gap-2">
        <Text className="text-center text-2xl font-semibold">Bei DDiscover anmelden</Text>
        <Text className="text-muted-foreground text-center text-sm">
          Speichere Clubs und Events mit deinem Google Konto.
        </Text>
      </View>
      <GoogleSignInButton />
    </View>
  );
}

function SettingsContent() {
  const theme = useTheme();

  return (
    <View className="gap-3">
      <Card className="rounded-[22px] py-0">
        <CardContent className="gap-4 px-4 py-4">
          <View className="flex-row items-center gap-2">
            <MoonStar size={18} color={theme.primary} />
            <Text className="text-base font-semibold">Farbschema</Text>
          </View>
          <ThemeModeToggle />
        </CardContent>
      </Card>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { isSignedIn } = useAuth();
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <ScreenShell
      title={showSettings ? 'Einstellungen' : 'Profil'}
      headerRight={
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full"
          onPress={() => setShowSettings((value) => !value)}>
          {showSettings ? (
            <ArrowLeft size={18} color={theme.foreground} />
          ) : (
            <Settings size={18} color={theme.foreground} />
          )}
        </Button>
      }>
      {showSettings ? (
        <SettingsContent />
      ) : (
        <View className="gap-3">
          {!clerkEnabled ? (
            <Card className="rounded-[22px] py-0">
              <CardContent className="gap-3 px-4 py-4">
                <Text className="text-base font-semibold">Clerk noch nicht konfiguriert</Text>
                <Text className="text-muted-foreground text-sm">
                  Setze `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`.
                </Text>
              </CardContent>
            </Card>
          ) : isSignedIn ? (
            <>
              <SignedInCard />
              <FavoritesSection />
            </>
          ) : (
            <SignedOutAuthSurface />
          )}
        </View>
      )}
    </ScreenShell>
  );
}
