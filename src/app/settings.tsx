import { Languages, MoonStar } from 'lucide-react-native';
import { View } from 'react-native';

import { LanguageToggle } from '@/components/language-toggle';
import { ScreenShell } from '@/components/screen-shell';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/providers/language-provider';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <ScreenShell title={t('profile.settingsTitle')}>
      <View className="gap-3">
        <Card className="rounded-[22px] py-0">
          <CardContent className="gap-4 px-4 py-4">
            <View className="flex-row items-center gap-2">
              <Languages size={18} color={theme.foreground} />
              <Text className="text-base font-semibold">{t('language.label')}</Text>
            </View>
            <LanguageToggle />
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0">
          <CardContent className="gap-4 px-4 py-4">
            <View className="flex-row items-center gap-2">
              <MoonStar size={18} color={theme.foreground} />
              <Text className="text-base font-semibold">{t('theme.label')}</Text>
            </View>
            <ThemeModeToggle />
          </CardContent>
        </Card>
      </View>
    </ScreenShell>
  );
}
