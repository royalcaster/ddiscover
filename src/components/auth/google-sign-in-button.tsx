import { useSSO } from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export function GoogleSignInButton() {
  const isDev = __DEV__;
  const theme = useTheme();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [debugMessage, setDebugMessage] = React.useState<string | null>(null);
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const webClientId = process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID ?? extra.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
  const androidClientId =
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID ??
    extra.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID;

  const summarizeResult = (result: Awaited<ReturnType<typeof startGoogleAuthenticationFlow>>) => {
    const signInStatus = result.signIn?.status ?? null;
    const signUpStatus = result.signUp?.status ?? null;
    const signInVerificationStatus = result.signIn?.firstFactorVerification?.status ?? null;

    return {
      createdSessionId: result.createdSessionId ?? null,
      signInCreatedSessionId: result.signIn?.createdSessionId ?? null,
      signUpCreatedSessionId: result.signUp?.createdSessionId ?? null,
      hasSetActive: Boolean(result.setActive),
      signInStatus,
      signUpStatus,
      signInVerificationStatus,
      signUpMissingFields: result.signUp?.missingFields ?? null,
      signUpUnverifiedFields: result.signUp?.unverifiedFields ?? null,
    };
  };

  const handlePress = async () => {
    setErrorMessage(null);
    setDebugMessage(null);
    setIsLoading(true);

    try {
      if (!webClientId) {
        setErrorMessage('Missing EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID in .env.local');
        return;
      }

      if (Platform.OS === 'android' && !androidClientId) {
        setErrorMessage(
          'Missing EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID in .env.local (required for native Android Google sign-in).',
        );
        return;
      }

      const result = await startGoogleAuthenticationFlow();
      const summary = summarizeResult(result);
      if (isDev) {
        console.log('[GoogleSignInButton][native] Clerk result:', summary);
      }

      const sessionId =
        result.createdSessionId ??
        result.signIn?.createdSessionId ??
        result.signUp?.createdSessionId ??
        null;

      if (sessionId && result.setActive) {
        if (isDev) {
          console.log('[GoogleSignInButton][native] Activating session:', sessionId);
        }
        await result.setActive({ session: sessionId });
        return;
      }

      const signInStatus = result.signIn?.status;
      const signUpStatus = result.signUp?.status;
      const statusLabel = [signInStatus, signUpStatus].filter(Boolean).join(' / ');
      const compactDebug = `debug: signin=${signInStatus ?? 'n/a'}, signup=${signUpStatus ?? 'n/a'}, verification=${result.signIn?.firstFactorVerification?.status ?? 'n/a'}`;
      if (isDev) {
        setDebugMessage(compactDebug);
      }

      if (signUpStatus === 'missing_requirements') {
        const missing = result.signUp?.missingFields?.join(', ') ?? 'n/a';
        const unverified = result.signUp?.unverifiedFields?.join(', ') ?? 'n/a';
        setErrorMessage(
          `Google account erkannt, aber Signup-Voraussetzungen fehlen. missing=${missing}; unverified=${unverified}`,
        );
        return;
      }

      setErrorMessage(
        statusLabel
          ? `Google flow incomplete (${statusLabel}). Continue in the form below.`
          : 'No Clerk session was created. Continue in the form below.',
      );

      // Fallback: if native Google flow returns no session, try Clerk OAuth flow.
      if (isDev) {
        console.log('[GoogleSignInButton][native] Falling back to Clerk OAuth Google flow.');
      }
      const fallback = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
      });
      const fallbackSessionId =
        fallback.createdSessionId ??
        fallback.signIn?.createdSessionId ??
        fallback.signUp?.createdSessionId ??
        null;

      if (isDev) {
        console.log('[GoogleSignInButton][native] OAuth fallback result:', {
          createdSessionId: fallback.createdSessionId ?? null,
          signInCreatedSessionId: fallback.signIn?.createdSessionId ?? null,
          signUpCreatedSessionId: fallback.signUp?.createdSessionId ?? null,
          signInStatus: fallback.signIn?.status ?? null,
          signUpStatus: fallback.signUp?.status ?? null,
          signUpMissingFields: fallback.signUp?.missingFields ?? null,
          signUpUnverifiedFields: fallback.signUp?.unverifiedFields ?? null,
          hasSetActive: Boolean(fallback.setActive),
        });
      }

      if (fallbackSessionId && fallback.setActive) {
        await fallback.setActive({ session: fallbackSessionId });
        setErrorMessage(null);
        if (isDev) {
          setDebugMessage('Native Google fallback succeeded via OAuth.');
        }
        return;
      }
    } catch (error) {
      if (isDev) {
        console.error('[GoogleSignInButton][native] Flow error:', error);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Google sign-in failed.');
      setDebugMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="gap-2">
      <Button
        variant="outline"
        className="h-11 rounded-full border-border bg-background"
        onPress={() => void handlePress()}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.foreground} />
        ) : (
          <View className="h-5 w-5 items-center justify-center rounded-full border border-border">
            <Text className="text-[11px] font-semibold">G</Text>
          </View>
        )}
        <Text>Mit Google fortfahren</Text>
      </Button>

      {errorMessage ? (
        <Text className="text-destructive text-xs">{errorMessage}</Text>
      ) : null}
      {isDev && debugMessage ? (
        <Text className="text-muted-foreground text-[11px]">{debugMessage}</Text>
      ) : null}
    </View>
  );
}
