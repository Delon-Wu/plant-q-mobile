import CarouseTip from "@/components/CarouseTip";
import ThemedScrollView from "@/components/ThemedScrollView";
import ThemedText from "@/components/ThemedText";
import WeatherSvg from "@/components/WeatherSvg";
import { useThemeColor } from "@/hooks/useTheme";
import { useUserLocation } from "@/hooks/useUserLocation";
import { createPlant, deletePlant, plantList as getPlantList } from "@/src/api/plant";
import { deleteTask, getTaskList } from "@/src/api/task";
import { getCurrentWeather, getFutureWeather } from "@/src/api/weather";
import { TASK_TYPES } from "@/src/constants/task";
import { RootState } from "@/src/store";
import { DurationType } from "@/src/types/task";
import {
  choosePhoto,
  choosePhotoWeb,
  generatePlantAdvice,
  getFileObject,
  getImageURL,
  getSeasonAdvice,
} from "@/src/utils/common";
import { getNextTaskDate } from "@/src/utils/task";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { useSelector } from "react-redux";
import HumiditySvg from "../../assets/images/humidity.svg";
import TemperatureSvg from "../../assets/images/temperature.svg";
import WindLevelSvg from "../../assets/images/windLevel.svg";

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
  const [advices, setAdvices] = useState<string[]>([]);
  // 植物相关
  const [plantDialogVisible, setPlantDialogVisible] = useState(false);
  const [plantList, setPlantList] = useState<any[]>([]);
  const [plantForm, setPlantForm] = useState<{
    name: string;
    cover: File | string | null;
  }>({ name: "", cover: null });
  const [plantFormLoading, setPlantFormLoading] = useState(false);
  // 植物删除相关
  const [plantDeleteDialogVisible, setPlantDeleteDialogVisible] = useState(false);
  const [deletePlantId, setDeletePlantId] = useState<string | null>(null);
  const [plantDeleteLoading, setPlantDeleteLoading] = useState(false);

  useEffect(() => {
    refreshTasks();
    // 获取植物列表
    getPlantList().then((res) => {
      console.log("plant list res-->", res);
      if (res.status === 200) {
        setPlantList(res.data);
      }
    });
  }, []);

  const refreshTasks = () => {
    setLoading(true);
    getTaskList()
      .then((res) => {
        if (res.data.code === 200) {
          setTasks(res?.data.data || []);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("location-->", location);
    if (location) {
      getWeatherData(
        `${location.coords.latitude}:${location.coords.longitude}`
      );
    } else if (userInfo.position?.latitude && userInfo.position.longitude) {
      getWeatherData(
        `${userInfo.position.latitude}:${userInfo.position.longitude}`
      );
    } else if (process.env.NODE_ENV === "development") {
      // 开发环境使用默认位置
      getWeatherData("深圳");
    }
  }, [location]);

  const getWeatherData = async (location: string) => {
    const weatherRes = await getCurrentWeather({ location });
    const threeDaysWeatherRes = await getFutureWeather({ location });
    setLoading(false);
    if (weatherRes.status === 200) {
      setCurrentWeather(weatherRes.data.results[0]?.now || null);
      setWeatherLocation(weatherRes.data.results[0]?.location); // 获取天气城市名称
    }
    if (threeDaysWeatherRes.status === 200) {
      setThreeDaysWeather(threeDaysWeatherRes.data.results[0]?.daily || null);
      if (threeDaysWeather) {
        const advices = generatePlantAdvice({
          condition: threeDaysWeather[0].text,
          temperature: currentWeather?.temperature,
          humidity: threeDaysWeather[0]?.humidity,
          precipitation: threeDaysWeather[0].precip,
          wind_speed: threeDaysWeather[0].wind_speed,
          forecast: threeDaysWeather.map((day: any) => ({
            condition: day.text_day,
            min_temp: day.low,
            max_temp: day.high,
          })),
          date: new Date(),
        });
        console.log("advices-->", advices);
        setAdvices(advices);
      } else {
        setAdvices(getSeasonAdvice());
      }
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
    refreshTasks();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDialogVisible(false);
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

  const handlePlantCoverChoose = () => {
    if (Platform.OS === "web") {
      choosePhotoWeb().then((imageFile) => {
        setPlantForm((f) => ({ ...f, cover: imageFile }));
      });
    } else {
      choosePhoto((uri) => {
        setPlantForm((f) => ({ ...f, cover: getFileObject(uri) }));
      });
    }
  };

  const submitPlant = async () => {
    setPlantFormLoading(true);
    try {
      await createPlant({
        name: plantForm.name,
        cover: plantForm.cover!,
      });
      // 刷新列表
      const res = await getPlantList();
      if (res.status === 200) setPlantList(res.data);
      setPlantDialogVisible(false);
      setPlantForm({ name: "", cover: null });
    } catch {
      alert("创建失败");
    } finally {
      setPlantFormLoading(false);
    }
  };

  const handlePlantLongPress = (plantId: string) => {
    setDeletePlantId(plantId);
    setPlantDeleteDialogVisible(true);
  };

  const handlePlantDelete = async () => {
    if (!deletePlantId) return;
    setPlantDeleteDialogVisible(false);
    setPlantDeleteLoading(true);
    try {
      await deletePlant(deletePlantId);
      // 刷新列表
      const res = await getPlantList();
      if (res.status === 200) setPlantList(res.data);
    } catch {
      alert("删除失败");
    } finally {
      setPlantDeleteLoading(false);
      setDeletePlantId(null);
    }
  };

  return (
    <>
      <ThemedScrollView>
        {/* TODO: 结合最近天气显示对应养护提示 */}
        {/* TODO: 升级当前天气信息API之后，使用更准确的天气信息，避免使用天气预报的天气数据 */}
        <Card style={{ backgroundColor: colors.primary, minHeight: 200 }}>
          <Card.Content>
            {currentWeather && (
              <View style={{ marginBottom: 14 }}>
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
                      {currentWeather.text}{" "}
                      {Number(threeDaysWeather[0].precip) > 0
                        ? ` 今日${(
                            Math.round(
                              Number(threeDaysWeather[0].precip) * 10000
                            ) / 100
                          ).toFixed(2)}%概率下雨`
                        : ""}
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
                        {threeDaysWeather[0].low}°C / {threeDaysWeather[0].high}
                        °C
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
            <Text variant="titleMedium" style={{ color: colors.onPrimary }}>
              养护小贴士：
            </Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <CarouseTip
                tips={advices}
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
                      {getTaskTypeLabel(task.task_type)} - {plantList.find(plant => plant.id.toString() === task.plant)?.name || "植物已删除"}
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            <ThemedText type="subtitle" style={{ flex: 1 }}>
              我的植物
            </ThemedText>
            <TouchableOpacity onPress={() => setPlantDialogVisible(true)}>
              <Ionicons name="add" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {plantList.length === 0 ? (
              <ThemedText>暂无植物</ThemedText>
            ) : (
              plantList.map((plant) => (
                <Card
                  key={plant.id}
                  style={{ width: "48%", marginBottom: 12 }}
                  onPress={() => router.push(`/plant/${plant.id}` as any)}
                  onLongPress={() => handlePlantLongPress(plant.id)}
                >
                  <Card.Cover
                    source={{ uri: getImageURL(plant.cover) }}
                    style={{ height: 100 }}
                  />
                  <Card.Content>
                    <Text variant="titleMedium">{plant.name}</Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      {formatDate(plant.created_at)}
                    </Text>
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
        {/* 新增植物弹窗 */}
        <Dialog
          visible={plantDialogVisible}
          onDismiss={() => setPlantDialogVisible(false)}
        >
          <Dialog.Title>新增植物</Dialog.Title>
          <Dialog.Content>
            <Text>请输入植物名称和封面图片：</Text>
            <View style={{ marginTop: 12 }}>
              <ThemedText>植物名称</ThemedText>
              <TextInput
                value={plantForm.name}
                onChangeText={(text) =>
                  setPlantForm((f) => ({ ...f, name: text }))
                }
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  marginTop: 6,
                  marginBottom: 12,
                }}
                placeholder="请输入名称"
              />
              <ThemedText>植物封面</ThemedText>
              <Button
                style={{ marginVertical: 6 }}
                mode="outlined"
                onPress={handlePlantCoverChoose}
              >
                {plantForm.cover ? "已选择图片" : "选择图片"}
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlantDialogVisible(false)}>取消</Button>
            <Button
              loading={plantFormLoading}
              disabled={!plantForm.name || !plantForm.cover}
              onPress={submitPlant}
            >
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* 删除植物确认弹窗 */}
        <Dialog
          visible={plantDeleteDialogVisible}
          onDismiss={() => setPlantDeleteDialogVisible(false)}
        >
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除该植物吗？此操作不可恢复。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlantDeleteDialogVisible(false)}>取消</Button>
            <Button 
              textColor={colors.error} 
              loading={plantDeleteLoading}
              onPress={handlePlantDelete}
            >
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
