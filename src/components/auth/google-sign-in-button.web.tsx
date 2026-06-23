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

  const handlePress = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
      });
      const sessionId =
        result.createdSessionId ??
        result.signIn?.createdSessionId ??
        result.signUp?.createdSessionId ??
        null;

      if (sessionId && result.setActive) {
        await result.setActive({ session: sessionId });
      } else {
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
