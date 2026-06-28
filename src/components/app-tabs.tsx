import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { CalendarDays, Compass, UserRound } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useLanguage } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

const VISIBLE_TABS = [
  { name: 'index', labelKey: 'tabs.discover', Icon: Compass },
  { name: 'calendar', labelKey: 'tabs.calendar', Icon: CalendarDays },
  { name: 'profile', labelKey: 'tabs.profile', Icon: UserRound },
] as const;

const TAB_COLORS = {
  light: {
    background: '#ffffff',
    border: 'rgba(17,17,17,0.08)',
    activeBackground: '#f2f2f2',
    foreground: '#111111',
    muted: '#666666',
    ripple: 'rgba(0,0,0,0.08)',
  },
  dark: {
    background: '#000000',
    border: 'rgba(255,255,255,0.08)',
    activeBackground: '#1f1f1d',
    foreground: '#f5f0df',
    muted: '#a9a39a',
    ripple: 'rgba(255,255,255,0.12)',
  },
} as const;

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { resolvedTheme } = useAppTheme();
  const { t } = useLanguage();
  const tabColors = TAB_COLORS[resolvedTheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: tabColors.background,
          borderTopColor: tabColors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      {VISIBLE_TABS.map(({ name, labelKey, Icon }) => {
        const route = state.routes.find((entry) => entry.name === name);
        if (!route) return null;

        const label = t(labelKey);
        const focused = state.routes[state.index]?.key === route.key;
        const descriptor = descriptors[route.key];
        const iconColor = focused ? tabColors.foreground : tabColors.muted;
        const labelColor = focused ? tabColors.foreground : tabColors.muted;
        const activateTab = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <View
            key={route.key}
            style={[
              styles.tabClip,
              focused ? { backgroundColor: tabColors.activeBackground } : null,
            ]}>
            <TouchableNativeFeedback
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : undefined}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel ?? label}
              background={TouchableNativeFeedback.Ripple(tabColors.ripple, false)}
              onPress={activateTab}
              onLongPress={() => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              }}
              useForeground>
              <View style={styles.tabItem}>
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
              </View>
            </TouchableNativeFeedback>
          </View>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  const { resolvedTheme } = useAppTheme();
  const { t } = useLanguage();
  const tabColors = TAB_COLORS[resolvedTheme];

  return (
    <Tabs
      key={resolvedTheme}
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: tabColors.background },
      }}
      tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: t('tabs.discover') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
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
  tabClip: {
    borderRadius: 26,
    flex: 1,
    minHeight: 56,
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
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
