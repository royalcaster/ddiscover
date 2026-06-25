import { useRouter } from 'expo-router';
import { LogIn, X } from 'lucide-react-native';
import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { Animated, Modal, Pressable, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/providers/theme-provider';

type FavoriteSignInContextValue = {
  showSignInPrompt: () => void;
};

const FavoriteSignInContext = createContext<FavoriteSignInContextValue | null>(null);

const MODAL_COLORS = {
  light: {
    card: '#ffffff',
    border: 'rgba(17,17,17,0.12)',
    foreground: '#111111',
    muted: '#66615a',
    secondary: '#f2f2f2',
    primary: '#f4d64d',
    primaryForeground: '#111111',
    ripple: 'rgba(0,0,0,0.08)',
    primaryRipple: 'rgba(0,0,0,0.12)',
  },
  dark: {
    card: '#151512',
    border: 'rgba(255,255,255,0.14)',
    foreground: '#f5f0df',
    muted: '#b4ada3',
    secondary: '#24231f',
    primary: '#f4d64d',
    primaryForeground: '#111111',
    ripple: 'rgba(255,255,255,0.12)',
    primaryRipple: 'rgba(0,0,0,0.14)',
  },
} as const;

export function FavoriteSignInProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { resolvedTheme } = useAppTheme();
  const modalColors = MODAL_COLORS[resolvedTheme];
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
                backgroundColor: modalColors.card,
                borderColor: modalColors.border,
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
              <View style={[styles.iconBadge, { backgroundColor: modalColors.primary }]}>
                <LogIn size={22} color={modalColors.primaryForeground} strokeWidth={2.6} />
              </View>
              <View style={styles.closeClip}>
                <TouchableNativeFeedback
                  accessibilityRole="button"
                  accessibilityLabel="Dialog schließen"
                  background={TouchableNativeFeedback.Ripple(modalColors.ripple, true)}
                  onPress={hide}
                  useForeground>
                  <View style={styles.closeButton}>
                    <X size={20} color={modalColors.muted} strokeWidth={2.4} />
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>

            <View style={styles.dialogCopy}>
              <Text style={{ color: modalColors.foreground }} className="text-xl font-bold">
                Anmeldung erforderlich
              </Text>
              <Text style={{ color: modalColors.muted }} className="text-sm leading-5">
                Melde dich mit deinem Google Konto an, um Clubs und Events in deinen Favoriten zu speichern.
              </Text>
            </View>

            <View style={styles.actions}>
              <View
                style={[
                  styles.secondaryAction,
                  {
                    backgroundColor: modalColors.secondary,
                    borderColor: modalColors.border,
                  },
                ]}>
                <TouchableNativeFeedback
                  accessibilityRole="button"
                  background={TouchableNativeFeedback.Ripple(modalColors.ripple, false)}
                  onPress={hide}
                  useForeground>
                  <View style={styles.actionContent}>
                    <Text style={{ color: modalColors.foreground }} className="text-sm font-semibold">
                      Abbrechen
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              </View>

              <View style={[styles.primaryAction, { backgroundColor: modalColors.primary }]}>
                <TouchableNativeFeedback
                  accessibilityRole="button"
                  background={TouchableNativeFeedback.Ripple(modalColors.primaryRipple, false)}
                  onPress={openProfile}
                  useForeground>
                  <View style={styles.actionContent}>
                    <Text style={{ color: modalColors.primaryForeground }} className="text-sm font-bold">
                      Zum Profil
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
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
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeClip: {
    borderRadius: 18,
    height: 36,
    overflow: 'hidden',
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
    borderRadius: 16,
    flex: 1,
    height: 48,
    overflow: 'hidden',
  },
  secondaryAction: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    height: 48,
    overflow: 'hidden',
  },
  actionContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
