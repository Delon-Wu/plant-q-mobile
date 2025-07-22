import axios from "axios";

export async function getFutureWeather(params: {
  location: string; // 形式为 "纬度:经度" 或 "城市名"
  unit?: string;
  start?: number;
  days?: number;
}) {
  return axios.get<{
    "results": {
      "location": {
        "id": string
        "name": string
        "country": string
        "path": string
        "timezone": string
        "timezone_offset": string
      },
      "daily": {
        "date": string
        "text_day": string
        "code_day": string
        "text_night": string
        "code_night": string
        "high": string
        "low": string
        "rainfall": string
        "precip": string
        "wind_direction": string
        "wind_direction_degree": string
        "wind_speed": string
        "wind_scale": string
        "humidity": string
      }[],
      "last_update": string
    }[]
  }>("https://api.seniverse.com/v3/weather/daily.json", {
    params: {
      key: process.env.EXPO_PUBLIC_SENIVERSE_PRIVATE_KEY || '',
      language: 'zh-Hans',
      unit: 'c',
      start: 0,
      days: 5,
      ...params
    }
  });
}

export async function getCurrentWeather(params: {
  location: string; // 形式为 "纬度:经度" 或 "城市名"
  unit?: string;
}) {
  return axios.get<{
    "results": {
      "location": {
        "id": string
        "name": string
        "country": string
        "path": string
        "timezone": string
        "timezone_offset": string
      },
      "now": {
        "text": string; //天气现象文字
        "code": string; //天气现象代码
        "temperature": string; //温度，单位为c摄氏度或f华氏度
        "feels_like": string; //体感温度，单位为c摄氏度或f华氏度，暂不支持国外城市。
        "pressure": string; //气压，单位为mb百帕或in英寸
        "humidity": string; //相对湿度，0~100，单位为百分比
        "visibility": string; //能见度，单位为km公里或mi英里
        "wind_direction": string; //风向文字
        "wind_direction_degree": string; //风向角度，范围0~360，0为正北，90为正东，180为正南，270为正西
        "wind_speed": string; //风速，单位为km/h公里每小时或mph英里每小时
        "wind_scale": string; //风力等级，请参考：http://baike.baidu.com/view/465076.htm
        "clouds": string; //云量，单位%，范围0~100，天空被云覆盖的百分比 #目前不支持中国城市#
        "dew_point": string; //露点温度，请参考：http://baike.baidu.com/view/118348.htm #目前数据缺失中#},
        "last_update": string
      },
    }[]
    "last_update": string;
  }>("https://api.seniverse.com/v3/weather/now.json", {
    params: {
      key: process.env.EXPO_PUBLIC_SENIVERSE_PRIVATE_KEY || '',
      language: 'zh-Hans',
      unit: 'c',
      ...params
    }
  });
}