import React from 'react';

import '@/global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ClerkAuthProvider } from '@/providers/clerk-provider';
import { ConvexClientProvider } from '@/providers/convex-provider';
import { AppThemeProvider } from '@/providers/theme-provider';

export default function TabLayout() {
  return (
    <ClerkAuthProvider>
      <ConvexClientProvider>
        <AppThemeProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </AppThemeProvider>
      </ConvexClientProvider>
    </ClerkAuthProvider>
  );
}
