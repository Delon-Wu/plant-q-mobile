export enum Season {
  spring = 'spring',
  summer = 'summer',
  autumn = 'autumn',
  winter = 'winter'
}


// 天气数据接口
export interface WeatherData {
  temperature: number; // 当前温度(℃)
  humidity: number; // 当前湿度(%)
  precipitation: number; // 降水量(mm)
  wind_speed: number; // 风速(m/s)
  uv_index: number; // 紫外线指数
  sunlight_hours: number; // 日照时数
  condition: string; // 天气状况('晴','雨','雪'等)
  forecast: ForecastDay[]; // 未来3天预报
  date: Date; // 当前日期
  soil_moisture?: number; // 土壤湿度（可选）
}

export interface ForecastDay {
  condition: string;
  min_temp: number;
  max_temp: number;
}

// 植物规则接口
export interface PlantRule {
  plant_type: string;
  tolerance_limits: {
    min_temp: number;
    max_temp: number;
  };
  care_rules: {
    temperature: CareRule[];
    humidity?: CareRule[];
    watering?: CareRule[];
    seasonal?: SeasonalRule[];
    special?: CareRule[];
  };
  growth_stages: {
    [stage: string]: {
      watering?: string;
      fertilizing?: string;
    };
  };
}

export interface CareRule {
  condition: string;
  advice: string;
  priority: number;
}

export interface SeasonalRule {
  season: string;
  advice: string;
}

export interface AdviceItem {
  advice: string;
  priority: number;
  type: string;
}