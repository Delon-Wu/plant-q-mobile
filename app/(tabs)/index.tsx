import CarouseTip from "@/components/CarouseTip";
import ThemedScrollView from "@/components/ThemedScrollView";
import ThemedText from "@/components/ThemedText";
import WeatherSvg from "@/components/WeatherSvg";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useThemeColor } from "@/hooks/useTheme";
import {
  createPlant,
  deletePlant,
  plantList as getPlantList,
} from "@/src/api/plant";
import { deleteTask, getTaskList } from "@/src/api/task";
import { getCurrentWeather, getFutureWeather } from "@/src/api/weather";
import { TASK_TYPES } from "@/src/constants/task";
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
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  RefreshControl,
  StyleSheet,
  ToastAndroid,
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
import HumiditySvg from "../../assets/images/humidity.svg";
import TemperatureSvg from "../../assets/images/temperature.svg";
import WindLevelSvg from "../../assets/images/windLevel.svg";

export default function HomeScreen() {
  const backPressCount = useRef(0);
  const colors = useThemeColor();
  const locationManager = useLocationManager();
  const isInitialized = useRef(false); // 添加初始化标记
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [threeDaysWeather, setThreeDaysWeather] = useState<any>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [weatherLocation, setWeatherLocation] = useState<any>(null);
  const [advices, setAdvices] = useState<string[]>([]);
  const [weatherRefreshDialogVisible, setWeatherRefreshDialogVisible] =
    useState(false);
  // 植物相关
  const [plantDialogVisible, setPlantDialogVisible] = useState(false);
  const [plantList, setPlantList] = useState<any[]>([]);
  const [plantForm, setPlantForm] = useState<{
    name: string;
    description: string;
    cover: File | string | null;
  }>({ name: "", cover: null, description: "" });
  const [plantFormLoading, setPlantFormLoading] = useState(false);
  // 植物删除相关
  const [plantDeleteDialogVisible, setPlantDeleteDialogVisible] =
    useState(false);
  const [deletePlantId, setDeletePlantId] = useState<string | null>(null);
  const [plantDeleteLoading, setPlantDeleteLoading] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

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

  const refreshPlantList = () => {
    // 获取植物列表
    getPlantList().then((res) => {
      console.log("plant list res-->", res);
      if (res.status === 200) {
        setPlantList(res.data);
      }
    });
  };

  const refresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refreshTasks(), refreshPlantList()]).finally(() => {
      setRefreshing(false);
    });
  }, []);

  // 使用 useFocusEffect 代替 useEffect，确保从其他页面返回时重新刷新数据
  useFocusEffect(
    useCallback(() => {
      // 监听物理返回键
      const onBackPress = () => {
        backPressCount.current += 1;
        if (backPressCount.current === 2) {
          BackHandler.exitApp();
          backPressCount.current = 0;
          return true;
        } else {
          ToastAndroid.show("再按一次返回键退出应用", ToastAndroid.SHORT);
          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);
          return true;
        }
      };
      const backHandlerSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => {
        backHandlerSubscription.remove();
      };
    }, [])
  );

  // 获取位置并刷新天气
  const loadWeatherData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const location = await locationManager.getUserLocation(forceRefresh);

        // 直接在这里获取天气数据，避免依赖循环
        const weatherRes = await getCurrentWeather({ location });
        const threeDaysWeatherRes = await getFutureWeather({ location });

        if (weatherRes.status === 200) {
          setCurrentWeather(weatherRes.data.results[0]?.now || null);
          setWeatherLocation(weatherRes.data.results[0]?.location);
        }

        if (threeDaysWeatherRes.status === 200) {
          const dailyWeather =
            threeDaysWeatherRes.data.results[0]?.daily || null;
          setThreeDaysWeather(dailyWeather);

          if (dailyWeather && weatherRes.data.results[0]?.now) {
            const advices = generatePlantAdvice({
              condition: dailyWeather[0].text_day,
              temperature: Number(weatherRes.data.results[0].now.temperature),
              humidity: Number(dailyWeather[0]?.humidity),
              precipitation: Number(dailyWeather[0].precip),
              wind_speed: Number(dailyWeather[0].wind_speed),
              forecast: dailyWeather.map((day: any) => ({
                condition: day.text_day,
                min_temp: Number(day.low),
                max_temp: Number(day.high),
              })),
              date: new Date(),
            });
            console.log("advices-->", advices);
            setAdvices(advices);
          } else {
            setAdvices(getSeasonAdvice());
          }
        }
      } catch (error) {
        console.error("Failed to load weather data:", error);
        setAdvices(getSeasonAdvice());
      } finally {
        setLoading(false);
      }
    },
    [locationManager]
  );

  // 处理天气卡片长按
  const handleWeatherLongPress = () => {
    setWeatherRefreshDialogVisible(true);
  };

  // 确认刷新天气
  const handleRefreshWeather = async () => {
    setWeatherRefreshDialogVisible(false);
    await loadWeatherData(true); // 强制刷新位置和天气
  };

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      refresh();
      // 只在初始化时调用一次
      loadWeatherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时执行一次

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
        description: plantForm.description,
        cover: plantForm.cover!,
      });
      // 刷新列表
      const res = await getPlantList();
      if (res.status === 200) setPlantList(res.data);
      setPlantDialogVisible(false);
      setPlantForm({ name: "", cover: null, description: "" });
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
      <ThemedScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* TODO: 升级当前天气信息API之后，使用更准确的天气信息，避免使用天气预报的天气数据 */}
        <Card
          style={{ backgroundColor: colors.primary, minHeight: 200 }}
          onLongPress={handleWeatherLongPress}
        >
          <Card.Content>
            {currentWeather ? (
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
              </View>
            ) : (
              <Text style={{ color: colors.onPrimary }}>天气数据加载中...</Text>
            )}
          </Card.Content>
        </Card>

        <ThemedText type="subtitle">进行中的任务</ThemedText>
        <View
          style={{ paddingTop: 5, paddingBottom: 24 }}
        >
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
                      {getTaskTypeLabel(task.task_type)} -{" "}
                      {plantList.find(
                        (plant) => plant.id.toString() === task.plant
                      )?.name || "无目标植物"}
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

          <ThemedText
            type="subtitle"
            style={{ marginTop: 24, marginBottom: 8 }}
          >
            我的植物
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 100 }}>
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
        </View>
      </ThemedScrollView>
      <FAB.Group
        icon="menu"
        visible
        open={fabOpen}
        style={styles.fabContainer}
        fabStyle={styles.fab}
        actions={[
          {
            icon: ({ color, size }) => (
              <Ionicons
                name="checkmark-circle-outline"
                size={size}
                color={color}
              />
            ),
            label: "新建任务",
            onPress: () => router.push("/task/createTask" as any),
          },
          {
            icon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
            label: "新增植物",
            onPress: () => setPlantDialogVisible(true),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
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
              <ThemedText>描述</ThemedText>
              <TextInput
                value={plantForm.description}
                onChangeText={(text) =>
                  setPlantForm((f) => ({ ...f, description: text }))
                }
                multiline
                numberOfLines={3}
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  marginTop: 6,
                  marginBottom: 12,
                }}
                placeholder="请输入描述"
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
            <Button onPress={() => setPlantDeleteDialogVisible(false)}>
              取消
            </Button>
            <Button
              textColor={colors.error}
              loading={plantDeleteLoading}
              onPress={handlePlantDelete}
            >
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* 刷新天气确认弹窗 */}
        <Dialog
          visible={weatherRefreshDialogVisible}
          onDismiss={() => setWeatherRefreshDialogVisible(false)}
        >
          <Dialog.Title>刷新天气信息</Dialog.Title>
          <Dialog.Content>
            <Text>是否重新获取当前位置并刷新天气信息？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setWeatherRefreshDialogVisible(false)}>
              取消
            </Button>
            <Button onPress={handleRefreshWeather}>刷新</Button>
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
  fabContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  fab: {
    marginRight: 24,
    marginBottom: 64,
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
