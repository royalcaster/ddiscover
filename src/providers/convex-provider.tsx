import { useAuth } from '@clerk/expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import Constants from 'expo-constants';
import { PropsWithChildren } from 'react';

import { clerkEnabled } from '@/lib/auth';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || extra.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: PropsWithChildren) {
  if (!convexClient) {
    return children;
  }

  if (clerkEnabled) {
    return (
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
