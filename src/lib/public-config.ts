import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

function normalizeConvexUrl(value?: string) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;

  try {
    const url = new URL(trimmedValue);
    return `${url.protocol}//${url.host}`;
  } catch {
    return trimmedValue.replace(/\/+$/, '');
  }
}

export const publicConvexUrl = normalizeConvexUrl(
  process.env.EXPO_PUBLIC_CONVEX_URL || extra.EXPO_PUBLIC_CONVEX_URL,
);
export const publicClerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || extra.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
