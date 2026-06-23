import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { useAppTheme } from '@/providers/theme-provider';

export default function AppTabs() {
  const { colors, resolvedTheme } = useAppTheme();
  const activeItemColor = colors.primaryForeground;
  const inactiveItemColor = colors.mutedForeground;

  return (
    <NativeTabs
      key={resolvedTheme}
      backgroundColor={colors.background}
      iconColor={{ default: inactiveItemColor, selected: activeItemColor }}
      indicatorColor={colors.primary}
      labelStyle={{
        default: { color: inactiveItemColor },
        selected: { color: colors.foreground },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Entdecken</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'map', selected: 'map.fill' }}
          md="explore"
          selectedColor={activeItemColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>Kalender</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md="calendar_today"
          selectedColor={activeItemColor}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person_outline"
          selectedColor={activeItemColor}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
