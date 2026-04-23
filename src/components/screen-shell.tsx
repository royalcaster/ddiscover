import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type ScreenShellProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
  headerRight?: ReactNode;
  className?: string;
}>;

export function ScreenShell({
  children,
  eyebrow,
  title,
  description,
  headerRight,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[920px] gap-5 px-4 pb-28 pt-3">
        <View className="flex-row items-start justify-between gap-4">
          <View className="max-w-[640px] gap-2">
            {eyebrow ? (
              <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.18em]">
                {eyebrow}
              </Text>
            ) : null}
            <Text variant="h1" className="text-left text-[36px] leading-[40px]">
              {title}
            </Text>
            {description ? (
              <Text variant="muted" className="max-w-[620px] text-[15px] leading-6">
                {description}
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
