import { useAuth } from '@clerk/expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { PropsWithChildren } from 'react';

import { clerkEnabled } from '@/lib/auth';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
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
