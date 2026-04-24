import { useIsFocused } from '@react-navigation/native';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Settings, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { ClerkAuthEntry } from '@/components/auth/clerk-auth-entry';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { ScreenShell } from '@/components/screen-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { clerkEnabled } from '@/lib/auth';

function SignedInCard() {
  const theme = useTheme();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <Card className="rounded-[22px] py-0">
      <CardContent className="gap-4 px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <ShieldCheck size={20} color={theme.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Clerk Konto'}
            </Text>
            <Text className="text-muted-foreground text-sm">
              {user?.primaryEmailAddress?.emailAddress ?? 'Angemeldet'}
            </Text>
          </View>
        </View>

        <Button variant="outline" className="rounded-full" onPress={() => void signOut()}>
          <Text>Abmelden</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function SignedOutAuthSurface() {
  const isFocused = useIsFocused();
  const [authViewInstance, setAuthViewInstance] = React.useState(0);

  React.useEffect(() => {
    if (isFocused) {
      setAuthViewInstance((value) => value + 1);
    }
  }, [isFocused]);

  if (!isFocused) {
    return (
      <View className="min-h-[560px] items-center justify-center">
        <Text className="text-muted-foreground text-sm">Profil wird geladen...</Text>
      </View>
    );
  }

  return (
    <View className="min-h-[560px] gap-3">
      <GoogleSignInButton />
      <ClerkAuthEntry key={`clerk-auth-${authViewInstance}`} />
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <ScreenShell
      title="Profil"
      headerRight={
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full"
          onPress={() => router.push('/settings' as Href)}>
          <Settings size={18} color={theme.foreground} />
        </Button>
      }>
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
          <SignedInCard />
        ) : (
          <SignedOutAuthSurface />
        )}
      </View>
    </ScreenShell>
  );
}
