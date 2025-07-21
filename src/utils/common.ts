import { AdviceItem, ForecastDay, PlantRule, Season, WeatherData } from "../types/common";

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


// 假设的植物养护规则数据（需要根据实际情况定义）
declare const plant_care_rules: PlantRule[];

/**
 * 根据天气数据和植物类型生成养护建议
 * @param weather_data 包含天气信息的对象
 * @param plant_type 植物类型名称
 * @returns 按优先级排序的养护建议列表
 */
export function generatePlantAdvice(weather_data: WeatherData, plant_type: string): string[] {
  // 1. 查找植物规则
  let plant_rule: PlantRule | undefined;
  for (const rule of plant_care_rules) {
    if (rule.plant_type === plant_type) {
      plant_rule = rule;
      break;
    }
  }

  if (!plant_rule) {
    return ["未找到该植物类型的养护规则"];
  }

  // 2. 准备建议列表
  const advice_list: AdviceItem[] = [];

  // 3. 温度规则处理
  const temp = weather_data.temperature;
  const temp_rules = plant_rule.care_rules.temperature;

  for (const rule of temp_rules) {
    if (evaluateCondition(rule.condition, {
      temp,
      min_temp: plant_rule.tolerance_limits.min_temp
    })) {
      advice_list.push({
        advice: rule.advice,
        priority: rule.priority,
        type: "temperature"
      });
    }
  }

  // 4. 湿度规则处理
  const humidity = weather_data.humidity;
  const humidity_rules = plant_rule.care_rules.humidity || [];

  for (const rule of humidity_rules) {
    if (evaluateCondition(rule.condition, { humidity })) {
      advice_list.push({
        advice: rule.advice,
        priority: rule.priority || 3,
        type: "humidity"
      });
    }
  }

  // 5. 浇水规则处理
  const precipitation = weather_data.precipitation;
  const watering_rules = plant_rule.care_rules.watering || [];
  const sunny_days = countSunnyDays(weather_data.forecast);

  for (const rule of watering_rules) {
    // 添加额外的上下文变量
    const context = {
      precipitation,
      sunny_days,
      temp,
      topsoil_dry: (weather_data.soil_moisture || 0) < 30 // 假设有土壤湿度数据
    };
    if (evaluateCondition(rule.condition, context)) {
      advice_list.push({
        advice: rule.advice,
        priority: rule.priority,
        type: "watering"
      });
    }
  }

  // 6. 季节性规则处理
  const current_season = getCurrentSeason(weather_data.date);
  const seasonal_rules = plant_rule.care_rules.seasonal || [];

  for (const rule of seasonal_rules) {
    if (rule.season === current_season) {
      advice_list.push({
        advice: rule.advice,
        priority: 3, // 季节性建议通常优先级较低
        type: "seasonal"
      });
    }
  }

  // 7. 特殊规则处理
  const special_rules = plant_rule.care_rules.special || [];

  for (const rule of special_rules) {
    const context = {
      wind_speed: weather_data.wind_speed,
      uv_index: weather_data.uv_index,
      heavy_rain: precipitation > 20,
      frost_warning: weather_data.forecast.slice(0, 2).some(f => f.min_temp < 2),
      high_uv: weather_data.uv_index > 8,
      pest_alert: checkPestAlert(weather_data), // 自定义病虫害预警函数
      frequent_harvest: plant_type === "草本香草" && current_season === "summer",
      flowering: checkFloweringStage(plant_rule, weather_data) // 检查开花状态
    };
    if (evaluateCondition(rule.condition, context)) {
      advice_list.push({
        advice: rule.advice,
        priority: rule.priority || 2,
        type: "special"
      });
    }
  }

  // 8. 生长阶段建议
  const growth_stage = determineGrowthStage(plant_rule, weather_data);
  if (growth_stage) {
    const stage_advice = plant_rule.growth_stages[growth_stage] || {};
    if (stage_advice.watering) {
      advice_list.push({
        advice: `生长阶段(${growth_stage}): 浇水建议 - ${stage_advice.watering}`,
        priority: 2,
        type: "growth_stage"
      });
    }
    if (stage_advice.fertilizing) {
      advice_list.push({
        advice: `生长阶段(${growth_stage}): 施肥建议 - ${stage_advice.fertilizing}`,
        priority: 3,
        type: "growth_stage"
      });
    }
  }

  // 9. 排序和去重 - 优先级1 > 2 > 3，相同优先级按类型排序
  advice_list.sort((a, b) => a.priority - b.priority || a.type.localeCompare(b.type));

  // 去重
  const seen_advice = new Set<string>();
  const unique_advice: string[] = [];
  for (const advice of advice_list) {
    if (!seen_advice.has(advice.advice)) {
      unique_advice.push(advice.advice);
      seen_advice.add(advice.advice);
    }
  }

  return unique_advice;
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
  if (plant_rule.plant_type === "开花植物" && season === Season.spring) {
    return "flowering";
  }
  return "growing";
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

/**
 * 检查开花状态（占位函数）
 */
function checkFloweringStage(plant_rule: PlantRule, weather_data: WeatherData): boolean {
  // 实际实现需要根据具体植物类型和条件判断
  return false;
}

/**
 * 评估条件表达式（简化版本，实际可能需要更复杂的表达式解析器）
 */
function evaluateCondition(condition: string, context: Record<string, any>): boolean {
  // 这里需要实现一个安全的表达式评估器
  // 为了安全起见，建议使用预定义的条件模式而不是动态执行代码
  // 这是一个简化的示例实现
  try {
    // 替换变量
    let evaluatedCondition = condition;
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      evaluatedCondition = evaluatedCondition.replace(regex, String(value));
    }

    // 简单的条件评估（实际项目中需要更安全的实现）
    return new Function('return ' + evaluatedCondition)();
  } catch {
    return false;
  }
}

