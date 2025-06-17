import ThemeScrollView from "@/components/ThemeScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  // TODO: 完成点击十次屏幕跳转到设置后端地址
  return (
    <ThemeScrollView>
      <ThemedView>
        <ThemedText>首页</ThemedText>
      </ThemedView>
    </ThemeScrollView>
  );
}
