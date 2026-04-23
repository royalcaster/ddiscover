import { MonitorSmartphone, MoonStar, SunMedium } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/providers/theme-provider';

const options = [
  { value: 'system', icon: MonitorSmartphone, label: 'System' },
  { value: 'light', icon: SunMedium, label: 'Light' },
  { value: 'dark', icon: MoonStar, label: 'Dark' },
] as const;

export function ThemeModeToggle() {
  const { colors, preference, setPreference } = useAppTheme();

  return (
    <View className="flex-row rounded-lg border border-border bg-card p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = preference === option.value;

        return (
          <Button
            key={option.value}
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            className="min-w-[72px] border-transparent"
            onPress={() => {
              void setPreference(option.value);
            }}>
            <View className="flex-row items-center gap-2">
              <Icon
                size={15}
                color={isActive ? colors.primaryForeground : colors.mutedForeground}
                strokeWidth={2}
              />
              <Text className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
                {option.label}
              </Text>
            </View>
          </Button>
        );
      })}
    </View>
  );
}
