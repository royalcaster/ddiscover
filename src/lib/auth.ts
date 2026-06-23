import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || extra.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const clerkEnabled = Boolean(clerkPublishableKey);
