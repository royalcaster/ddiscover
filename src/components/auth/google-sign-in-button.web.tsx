import { useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export function GoogleSignInButton() {
  const theme = useTheme();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [debugMessage, setDebugMessage] = React.useState<string | null>(null);

  const summarizeResult = (result: Awaited<ReturnType<typeof startSSOFlow>>) => {
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
    };
  };

  const handlePress = async () => {
    setErrorMessage(null);
    setDebugMessage(null);
    setIsLoading(true);

    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
      });
      const summary = summarizeResult(result);
      console.log('[GoogleSignInButton][web] Clerk result:', summary);

      const sessionId =
        result.createdSessionId ??
        result.signIn?.createdSessionId ??
        result.signUp?.createdSessionId ??
        null;

      if (sessionId && result.setActive) {
        console.log('[GoogleSignInButton][web] Activating session:', sessionId);
        await result.setActive({ session: sessionId });
        return;
      }

      const signInStatus = result.signIn?.status;
      const signUpStatus = result.signUp?.status;
      const statusLabel = [signInStatus, signUpStatus].filter(Boolean).join(' / ');
      const compactDebug = `debug: signin=${signInStatus ?? 'n/a'}, signup=${signUpStatus ?? 'n/a'}, verification=${result.signIn?.firstFactorVerification?.status ?? 'n/a'}`;
      setDebugMessage(compactDebug);

      setErrorMessage(
        statusLabel
          ? `Google flow incomplete (${statusLabel}). Continue in the form below.`
          : 'No Clerk session was created. Continue in the form below.',
      );
    } catch (error) {
      console.error('[GoogleSignInButton][web] Flow error:', error);
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
      {debugMessage ? (
        <Text className="text-muted-foreground text-[11px]">{debugMessage}</Text>
      ) : null}
    </View>
  );
}
