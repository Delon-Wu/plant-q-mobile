/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
export function useThemeColor() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
}

export default function useTheme() {
  const theme = useColorScheme() ?? 'light';
  const paperTheme = theme === 'light' ? { ...MD3LightTheme, colors: Colors[theme] } : { ...MD3DarkTheme, colors: Colors[theme] };
  return paperTheme;
}
