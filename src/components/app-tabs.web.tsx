import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import type { Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { Text } from './ui/text';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/providers/language-provider';

export default function AppTabs() {
  const { t } = useLanguage();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="discover" href={'/' as Href} asChild>
            <TabButton>{t('tabs.discover')}</TabButton>
          </TabTrigger>
          <TabTrigger name="calendar" href={'/calendar' as Href} asChild>
            <TabButton>{t('tabs.calendar')}</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href={'/profile' as Href} asChild>
            <TabButton>{t('tabs.profile')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        className={isFocused ? 'rounded-lg bg-secondary px-4 py-2' : 'rounded-lg bg-card px-4 py-2'}
        style={styles.tabButtonView}>
        <Text className={isFocused ? 'text-foreground' : 'text-muted-foreground'}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const colors = useTheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <View className="bg-card" style={styles.innerContainer}>
        <Text className="text-sm font-semibold" style={styles.brandText}>
          DDiscover
        </Text>

        {props.children}

        <ExternalLink href="https://vdsc.de/veranstaltungen.html" asChild>
          <Pressable style={styles.externalPressable}>
            <Text className="text-sm text-muted-foreground">VDSC</Text>
            <SymbolView
              tintColor={colors.foreground}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
