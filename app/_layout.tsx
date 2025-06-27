import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import useTheme from "@/hooks/useTheme";
import { PaperProvider } from "react-native-paper";
import ReduxProvider from "../src/store/ReduxProvider";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const customTheme = useTheme();
  const colorScheme = useColorScheme();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GluestackUIProvider mode={colorScheme ?? "light"}>
      <ReduxProvider>
        <PaperProvider theme={customTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: "登录" }} />
            <Stack.Screen name="register" options={{ title: "注册" }} />
            <Stack.Screen name="task" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </ReduxProvider>
    </GluestackUIProvider>
  );
}
