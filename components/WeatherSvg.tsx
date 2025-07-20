import React from "react";
import { View } from "react-native";

// 代码与SVG文件的映射（根据实际SVG文件名和含义调整）
const codeToSvg: Record<string, any> = {
  "0": require("../assets/images/weather/cloud.svg"), // 晴
  "1": require("../assets/images/weather/cloud.svg"),
  "2": require("../assets/images/weather/cloud.svg"),
  "3": require("../assets/images/weather/cloud.svg"),
  "4": require("../assets/images/weather/mostly-cloud.svg"), // 多云
  "5": require("../assets/images/weather/mostly-cloud.svg"), // 晴间多云
  "6": require("../assets/images/weather/mostly-cloud.svg"),
  "7": require("../assets/images/weather/mostly-cloud.svg"), // 大部多云
  "8": require("../assets/images/weather/mostly-cloud.svg"),
  "9": require("../assets/images/weather/cloudy-night.svg"), // 阴
  "10": require("../assets/images/weather/rainyday.svg"), // 阵雨
  "11": require("../assets/images/weather/thunder.svg"), // 雷阵雨
  "12": require("../assets/images/weather/thunderstorm.svg"), // 雷阵雨伴有冰雹
  "13": require("../assets/images/weather/rain.svg"), // 小雨
  "14": require("../assets/images/weather/rain.svg"), // 中雨
  "15": require("../assets/images/weather/heavy-rain.svg"), // 大雨
  "16": require("../assets/images/weather/heavy-rain.svg"), // 暴雨
  "17": require("../assets/images/weather/heavy-rain.svg"), // 大暴雨
  "18": require("../assets/images/weather/heavy-rain.svg"), // 特大暴雨
  "19": require("../assets/images/weather/drop.svg"), // 冻雨
  "20": require("../assets/images/weather/snow.svg"), // 雨夹雪
  "21": require("../assets/images/weather/snow.svg"), // 阵雪
  "22": require("../assets/images/weather/snow.svg"), // 小雪
  "23": require("../assets/images/weather/snow.svg"), // 中雪
  "24": require("../assets/images/weather/heavy-snowfall.svg"), // 大雪
  "25": require("../assets/images/weather/heavy-snowfall.svg"), // 暴雪
  "26": require("../assets/images/weather/cloud.svg"), // 浮尘
  "27": require("../assets/images/weather/cloud.svg"), // 扬沙
  "28": require("../assets/images/weather/cloud.svg"), // 沙尘暴
  "29": require("../assets/images/weather/cloud.svg"), // 强沙尘暴
  "30": require("../assets/images/weather/cloud.svg"), // 雾
  "31": require("../assets/images/weather/cloud.svg"), // 霾
  "32": require("../assets/images/weather/heavy-wind.svg"), // 风
  "33": require("../assets/images/weather/heavy-wind.svg"), // 大风
  "34": require("../assets/images/weather/thunderstorm.svg"), // 飓风
  "35": require("../assets/images/weather/thunderstorm.svg"), // 热带风暴
  "36": require("../assets/images/weather/thunderstorm.svg"), // 龙卷风
  "37": require("../assets/images/weather/cloud.svg"), // 冷
  "38": require("../assets/images/weather/cloud.svg"), // 热
  "99": require("../assets/images/weather/cloud.svg"), // 未知
};

export interface WeatherSvgProps {
  code: string;
  width?: number;
  height?: number;
  style?: any;
}

const WeatherSvg: React.FC<WeatherSvgProps> = ({ code, width = 40, height = 40, style }) => {
  let SvgIcon = codeToSvg[code] || codeToSvg["99"];
  SvgIcon = SvgIcon?.default || SvgIcon;
  return SvgIcon ? (
    <SvgIcon width={width} height={height} style={style} />
  ) : (
    <View style={[{ width, height, backgroundColor: "#eee" }, style]} />
  );
};

export default WeatherSvg;
