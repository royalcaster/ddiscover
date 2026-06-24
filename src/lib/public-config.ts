import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const publicConvexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || extra.EXPO_PUBLIC_CONVEX_URL;
export const publicClerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || extra.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
