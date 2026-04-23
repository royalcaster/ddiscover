import { useAppTheme } from '@/providers/theme-provider';

export function useTheme() {
  return useAppTheme().colors;
}
