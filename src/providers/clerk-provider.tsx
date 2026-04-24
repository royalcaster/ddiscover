import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PropsWithChildren } from 'react';

import { clerkPublishableKey } from '@/lib/auth';

export function ClerkAuthProvider({ children }: PropsWithChildren) {
  if (!clerkPublishableKey) {
    return children;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
