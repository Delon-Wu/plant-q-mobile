import { store } from "@/src/store";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { PLANT_CARE_RULES } from "../constants/common";
import { AdviceItem, ForecastDay, PlantRule, PlantType, Season, WeatherData } from "../types/common";

/**
 * 根据时间计算当前季节
 * @param date Date对象或时间戳戳（毫秒）
 * @returns 季节名称：spring, summer, autumn, winter
 */
export function getCurrentSeason(date: Date | number): Season {
  const month = date instanceof Date ? date.getMonth() : new Date(date).getMonth(); // 0-11，0代表一月
  // 北半球季节划分
  if (month >= 3 && month < 6) return Season.spring;    // 春季：3-5月
  if (month >= 6 && month < 9) return Season.summer;   // 夏季：6-8月
  if (month >= 9 && month < 11) return Season.autumn;  // 秋季：9-10月
  return Season.winter;                              // 冬季：11-2月
}

/**
 * 判断当前是白天还是黑夜
 * @param date Date对象或时间戳（毫秒），默认为当前时间
 * @returns 布尔值，true表示白天，false表示黑夜
 */
export function isDaytime(date?: Date | number): boolean {
  const targetDate = date ? (date instanceof Date ? date : new Date(date)) : new Date();
  const hours = targetDate.getHours();

  // 通常定义：6:00-18:00为白天，18:00-6:00为黑夜
  return hours >= 6 && hours < 18;
}

/**
 * 获取当前时间段描述
 * @param date Date对象或时间戳（毫秒），默认为当前时间
 * @returns 时间段描述：dawn(黎明), morning(上午), noon(中午), afternoon(下午), evening(傍晚), night(夜晚)
 */
export function getTimeOfDay(date?: Date | number): 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' {
  const targetDate = date ? (date instanceof Date ? date : new Date(date)) : new Date();
  const hours = targetDate.getHours();

  if (hours >= 5 && hours < 6) return 'dawn';        // 黎明：5-6点
  if (hours >= 6 && hours < 12) return 'morning';    // 上午：6-12点
  if (hours >= 12 && hours < 13) return 'noon';      // 中午：12-13点
  if (hours >= 13 && hours < 18) return 'afternoon'; // 下午：13-18点
  if (hours >= 18 && hours < 20) return 'evening';   // 傍晚：18-20点
  return 'night';                                     // 夜晚：20-5点
}



/**
 * 根据天气数据和植物类型生成养护建议
 * @param weather_data 包含天气信息的对象
 * @param plant_type 植物类型名称（可选，如果未提供则遍历所有植物类型）
 * @returns 按优先级排序的养护建议列表
 */
export function generatePlantAdvice(weather_data: WeatherData, plant_type?: string): string[] {
  // 默认遍历所有植物类型
  const advice_result: string[] = [];
  const current_season = getCurrentSeason(weather_data.date);
  const sunny_days = countSunnyDays(weather_data.forecast);
  const temp = weather_data.temperature;
  const humidity = weather_data.humidity;
  const precipitation = weather_data.precipitation;
  const soil_moisture = weather_data.soil_moisture || 0;
  const uv_index = weather_data.uv_index;

  for (const plant_rule of PLANT_CARE_RULES) {
    const advice_list: AdviceItem[] = [];
    // 温度规则
    for (const rule of plant_rule.care_rules.temperature || []) {
      if (rule.condition({ temp, min_temp: plant_rule.tolerance_limits.min_temp, max_temp: plant_rule.tolerance_limits.max_temp })) {
        advice_list.push({ advice: rule.advice, priority: rule.priority, type: "temperature" });
      }
    }
    // 湿度规则
    for (const rule of plant_rule.care_rules.humidity || []) {
      if (rule.condition({ humidity, min_humidity: plant_rule.tolerance_limits.min_humidity, max_humidity: plant_rule.tolerance_limits.max_humidity })) {
        advice_list.push({ advice: rule.advice, priority: rule.priority || 3, type: "humidity" });
      }
    }
    // 浇水规则
    for (const rule of plant_rule.care_rules.watering || []) {
      const context = {
        precipitation,
        sunny_days,
        temp,
        topsoil_dry: soil_moisture < 30,
        fruiting: false,
        flowering: false
      };
      if (rule.condition(context)) {
        advice_list.push({ advice: rule.advice, priority: rule.priority, type: "watering" });
      }
    }
    // 季节性规则
    for (const rule of plant_rule.care_rules.seasonal || []) {
      if (rule.season === current_season) {
        advice_list.push({ advice: rule.advice, priority: 3, type: "seasonal" });
      }
    }
    // 特殊规则
    for (const rule of plant_rule.care_rules.special || []) {
      const context = {
        wind_speed: weather_data.wind_speed,
        heavy_rain: precipitation > 20,
        frost_warning: weather_data.forecast.slice(0, 2).some(f => f.min_temp < 2),
        pest_alert: checkPestAlert(weather_data),
        frequent_harvest: plant_rule.plant_type === PlantType.herb && current_season === "summer",
        flowering: false,
        uv_index,
        high_uv: uv_index ? uv_index > 8 : false,
        // sunlight 字段已移除，如需补充请在 WeatherData 类型中添加
      };
      if (rule.condition(context)) {
        advice_list.push({ advice: rule.advice, priority: rule.priority || 2, type: "special" });
      }
    }
    // 生长阶段建议
    const growth_stage = determineGrowthStage(plant_rule, weather_data);
    if (growth_stage) {
      const stage_advice = plant_rule.growth_stages[growth_stage] || {};
      if (stage_advice.watering) {
        advice_list.push({ advice: `生长阶段(${growth_stage}): 浇水建议 - ${stage_advice.watering}`, priority: 2, type: "growth_stage" });
      }
      if (stage_advice.fertilizing) {
        advice_list.push({ advice: `生长阶段(${growth_stage}): 施肥建议 - ${stage_advice.fertilizing}`, priority: 3, type: "growth_stage" });
      }
    }
    // 排序和去重
    advice_list.sort((a, b) => a.priority - b.priority || a.type.localeCompare(b.type));
    const seen_advice = new Set<string>();
    for (const advice of advice_list) {
      if (!seen_advice.has(advice.advice)) {
        advice_result.push(
          `${plant_rule.plant_type} (${plant_rule.examples.join("、")})：${advice.advice}`
        );
        seen_advice.add(advice.advice);
      }
    }
  }
  return advice_result;
}

// 辅助函数

/**
 * 计算未来晴天数量
 */
function countSunnyDays(forecast: ForecastDay[]): number {
  return forecast.filter(day => ['晴', '少云'].includes(day.condition)).length;
}

/**
 * 根据季节和天气确定植物生长阶段
 */
function determineGrowthStage(plant_rule: PlantRule, weather_data: WeatherData): string | null {
  // 简化实现 - 实际应根据植物类型和具体条件
  const season = getCurrentSeason(weather_data.date);
  if (season === Season.winter) return "dormant";
  if (plant_rule.plant_type === PlantType.flowering && season === Season.spring) {
    return "开花阶段";
  }
  return "生长阶段";
}

/**
 * 检查病虫害预警条件
 */
function checkPestAlert(weather_data: WeatherData): boolean {
  // 高温高湿易引发病虫害
  if (weather_data.temperature > 25 && weather_data.humidity > 70) {
    return true;
  }
  // 长期阴雨
  if (weather_data.precipitation > 5 && countSunnyDays(weather_data.forecast) < 2) {
    return true;
  }
  return false;
}

export const getSeasonAdvice = (season?: Season): string[] => {
  if (!season) {
    season = getCurrentSeason(new Date());
  }
  const adviceList: any[] = [];
  for (const rule of PLANT_CARE_RULES) {
    for (const seasonalRule of rule.care_rules.seasonal || []) {
      if (seasonalRule.season === season) {
        adviceList.push({
          advice: seasonalRule.advice,
          priority: seasonalRule.priority || 3,
          type: "seasonal",
          plant_type: rule.plant_type,
          examples: rule.examples,
        });
      }
    }
  }
  const adviceResult = adviceList.sort((a, b) => a.priority - b.priority).map((plant_rule) => {
    return `${plant_rule.plant_type} (${plant_rule.examples.join("、")})：${plant_rule.advice}`;
  })
  return adviceResult;
}


// 图片选择逻辑
export const takePhoto = async (callback?: (uri: string, fileName?: string | null) => void, options: ImagePicker.ImagePickerOptions = {}) => {
  // 1. 先请求相机权限
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("权限不足", "请在设置中允许访问相机以拍摄照片。");
    return;
  }
  // 2. 打开相机
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.8, // 降低质量以减小文件大小
    ...options,
  });
  if (!result.canceled && result.assets?.[0]?.uri && callback) {
    callback(result.assets[0].uri, result.assets?.[0].fileName); // 调用回调函数
  }
};

export const choosePhoto = async (callback?: (uri: string, fileName?: string | null) => void, options: ImagePicker.ImagePickerOptions = {}) => {
  // 1. 先请求权限
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("权限不足", "请在设置中允许访问相册以选择图片。");
    return;
  }
  // 2. 打开相册
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 0.8, // 降低质量以减小文件大小
    ...options
  });
  console.log('result.assets?.[0]-->', result.assets?.[0]);

  if (!result.canceled && result.assets?.[0]?.uri && callback) {
    callback(result.assets[0].uri, result.assets?.[0].fileName); // 调用回调函数
  }
};

// web端：选择图片
export const choosePhotoWeb = async (): Promise<File | null> => {
  // Web端图片选择，使用expo-image-picker
  // 注意：expo-image-picker的launchImageLibraryAsync在Web端返回base64或blob URL
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    quality: 0.8,
    base64: false,
  });
  if (result.canceled || !result.assets?.[0]?.uri) {
    throw new Error('未选择图片');
  }
  const asset = result.assets[0];
  return getFileObjectWeb(asset.uri, asset.fileName ?? '');
}

export const getFileObjectWeb = async (uri: string, fileName: string): Promise<File | null> => {
  if (!uri) {
    return Promise.reject(null);
  }

  console.log('fileName-->', fileName);

  try {
  // fetch图片内容转为blob
  const response = await fetch(uri);
  const blob = await response.blob();
  // 获取文件名和类型
  const _fileName = fileName || uri.split('/').pop() || `photo_${Date.now()}.jpg`;
  const fileType = blob.type || 'image/jpeg';
  // 构造File对象
  return Promise.resolve(new File([blob], _fileName, { type: fileType }));
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    return Promise.reject(null);
  }
}

// 获取文件对象
export const getFileObject = (uri: string): any => {
  if (!uri) {
    throw new Error("URI不能为空");
  }
  // 移动端：确保文件对象格式正确
  const fileName = uri?.split('/').pop() || `photo_${Date.now()}.jpg`;

  // 根据文件扩展名判断 MIME 类型
  let fileType = 'image/jpeg';
  if (fileName.toLowerCase().includes('.png')) {
    fileType = 'image/png';
  } else if (fileName.toLowerCase().includes('.gif')) {
    fileType = 'image/gif';
  } else if (fileName.toLowerCase().includes('.webp')) {
    fileType = 'image/webp';
  } else if (fileName.toLowerCase().includes('.svg')) {
    fileType = 'image/svg+xml';
  } else if (fileName.toLowerCase().includes('.bmp')) {
    fileType = 'image/bmp';
  } else if (fileName.toLowerCase().includes('.tiff')) {
    fileType = 'image/tiff';
  } else if (fileName.toLowerCase().includes('.heic')) {
    fileType = 'image/heic';
  }

  // React Native需要这种格式的文件对象
  return {
    uri,
    type: fileType,
    name: fileName,
  };
}
export const getImageURL = (relativePath: string): string => {
  const host = store.getState().settings.host || "http://localhost:8000";
  return host + relativePath;
}