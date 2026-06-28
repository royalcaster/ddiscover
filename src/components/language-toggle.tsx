import { Languages } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { LANGUAGE_OPTIONS } from '@/i18n';
import { useLanguage } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

export function LanguageToggle() {
  const { colors } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <View className="flex-row rounded-lg border border-border bg-card p-1">
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = language === option.value;

        return (
          <Button
            key={option.value}
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            className="flex-1 border-transparent"
            onPress={() => {
              void setLanguage(option.value);
            }}>
            <View className="flex-row items-center justify-center gap-2">
              <Languages
                size={15}
                color={isActive ? colors.primaryForeground : colors.mutedForeground}
                strokeWidth={2}
              />
              <Text className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
                {t(option.labelKey)}
              </Text>
            </View>
          </Button>
        );
      })}
    </View>
  );
}
