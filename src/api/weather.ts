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