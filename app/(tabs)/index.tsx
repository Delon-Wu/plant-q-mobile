import CarouseTip from "@/components/CarouseTip";
import ThemedScrollView from "@/components/ThemedScrollView";
import ThemedText from "@/components/ThemedText";
import WeatherSvg from "@/components/WeatherSvg";
import { useThemeColor } from "@/hooks/useTheme";
import { useUserLocation } from "@/hooks/useUserLocation";
import { deleteTask, getTaskList } from "@/src/api/task";
import { getCurrentWeather, getFutureWeather } from "@/src/api/weather";
import { TASK_TYPES } from "@/src/constants/task";
import { RootState } from "@/src/store";
import { DurationType } from "@/src/types/task";
import { isDaytime } from "@/src/utils/common";
import { getNextTaskDate } from "@/src/utils/task";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, FAB, Portal, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import HumiditySvg from "../../assets/images/humidity.svg";
import TemperatureSvg from "../../assets/images/temperature.svg";
import WindLevelSvg from "../../assets/images/windLevel.svg";

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
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [threeDaysWeather, setThreeDaysWeather] = useState<any>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [weatherLocation, setWeatherLocation] = useState<any>(null);
  const { location } = useUserLocation();
  const userInfo = useSelector((state: RootState) => state.user);
  const isDaytimeNow = isDaytime();
  const tips = [
    "hello world!",
    "定期给植物浇水，保持土壤湿润",
    "选择适合的土壤和肥料",
    "确保植物获得充足的阳光",
    "定期修剪枯萎的叶子",
    "注意观察害虫和疾病",
  ];

  useEffect(() => {
    getTaskList()
      .then((res) => {
        if (res.data.code === 200) {
          setTasks(res?.data.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log("location-->", location);
    if (location) {
      _getFutureWeather(
        `${location.coords.latitude}:${location.coords.longitude}`
      );
    } else if (userInfo.position.latitude && userInfo.position.longitude) {
      _getFutureWeather(
        `${userInfo.position.latitude}:${userInfo.position.longitude}`
      );
    } else if (process.env.NODE_ENV === "development") {
      // 开发环境使用默认位置
      _getFutureWeather("深圳");
    }
  }, [location, userInfo.position.latitude, userInfo.position.longitude]);

  const _getFutureWeather = async (location: string) => {
    setLoading(true);
    const weatherRes = await getCurrentWeather({ location });
    const threeDaysWeatherRes = await getFutureWeather({ location });
    setLoading(false);
    if (weatherRes.status === 200) {
      setCurrentWeather(weatherRes.data.results[0]?.now || null);
      setWeatherLocation(weatherRes.data.results[0]?.location); // 获取天气城市名称
    }
    if (threeDaysWeatherRes.status === 200) {
      setThreeDaysWeather(threeDaysWeatherRes.data.results[0]?.daily || null);
    }
  };

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

  const handleLongPress = (id: string | number) => {
    setDeleteId(String(id));
    setDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDialogVisible(false);
    setLoading(true);
    try {
      await deleteTask(deleteId);
      setTasks((prev) => prev.filter((t) => t.id !== deleteId));
    } catch {
      // 可选：弹出错误提示
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <ThemedScrollView>
        {/* TODO: 结合最近天气显示对应养护提示 */}
        {/* TODO: 升级当前天气信息API之后，使用更准确的天气信息，避免使用天气预报的天气数据 */}
        <Card style={{ backgroundColor: colors.primary }}>
          <Card.Content>
            {currentWeather && (
              <View>
                <WeatherSvg
                  code={currentWeather.code}
                  width={130}
                  height={130}
                  style={styles.weatherIcon}
                />
                <View style={{ marginLeft: 130 }}>
                  <Text
                    variant="headlineMedium"
                    style={{ color: colors.onPrimary }}
                  >
                    {weatherLocation?.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Text
                      style={{ marginRight: 4, color: colors.onPrimary }}
                      variant="bodySmall"
                    >
                      {currentWeather.text} {Number(threeDaysWeather[0].precip) > 0 ? ` 今日${Number(threeDaysWeather[0].precip) * 100}%概率下雨` : ""}
                    </Text>
                    <View style={styles.parameter}>
                      <TemperatureSvg width={16} height={16} />
                      <Text
                        variant="bodySmall"
                        style={{ color: colors.onPrimary }}
                      >
                        {currentWeather.temperature}°C{" "}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: colors.onPrimary }}
                      >
                        {threeDaysWeather[0].low}°C /{" "}
                        {threeDaysWeather[0].high}°C
                      </Text>
                    </View>
                    <View style={styles.parameter}>
                      <HumiditySvg width={12} height={12} />
                      <Text
                        variant="bodySmall"
                        style={{ color: colors.onPrimary }}
                      >
                        {threeDaysWeather[0].humidity}%
                      </Text>
                    </View>
                    {threeDaysWeather[0].wind_scale > 4 && (
                      <View style={styles.parameter}>
                        <WindLevelSvg width={12} height={12} />
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.onPrimary }}
                        >
                          {threeDaysWeather[0].wind_scale} 级
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <CarouseTip
                tips={tips}
                textStyle={{ color: colors.onPrimary, fontSize: 16 }}
                duration={8000}
                animationDuration={500}
                animationType="slideUp"
              />
            </View>
          </Card.Content>
        </Card>

        {/* TODO: 没有任务时显示占位图 */}
        <ThemedText type="subtitle">进行中的任务</ThemedText>
        <ScrollView style={{ paddingHorizontal: 5 }}>
          <View style={{ flexDirection: "column" }}>
            {loading ? (
              <Text>加载中...</Text>
            ) : tasks.length === 0 ? (
              <Text>暂无任务</Text>
            ) : (
              tasks.map((task, idx) => (
                <Card
                  style={styles.goalCard}
                  key={task.id || idx}
                  onPress={() =>
                    router.push(`/task/taskDetail/${task.id}` as any)
                  }
                  onLongPress={() => handleLongPress(task.id)}
                >
                  <Card.Content>
                    <Text
                      variant="titleMedium"
                      style={{ color: colors.primary }}
                    >
                      {getTaskTypeLabel(task.task_type)} - {task.plant}
                    </Text>
                    <View>
                      <Text style={styles[task.duration_type as DurationType]}>
                        {getDurationTypeLabel(task.duration_type)}
                        {task.duration_type === DurationType.stage && (
                          <ThemedText className="ml-2">
                            <Ionicons
                              name="calendar"
                              size={16}
                              color={colors.secondary}
                            />
                            {formatDate(task.start_time)} -{" "}
                            {formatDate(task.end_time)}
                          </ThemedText>
                        )}
                      </Text>
                      {task.duration_type === DurationType.once ? (
                        <ThemedText style={{ marginBottom: 2 }}>
                          请于
                          <ThemedText style={styles.dateInline}>
                            <Ionicons
                              name="calendar"
                              size={16}
                              color={colors.secondary}
                            />
                            {formatDate(task.time_at_once)}
                          </ThemedText>
                          完成任务
                        </ThemedText>
                      ) : (
                        <>
                          <ThemedText style={{ marginVertical: 2 }}>
                            请于
                            <ThemedText style={styles.dateInline}>
                              <Ionicons
                                name="calendar"
                                size={16}
                                color={colors.secondary}
                              />
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
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </ThemedScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/task/createTask" as any)}
      />
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除该任务吗？此操作不可恢复。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button textColor={colors.error} onPress={handleDelete}>
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    width: "100%",
    marginBottom: 20,
  },
  weatherIcon: {
    position: "absolute",
    top: -60,
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
    marginHorizontal: 2,
  },
  tag: {
    color: "#c98c9a",
    backgroundColor: "#c98c9a22",
    alignSelf: "flex-start",
    borderRadius: 8,
    marginBottom: 2,
    marginRight: 4,
  },
  parameter: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
});
