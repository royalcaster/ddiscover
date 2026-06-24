import { useRouter } from 'expo-router';
import { LogIn, X } from 'lucide-react-native';
import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/providers/theme-provider';

type FavoriteSignInContextValue = {
  showSignInPrompt: () => void;
};

const FavoriteSignInContext = createContext<FavoriteSignInContextValue | null>(null);

export function FavoriteSignInProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = React.useState(false);
  const progress = React.useRef(new Animated.Value(0)).current;

  const hide = React.useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  }, [progress]);

  const showSignInPrompt = React.useCallback(() => {
    setVisible(true);
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 260,
      mass: 0.8,
    }).start();
  }, [progress]);

  const contextValue = React.useMemo(() => ({ showSignInPrompt }), [showSignInPrompt]);

  const openProfile = () => {
    hide();
    router.push('/profile');
  };

  return (
    <FavoriteSignInContext.Provider value={contextValue}>
      {children}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={hide}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: progress,
              paddingBottom: Math.max(insets.bottom, 18),
            },
          ]}>
          <Pressable accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={hide} />
          <Animated.View
            style={[
              styles.dialog,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: progress,
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [26, 0],
                    }),
                  },
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.dialogHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
                <LogIn size={22} color={colors.primaryForeground} strokeWidth={2.6} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dialog schliessen"
                android_ripple={{ color: colors.secondary, borderless: true }}
                onPress={hide}
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: pressed ? colors.secondary : 'transparent' },
                ]}>
                <X size={20} color={colors.mutedForeground} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.dialogCopy}>
              <Text className="text-xl font-bold text-foreground">Anmeldung erforderlich</Text>
              <Text className="text-muted-foreground text-sm leading-5">
                Melde dich mit deinem Google Konto an, um Clubs und Events in deinen Favoriten zu speichern.
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: colors.secondary }}
                onPress={hide}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  {
                    backgroundColor: pressed ? colors.secondary : colors.background,
                    borderColor: colors.border,
                  },
                ]}>
                <Text className="text-sm font-semibold text-foreground">Abbrechen</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: colors.primary }}
                onPress={openProfile}
                style={({ pressed }) => [
                  styles.primaryAction,
                  {
                    backgroundColor: pressed ? colors.ring : colors.primary,
                  },
                ]}>
                <Text style={{ color: colors.primaryForeground }} className="text-sm font-bold">
                  Zum Profil
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </FavoriteSignInContext.Provider>
  );
}

export function useFavoriteSignInPrompt() {
  const value = useContext(FavoriteSignInContext);

  if (!value) {
    throw new Error('useFavoriteSignInPrompt must be used within FavoriteSignInProvider.');
  }

  return value;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dialog: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 18,
    gap: 18,
    maxWidth: 460,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
    width: '100%',
  },
  dialogCopy: {
    gap: 7,
  },
  dialogHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
});
