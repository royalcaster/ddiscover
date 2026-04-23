import React from 'react';

import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ClerkAuthProvider } from '@/providers/clerk-provider';
import { ConvexClientProvider } from '@/providers/convex-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';

function RootLayoutContent() {
  const { navigationTheme, resolvedTheme } = useAppTheme();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <AppTabs />
      <PortalHost />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ClerkAuthProvider>
      <ConvexClientProvider>
        <AppThemeProvider>
          <RootLayoutContent />
        </AppThemeProvider>
      </ConvexClientProvider>
    </ClerkAuthProvider>
  );
}
