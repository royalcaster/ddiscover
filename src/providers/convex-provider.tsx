import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { PropsWithChildren } from 'react';

import { publicConvexUrl } from '@/lib/public-config';

const convexClient = publicConvexUrl ? new ConvexReactClient(publicConvexUrl) : null;

export function ConvexClientProvider({ children }: PropsWithChildren) {
  if (!convexClient) {
    return children;
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
