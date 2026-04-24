import { MoonStar } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <ScreenShell title="Einstellungen">
      <View className="gap-3">
        <Card className="rounded-[22px] py-0">
          <CardContent className="gap-4 px-4 py-4">
            <View className="flex-row items-center gap-2">
              <MoonStar size={18} color={theme.primary} />
              <Text className="text-base font-semibold">Farbschema</Text>
            </View>
            <ThemeModeToggle />
          </CardContent>
        </Card>
      </View>
    </ScreenShell>
  );
}
