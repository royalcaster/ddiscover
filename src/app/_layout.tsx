import React from 'react';

import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ClerkAuthProvider } from '@/providers/clerk-provider';
import { ConvexClientProvider } from '@/providers/convex-provider';
import { FavoriteSignInProvider } from '@/providers/favorite-sign-in-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';

function RootLayoutContent() {
  const { navigationTheme, resolvedTheme } = useAppTheme();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[eventId]" />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ClerkAuthProvider>
      <ConvexClientProvider>
        <AppThemeProvider>
          <FavoriteSignInProvider>
            <RootLayoutContent />
          </FavoriteSignInProvider>
        </AppThemeProvider>
      </ConvexClientProvider>
    </ClerkAuthProvider>
  );
}
