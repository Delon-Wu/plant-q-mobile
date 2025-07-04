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