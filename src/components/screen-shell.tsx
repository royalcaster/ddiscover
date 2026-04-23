import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  headerRight?: ReactNode;
  headerSubtitle?: string;
  className?: string;
}>;

export function ScreenShell({
  children,
  title,
  headerRight,
  headerSubtitle,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[920px] gap-4 px-4 pb-28 pt-2">
        <View className="flex-row items-center justify-between gap-4 pt-1">
          <View className="max-w-[640px] gap-0.5">
            <Text variant="h1" className="text-left text-[28px] leading-[32px]">
              {title}
            </Text>
            {headerSubtitle ? (
              <Text variant="muted" className="text-[13px] leading-5">
                {headerSubtitle}
              </Text>
            ) : null}
          </View>
          {headerRight}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
