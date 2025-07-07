import ThemedScrollView from "@/components/ThemedScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useTheme";
import { getTaskList } from "@/src/api/task";
import { TASK_TYPES } from "@/src/constants/task";
import { DurationType } from "@/src/types/task";
import { getNextTaskDate } from "@/src/utils/task";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, FAB, Text } from "react-native-paper";

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
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const progress = 50; // TODO: 进度可根据任务完成度计算

  useEffect(() => {
    setLoading(true);
    getTaskList()
      .then((res) => {
        if (res.data.code === 200) {
          setTasks(res?.data.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 获取任务类型label
  const getTaskTypeLabel = (type: string) => {
    return TASK_TYPES.find((t) => t.value === type)?.label || type;
  };

  // 获取持续类型label
  const getDurationTypeLabel = (type: string) => {
    switch (type) {
      case DurationType.stage:
        return "阶段型";
      case DurationType.continuous:
        return "持续型";
      case DurationType.once:
        return "单次";
      default:
        return type;
    }
  };

  // 格式化时间
  const formatDate = (date: string | number | Date | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <ThemedScrollView>
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
        </Card.Content>
      </Card>

      {/* TODO: 没有任务时显示占位图 */}
      <ThemedText type="subtitle">进行中的任务</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 5, flexGrow: 0 }}
      >
        <View style={{ flexDirection: "row" }}>
          {loading ? (
            <Text>加载中...</Text>
          ) : tasks.length === 0 ? (
            <Text>暂无任务</Text>
          ) : (
            tasks.map((task, idx) => (
              <Card style={styles.goalCard} key={task.id || idx}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {getTaskTypeLabel(task.task_type)} - {task.plant}
                  </Text>
                  <Text style={styles[task.duration_type as DurationType]}>
                    {getDurationTypeLabel(task.duration_type)}
                  </Text>
                  {task.duration_type === DurationType.stage && (
                    <>
                      <ThemedText style={{ marginBottom: 2 }}>
                        <Ionicons name="calendar" size={16} color={colors.secondary} />
                        {formatDate(task.start_time)} -{" "}
                        {formatDate(task.end_time)}
                      </ThemedText>
                      <ThemedText style={{ marginBottom: 2 }}>
                        请于
                        <ThemedText style={styles.dateInline}>
                          <Ionicons name="calendar" size={16} color={colors.secondary} />
                          {formatDate(
                            getNextTaskDate(
                              task.interval_days,
                              task.duration_type as DurationType,
                              new Date(task.start_time),
                              new Date(task.time_at_once)
                            ) || ""
                          )}
                        </ThemedText>
                        执行一次
                      </ThemedText>
                    </>
                  )}
                  {task.duration_type === DurationType.continuous && (
                    <ThemedText style={{ marginBottom: 2 }}>
                      请于
                      <ThemedText style={styles.dateInline}>
                        <Ionicons name="calendar" size={16} color={colors.secondary} />
                        {formatDate(
                          getNextTaskDate(
                            task.interval_days,
                            task.duration_type,
                            null,
                            new Date(task.time_at_once)
                          ) || ""
                        )}
                      </ThemedText>
                      执行一次
                    </ThemedText>
                  )}
                  {task.duration_type === DurationType.once && (
                    <ThemedText style={{ marginBottom: 2 }}>
                      请于
                      <ThemedText
                        style={styles.dateInline}
                      >
                        <Ionicons name="calendar" size={16} color={colors.secondary} />
                        {formatDate(task.time_at_once)}
                      </ThemedText>
                      完成任务
                    </ThemedText>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/task/createTask" as any)}
      />
    </ThemedScrollView>
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
  [DurationType.stage]: {
    color: "#9ac5e5",
  },
  [DurationType.continuous]: {
    color: "#4fb19d",
  },
  [DurationType.once]: {
    color: "#edce7a",
  },
  dateInline: {
    fontWeight: "bold",
    marginHorizontal: 2
  },
  tag: {
    color: "#c98c9a",
    backgroundColor: "#c98c9a22",
    alignSelf: "flex-start",
    borderRadius: 8,
    marginBottom: 2,
    marginRight: 4
  }
});
