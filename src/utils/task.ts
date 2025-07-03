// 计算下一次任务时间
 export const getNextTaskDate = (intervalDays: number, durationType: string, startDate: Date, onceDate: Date) => {
    const intervalMillis = intervalDays * 24 * 60 * 60 * 1000;
    if (durationType === "stage") {
      if (!intervalDays || !startDate) return null;
      let next = new Date(startDate);
      const now = new Date();
      // 循环加间隔天数，直到大于今天
      while (next <= now) {
        next = new Date(next.getTime() + intervalMillis);
      }
      return next;
    } else if (durationType === "continuous") {
      // 持续型：从现在起加间隔天数
      const now = new Date();
      if (!intervalDays) return null;
      return new Date(now.getTime() + intervalMillis);
    } else if (durationType === "once") {
      return onceDate;
    }
    return null;
  };