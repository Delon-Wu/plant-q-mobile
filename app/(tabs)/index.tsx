import { ThemedText } from "@/components/ThemedText";
import ThemeScrollView from "@/components/ThemeScrollView";
import { useThemeColor } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, FAB, ProgressBar, Text } from "react-native-paper";

const Information = {
  0: "快开始今天的任务吧！",
  25: "很棒，你开始了今天的任务！",
  50: "继续努力，你已经完成了一半的任务！",
  75: "太棒了，你即将完成所有的任务！",
  100: "恭喜你，你已经完成了所有的任务！",
  default: "快开始今天的任务吧！",
};
export default function HomeScreen() {
  const colors = useThemeColor();
  const progress = 50; // 假设这是从某个状态管理或API获取的任务进度
  return (
    <ThemeScrollView>
      {/* TODO: 获取所在位置 */}
      {/* TODO: 获取天气信息 */}
      {/* TODO: 结合最近天气显示对应养护提示 */}
      <Card>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ color: colors.primary, marginBottom: 10 }}
          >
            {Information[progress]}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: colors.text, marginBottom: 20 }}
          >
            今天的任务进度：{progress}%
          </Text>
          <ProgressBar progress={0.5} color={colors.secondary} />
        </Card.Content>
      </Card>

      {/* TODO: 没有目标时显示占位图 */}
      <ThemedText type="subtitle">进行中的目标</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10, paddingHorizontal: 5, flexGrow: 0 }}
      >
        <View style={{ flexDirection: "row" }}>
          <Card style={styles.goalCard}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ color: colors.colorGroup[0], marginBottom: 10 }}
              >
                目标1
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                目标进度：{progress}%
              </Text>
              <ProgressBar progress={0.5} color={colors.colorGroup[0]} />
            </Card.Content>
          </Card>
          <Card style={styles.goalCard}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ color: colors.colorGroup[1], marginBottom: 10 }}
              >
                目标2
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                目标进度：{progress}%
              </Text>
              <ProgressBar progress={0.7} color={colors.colorGroup[1]} />
            </Card.Content>
          </Card>
          <Card style={styles.goalCard}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ color: colors.colorGroup[2], marginBottom: 10 }}
              >
                目标3
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                目标进度：{progress}%
              </Text>
              <ProgressBar progress={0.3} color={colors.colorGroup[2]} />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/project/createProject" as any)}
      />
    </ThemeScrollView>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    width: 250,
    marginRight: 20,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    zIndex: 10,
  },
});
