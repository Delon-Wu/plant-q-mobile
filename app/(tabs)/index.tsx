import ScrollView from "@/components/ScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ScrollView>
      <ThemedView>
        <ThemedText>首页</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}
