import { useAuth } from '@clerk/expo';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function SsoCallbackScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  React.useEffect(() => {
    if (isSignedIn) {
      router.replace('/profile' as Href);
      return;
    }

    const timeout = setTimeout(() => {
      router.replace('/profile' as Href);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isSignedIn, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-base font-semibold">Sign-in wird abgeschlossen...</Text>
      <Text className="text-muted-foreground mt-2 text-sm">Bitte kurz warten.</Text>
    </View>
  );
}
