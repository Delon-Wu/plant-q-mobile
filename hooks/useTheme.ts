/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';
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
