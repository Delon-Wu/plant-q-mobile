import { isDaytime } from "@/src/utils/common";
import React from "react";
import { View, ViewStyle } from "react-native";

// 天气图标类型定义
type WeatherIcon = {
  default: React.ComponentType<{
    width?: number;
    height?: number;
    style?: any;
  }>;
};

// 天气信息类型定义
interface WeatherInfo {
  icon: WeatherIcon;
  description: string;
  category:
    | "clear"
    | "cloudy"
    | "rain"
    | "snow"
    | "storm"
    | "wind"
    | "dust"
    | "unknown";
  dayIcon?: WeatherIcon; // 可选白天图标
  nightIcon?: WeatherIcon; // 可选夜间图标
}

// 预加载所有天气图标
const weatherIcons = {
  sun: require("../assets/images/weather/sun.svg"),
  moon: require("../assets/images/weather/full-moon.svg"),
  cloud: require("../assets/images/weather/cloud.svg"),
  cloudNight: require("../assets/images/weather/cloudy-night_1.svg"),
  partialCloud: require("../assets/images/weather/partial-cloudy.svg"),
  mostlyCloud: require("../assets/images/weather/mostly-cloud.svg"),
  cloudyNight: require("../assets/images/weather/cloudy-night.svg"),
  rainyday: require("../assets/images/weather/rainyday.svg"),
  thunder: require("../assets/images/weather/thunder.svg"),
  thunderstorm: require("../assets/images/weather/thunderstorm.svg"),
  rain: require("../assets/images/weather/rain.svg"),
  heavyRain: require("../assets/images/weather/heavy-rain.svg"),
  drop: require("../assets/images/weather/drop.svg"),
  snow: require("../assets/images/weather/snow.svg"),
  heavySnowfall: require("../assets/images/weather/heavy-snowfall.svg"),
  heavyWind: require("../assets/images/weather/heavy-wind.svg"),
} as const;

// 天气代码与图标映射
const seniverseWeatherCodeMap: Record<string, WeatherInfo> = {
  "0": {
    icon: weatherIcons.sun,
    nightIcon: weatherIcons.moon,
    description: "晴",
    category: "clear",
  },
  "1": {
    icon: weatherIcons.sun,
    nightIcon: weatherIcons.moon,
    description: "晴",
    category: "clear",
  },
  "2": {
    icon: weatherIcons.sun,
    nightIcon: weatherIcons.moon,
    description: "晴",
    category: "clear",
  },
  "3": {
    icon: weatherIcons.sun,
    nightIcon: weatherIcons.moon,
    description: "晴",
    category: "clear",
  },
  "4": {
    icon: weatherIcons.cloud,
    nightIcon: weatherIcons.cloudNight,
    description: "多云",
    category: "cloudy",
  },
  "5": {
    icon: weatherIcons.partialCloud,
    nightIcon: weatherIcons.cloudNight,
    description: "晴间多云",
    category: "cloudy",
  },
  "6": {
    icon: weatherIcons.partialCloud,
    nightIcon: weatherIcons.cloudNight,
    description: "晴间多云",
    category: "cloudy",
  },
  "7": {
    icon: weatherIcons.mostlyCloud,
    nightIcon: weatherIcons.cloudNight,
    description: "大部多云",
    category: "cloudy",
  },
  "8": {
    icon: weatherIcons.mostlyCloud,
    nightIcon: weatherIcons.cloudNight,
    description: "大部多云",
    category: "cloudy",
  },
  "9": {
    icon: weatherIcons.mostlyCloud,
    nightIcon: weatherIcons.cloudNight,
    description: "阴",
    category: "cloudy",
  },
  "10": { icon: weatherIcons.rain, description: "阵雨", category: "rain" },
  "11": {
    icon: weatherIcons.thunder,
    description: "雷阵雨",
    category: "storm",
  },
  "12": {
    icon: weatherIcons.thunderstorm,
    description: "雷阵雨伴有冰雹",
    category: "storm",
  },
  "13": { icon: weatherIcons.rain, description: "小雨", category: "rain" },
  "14": { icon: weatherIcons.rain, description: "中雨", category: "rain" },
  "15": { icon: weatherIcons.heavyRain, description: "大雨", category: "rain" },
  "16": { icon: weatherIcons.heavyRain, description: "暴雨", category: "rain" },
  "17": {
    icon: weatherIcons.heavyRain,
    description: "大暴雨",
    category: "rain",
  },
  "18": {
    icon: weatherIcons.heavyRain,
    description: "特大暴雨",
    category: "rain",
  },
  "19": { icon: weatherIcons.drop, description: "冻雨", category: "rain" },
  "20": { icon: weatherIcons.snow, description: "雨夹雪", category: "snow" },
  "21": { icon: weatherIcons.snow, description: "阵雪", category: "snow" },
  "22": { icon: weatherIcons.snow, description: "小雪", category: "snow" },
  "23": { icon: weatherIcons.snow, description: "中雪", category: "snow" },
  "24": {
    icon: weatherIcons.heavySnowfall,
    description: "大雪",
    category: "snow",
  },
  "25": {
    icon: weatherIcons.heavySnowfall,
    description: "暴雪",
    category: "snow",
  },
  "26": { icon: weatherIcons.cloud, description: "浮尘", category: "dust" },
  "27": { icon: weatherIcons.cloud, description: "扬沙", category: "dust" },
  "28": { icon: weatherIcons.cloud, description: "沙尘暴", category: "dust" },
  "29": { icon: weatherIcons.cloud, description: "强沙尘暴", category: "dust" },
  "30": { icon: weatherIcons.cloud, description: "雾", category: "cloudy" },
  "31": { icon: weatherIcons.cloud, description: "霾", category: "dust" },
  "32": { icon: weatherIcons.heavyWind, description: "风", category: "wind" },
  "33": { icon: weatherIcons.heavyWind, description: "大风", category: "wind" },
  "34": {
    icon: weatherIcons.thunderstorm,
    description: "飓风",
    category: "storm",
  },
  "35": {
    icon: weatherIcons.thunderstorm,
    description: "热带风暴",
    category: "storm",
  },
  "36": {
    icon: weatherIcons.thunderstorm,
    description: "龙卷风",
    category: "storm",
  },
  "37": { icon: weatherIcons.cloud, description: "冷", category: "unknown" },
  "38": { icon: weatherIcons.cloud, description: "热", category: "unknown" },
  "99": { icon: weatherIcons.cloud, description: "未知", category: "unknown" },
};

export interface WeatherSvgProps {
  /** 天气代码 */
  code: string;
  /** 图标宽度，默认为 40 */
  width?: number;
  /** 图标高度，默认为 40 */
  height?: number;
  /** 自定义样式 */
  style?: ViewStyle;
  /** 是否显示天气描述（可选，用于调试） */
  showDescription?: boolean;
}

/**
 * 获取天气信息
 * @param code 天气代码
 * @returns 天气信息对象
 */
const getWeatherInfo = (code: string): WeatherInfo => {
  return seniverseWeatherCodeMap[code] || seniverseWeatherCodeMap["99"];
};

/**
 * 天气图标组件
 * 根据天气代码显示对应的 SVG 图标
 */
const WeatherSvg: React.FC<WeatherSvgProps> = ({
  code,
  width = 40,
  height = 40,
  style,
  showDescription = false,
}) => {
  const weatherInfo = getWeatherInfo(code);
  const _isDaytime = isDaytime(new Date());

  // 获取 SVG 组件
  const SvgIcon = _isDaytime
    ? weatherInfo.icon?.default || weatherInfo.icon
    : weatherInfo.nightIcon?.default ||
      weatherInfo.icon?.default ||
      weatherInfo.icon;

  if (!SvgIcon) {
    // 降级显示：如果图标无法加载，显示占位符
    return (
      <View
        style={[
          {
            width,
            height,
            backgroundColor: "#f0f0f0",
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      />
    );
  }

  return <SvgIcon width={width} height={height} style={style} />;
};

/**
 * 根据天气代码获取天气描述
 * @param code 天气代码
 * @returns 天气描述
 */
export const getWeatherDescription = (code: string): string => {
  return getWeatherInfo(code).description;
};

/**
 * 根据天气代码获取天气类别
 * @param code 天气代码
 * @returns 天气类别
 */
export const getWeatherCategory = (code: string): WeatherInfo["category"] => {
  return getWeatherInfo(code).category;
};

/**
 * 检查天气代码是否有效
 * @param code 天气代码
 * @returns 是否为有效的天气代码
 */
export const isValidWeatherCode = (code: string): boolean => {
  return code in seniverseWeatherCodeMap;
};

export default WeatherSvg;
