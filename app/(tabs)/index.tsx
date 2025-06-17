import ThemeScrollView from "@/components/ThemeScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ThemeScrollView>
      <ThemedView>
        <ThemedText>首页</ThemedText>
      </ThemedView>
    </ThemeScrollView>
  );
}
