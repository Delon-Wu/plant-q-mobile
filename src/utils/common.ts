import { Season } from "../types/common";

/**
 * 根据时间计算当前季节
 * @param date Date对象或时间戳戳（毫秒）
 * @returns 季节名称：spring, summer, autumn, winter
 */
export function getSeason(date: Date | number): Season {
  const month = date instanceof Date ? date.getMonth() : new Date(date).getMonth(); // 0-11，0代表一月
  // 北半球季节划分
  if (month >= 3 && month < 6) return Season.spring;    // 春季：3-5月
  if (month >= 6 && month < 9) return Season.summer;   // 夏季：6-8月
  if (month >= 9 && month < 11) return Season.autumn;  // 秋季：9-10月
  return Season.winter;                              // 冬季：11-2月
}