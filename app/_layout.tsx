import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import useTheme from '@/hooks/useTheme';
import {
  PaperProvider,
} from 'react-native-paper';
import ReduxProvider from '../src/store/ReduxProvider';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const customTheme = useTheme();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ReduxProvider>
      <PaperProvider theme={customTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: '登录' }} />
          <Stack.Screen name="register" options={{ title: '注册' }} />
          <Stack.Screen name="project" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </ReduxProvider>
  );
}
