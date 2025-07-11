export const PLANT_RULES = [{
  "plant_type": "多肉植物",  // 植物分类
  "scientific_name": "Crassulaceae",  // 可选学名
  "ideal_conditions": {
    "temperature_range": [10, 30] as [number, number],  // 理想温度范围(℃)
    "humidity_range": [30, 50] as [number, number],     // 理想湿度范围(%)
    "light_exposure": "full",        // 光照需求: full(全日照)/partial(半日照)/shade(阴)
    "watering_frequency": 7          // 理想浇水间隔(天)
  },
  "tolerance_limits": {
    "min_temp": 5,          // 最低耐受温度(℃)
    "max_temp": 35,          // 最高耐受温度(℃)
    "min_humidity": 20,      // 最低耐受湿度(%)
    "max_humidity": 70       // 最高耐受湿度(%)
  },
  "care_actions": {
    "watering": {
      "hot_dry": "每日早晚浇水，避开正午高温",
      "cool_dry": "每3-5天浇水，保持土壤微湿",
      "rainy": "停止浇水，注意排水防涝"
    },
    "temperature_management": {
      "freeze_warning": "移至室内或覆盖保温膜",
      "heat_warning": "移至阴凉处或设置遮阳网"
    },
    "special_needs": {
      "high_wind": "移至避风处或设置防风屏障",
      "prolonged_rain": "检查排水系统，防止烂根"
    }
  },
  "seasonal_adjustments": {
    "spring": "增加浇水频率，开始施肥",
    "summer": "注意遮阳，防止高温灼伤",
    "autumn": "减少浇水，准备越冬",
    "winter": "保持干燥，防止冻害"
  }
}, ];