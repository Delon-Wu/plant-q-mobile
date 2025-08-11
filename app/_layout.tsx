import ErrorBoundary from "@/components/ErrorBoundary";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import useTheme from "@/hooks/useTheme";
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, SafeAreaView, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import ReduxProvider from "../src/store/ReduxProvider";

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const customTheme = useTheme();
  const colorScheme = useColorScheme();

  // 处理字体加载错误
  if (error) {
    console.warn('Font loading error:', error);
  }

  // 在生产环境中，即使字体未加载也继续渲染
  if (!loaded && __DEV__) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GluestackUIProvider mode={colorScheme ?? "light"}>
        <ReduxProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: customTheme.colors.background,
              paddingTop:
                Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
            }}
          >
            <PaperProvider theme={customTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="login"
                  options={{
                    title: "登录",
                    headerStyle: { backgroundColor: customTheme.colors.background },
                    headerTitleStyle: { color: customTheme.colors.text },
                  }}
                />
                <Stack.Screen
                  name="register"
                options={{
                  title: "注册",
                  headerStyle: { backgroundColor: customTheme.colors.background },
                  headerTitleStyle: { color: customTheme.colors.text },
                }}
              />
              <Stack.Screen name="task" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </PaperProvider>
        </SafeAreaView>
      </ReduxProvider>
    </GluestackUIProvider>
    </ErrorBoundary>
  );
}
