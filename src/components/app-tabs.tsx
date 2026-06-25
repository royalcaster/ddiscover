import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { CalendarDays, Compass, UserRound } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/providers/theme-provider';

const VISIBLE_TABS = [
  { name: 'index', label: 'Entdecken', Icon: Compass },
  { name: 'calendar', label: 'Kalender', Icon: CalendarDays },
  { name: 'profile', label: 'Profil', Icon: UserRound },
] as const;

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      {VISIBLE_TABS.map(({ name, label, Icon }) => {
        const route = state.routes.find((entry) => entry.name === name);
        if (!route) return null;

        const focused = state.routes[state.index]?.key === route.key;
        const descriptor = descriptors[route.key];
        const iconColor = focused ? colors.foreground : colors.mutedForeground;
        const labelColor = focused ? colors.foreground : colors.mutedForeground;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : undefined}
            accessibilityLabel={descriptor.options.tabBarAccessibilityLabel ?? label}
            android_ripple={{ color: colors.secondary, borderless: false }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            }}
            style={({ pressed }) => [
              styles.tabItem,
              focused
                ? {
                    backgroundColor: colors.secondary,
                  }
                : null,
              pressed && !focused
                ? {
                    backgroundColor: colors.secondary,
                  }
                : null,
            ]}>
            <Icon size={23} color={iconColor} strokeWidth={focused ? 2.8 : 2.3} />
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {
                  color: labelColor,
                  fontWeight: focused ? '700' : '600',
                },
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  const { colors, resolvedTheme } = useAppTheme();

  return (
    <Tabs
      key={resolvedTheme}
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Entdecken' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Kalender' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="route" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-around',
    minHeight: 84,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: 26,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});
