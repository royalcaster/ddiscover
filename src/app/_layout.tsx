import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ClerkAuthProvider } from '@/providers/clerk-provider';
import { ConvexClientProvider } from '@/providers/convex-provider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkAuthProvider>
      <ConvexClientProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <AppTabs />
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkAuthProvider>
  );
}
