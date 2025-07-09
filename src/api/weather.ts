import axios from "axios";

export async function getFutureWeather(params: {
  location: string;
  unit?: string;
  start?: number;
  days?: number;
}) {
  return axios.get("https://api.seniverse.com/v3/weather/daily.json", {
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