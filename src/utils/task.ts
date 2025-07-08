import * as Calendar from "expo-calendar";
import { TASK_TYPES } from "../constants/task";
import { DurationType } from "../types/task";


/**
 * Calculates the next task date based on the given interval, duration type, and start/once dates.
 *
 * @param intervalDays - The number of days between each task occurrence.
 * @param durationType - The type of duration for the task (stage, continuous, or once).
 * @param startDate - The start date of the task (used for 'stage' duration type).
 * @param onceDate - The specific date for a one-time task (used for 'once' duration type).
 * @returns The next scheduled task date as a `Date` object, or `null` if the next date cannot be determined.
 */
export const getNextTaskDate = (intervalDays: number, durationType: DurationType, startDate: Date | null, onceDate: Date | null) => {
  const intervalMillis = intervalDays * 24 * 60 * 60 * 1000;
  if (durationType === DurationType.stage) {
    if (!intervalDays || !startDate) return null;
    let next = new Date(startDate);
    const now = new Date();
    // 循环加间隔天数，直到大于今天
    while (next <= now) {
      next = new Date(next.getTime() + intervalMillis);
    }
    return next;
  } else if (durationType === DurationType.continuous) {
    // 持续型：从现在起加间隔天数
    const now = new Date();
    if (!intervalDays) return null;
    return new Date(now.getTime() + intervalMillis);
  } else if (durationType === DurationType.once) {
    return onceDate;
  }
  return null;
};

export const asyncSaveTaskToCalendar = async (info: { taskType: string, remark: string, nextDate: Date }): Promise<string> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    return Promise.reject("未获得日历权限");
  }
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const defaultCalendar =
    calendars.find((cal) => cal.allowsModifications) || calendars[0];
  if (!defaultCalendar) {
    return Promise.reject("未找到可用日历");
  }
  // 添加事件到日历
  console.log('info-->', info);
  const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
    title: `养护任务：${TASK_TYPES.find((t) => t.value === info.taskType)?.label || info.taskType}`,
    notes: info.remark,
    startDate: info.nextDate,
    endDate: new Date(info.nextDate.getTime() + 60 * 60 * 1000), // 默认1小时
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{ method: Calendar.AlarmMethod.ALERT, relativeOffset: -15 }], // 提前15分钟提醒
  });
  return Promise.resolve(eventId);
}