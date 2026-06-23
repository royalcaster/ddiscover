import { ConvexProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';
import { PropsWithChildren } from 'react';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || extra.EXPO_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: PropsWithChildren) {
  if (!convexClient) {
    return children;
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
