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
  const theme = useTheme();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const webClientId = process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID || extra.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
  const androidClientId =
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID ||
    extra.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID;

  const activateSession = async (
    result: Awaited<ReturnType<typeof startGoogleAuthenticationFlow | typeof startSSOFlow>>,
  ) => {
    const sessionId =
      result.createdSessionId ??
      result.signIn?.createdSessionId ??
      result.signUp?.createdSessionId ??
      null;

    if (sessionId && result.setActive) {
      await result.setActive({ session: sessionId });
      return true;
    }

    return false;
  };

  const handlePress = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!webClientId) {
        setErrorMessage('Missing EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID in .env.local.');
        return;
      }

      if (Platform.OS === 'android' && !androidClientId) {
        setErrorMessage('Missing EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID in .env.local.');
        return;
      }

      const nativeResult = await startGoogleAuthenticationFlow();
      if (await activateSession(nativeResult)) {
        return;
      }

      const oauthResult = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
      });
      if (!(await activateSession(oauthResult))) {
        setErrorMessage('Google sign-in did not create a Clerk session.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="gap-2">
      <Button
        variant="outline"
        className="h-12 rounded-full border-border bg-background"
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

      {errorMessage ? <Text className="text-destructive text-xs">{errorMessage}</Text> : null}
    </View>
  );
}
