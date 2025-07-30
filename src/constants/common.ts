import { PlantRule, PlantType, Season } from "../types/common";

export const SENIVERSE_WEATHER_CODE_MAP: Record<string, string> = {
  "0": "晴",
  "1": "晴",
  "2": "晴",
  "3": "晴",
  "4": "多云",
  "5": "晴间多云",
  "6": "晴间多云",
  "7": "大部多云",
  "8": "大部多云",
  "9": "阴",
  "10": "阵雨",
  "11": "雷阵雨",
  "12": "雷阵雨伴有冰雹",
  "13": "小雨",
  "14": "中雨",
  "15": "大雨",
  "16": "暴雨",
  "17": "大暴雨",
  "18": "特大暴雨",
  "19": "冻雨",
  "20": "雨夹雪",
  "21": "阵雪",
  "22": "小雪",
  "23": "中雪",
  "24": "大雪",
  "25": "暴雪",
  "26": "浮尘",
  "27": "扬沙",
  "28": "沙尘暴",
  "29": "强沙尘暴",
  "30": "雾",
  "31": "霾",
  "32": "风",
  "33": "大风",
  "34": "飓风",
  "35": "热带风暴",
  "36": "龙卷风",
  "37": "冷",
  "38": "热",
  "99": "未知",
};

// 植物养护规则库
export const PLANT_CARE_RULES: PlantRule[] = [
  {
    "plant_type": PlantType.succulent,
    "examples": ["仙人掌", "景天", "生石花", "芦荟"],
    "ideal_conditions": {
      "temperature": { "min": 10, "max": 30, "ideal": 22 },
      "humidity": { "min": 30, "max": 50, "ideal": 40 },
      "light": { "min": 6, "max": 12, "ideal": 8 },
      "watering": { "dry_days": 7, "wet_days": 0 }
    },
    "tolerance_limits": {
      "min_temp": 5,
      "max_temp": 35,
      "min_humidity": 20,
      "max_humidity": 60
    },
    "care_rules": {
      "temperature": [
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp < envParam.min_temp, "advice": "温度低于耐受下限，立即移至室内或温室", "priority": 1 },
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp >= envParam.min_temp && envParam.temp < 10, "advice": "温度处于耐受下限附近，减少浇水频率，移至温暖处", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > 30 && envParam.temp <= envParam.max_temp, "advice": "温度接近耐受上限，移至半阴处，避免正午阳光", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > envParam.max_temp, "advice": "温度超过耐受上限，加强通风，喷水降温", "priority": 1 }
      ],
      "humidity": [
        { "condition": (envParam: { humidity: number, max_humidity: number }) => envParam.humidity > 50 && envParam.humidity <= 60, "advice": "湿度超过理想范围，确保排水良好，防止烂根", "priority": 2 },
        { "condition": (envParam: { humidity: number, min_humidity: number }) => envParam.humidity >= 20 && envParam.humidity < 30, "advice": "湿度低于理想范围，可少量喷雾增加湿度", "priority": 3 }
      ],
      "watering": [
        { "condition": (envParam: { precipitation: number, sunny_days: number }) => envParam.precipitation === 0 && envParam.sunny_days > 5, "advice": "连续晴天无降水，每5-7天浇透一次水", "priority": 2 },
        { "condition": (envParam: { precipitation: number }) => envParam.precipitation > 10, "advice": "降水量充足，停止浇水，确保排水", "priority": 1 },
        { "condition": (envParam: { temp: number }) => envParam.temp > 30, "advice": "高温天气，清晨或傍晚少量浇水", "priority": 2 }
      ],
      "seasonal": [
        { "season": Season.spring, "advice": "正值春天，开始增加浇水频率" },
        { "season": Season.summer, "advice": "正值夏天，避免正午浇水，注意通风" },
        { "season": Season.autumn, "advice": "正值秋天，逐渐减少浇水，准备越冬" },
        { "season": Season.winter, "advice": "正值冬天，保持土壤干燥，每月浇水1次" }
      ],
      "special": [
        { "condition": (envParam: { wind_speed: number }) => envParam.wind_speed > 21.6, "advice": "风速过大，移至避风处，防止倒伏", priority: 2 },
        { "condition": (envParam: { uv_index?: number }) => (envParam?.uv_index ?? -1) > 8, "advice": "紫外线过强，提供遮阳网，防止晒伤", priority: 2 }
      ]
    },
    "growth_stages": {
      "dormant": { "watering": "每月1次", "temperature": "5-15℃" },
      "growing": { "watering": "每7-10天", "temperature": "15-28℃" },
      "flowering": { "watering": "每5-7天", "temperature": "18-25℃" }
    }
  },
  {
    "plant_type": PlantType.leafy,
    "examples": ["绿萝", "龟背竹", "常春藤", "吊兰"],
    "ideal_conditions": {
      "temperature": { "min": 15, "max": 30, "ideal": 24 },
      "humidity": { "min": 40, "max": 70, "ideal": 60 },
      "light": { "min": 4, "max": 8, "ideal": 6 },
      "watering": { "dry_days": 3, "wet_days": 1 }
    },
    "tolerance_limits": {
      "min_temp": 10,
      "max_temp": 35,
      "min_humidity": 30,
      "max_humidity": 80
    },
    "care_rules": {
      "temperature": [
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp < envParam.min_temp, "advice": "温度低于耐受下限，移至室内温暖处，远离窗户", "priority": 1 },
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp >= envParam.min_temp && envParam.temp < 15, "advice": "温度低于理想范围，减少浇水，保持土壤微湿", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > 30 && envParam.temp <= envParam.max_temp, "advice": "温度超过理想范围，增加空气湿度，叶片喷雾", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > envParam.max_temp, "advice": "温度超过耐受上限，移至阴凉处，加强通风", "priority": 1 }
      ],
      "humidity": [
        { "condition": (envParam: { humidity: number, min_humidity: number }) => envParam.humidity >= envParam.min_humidity && envParam.humidity < 40, "advice": "湿度低于理想范围，建议使用加湿器或托盘加水", "priority": 2 },
        { "condition": (envParam: { humidity: number, max_humidity: number }) => envParam.humidity > 70 && envParam.humidity <= envParam.max_humidity, "advice": "湿度超过理想范围，加强通风，防止霉菌滋生", "priority": 2 }
      ],
      "watering": [
        { "condition": (envParam: { topsoil_dry: boolean, humidity: number }) => envParam.topsoil_dry && envParam.humidity < 50, "advice": "表土干燥且湿度不足，浇透水直到排水孔出水", "priority": 2 },
        { "condition": (envParam: { precipitation: number }) => envParam.precipitation > 5, "advice": "降水充足，减少人工浇水", "priority": 3 },
        { "condition": (envParam: { temp: number }) => envParam.temp > 28, "advice": "温度过高，每2-3天浇水，保持湿润", "priority": 2 }
      ],
      "seasonal": [
        { "season": Season.spring, "advice": "正值春天，开始施肥，每2周一次" },
        { "season": Season.summer, "advice": "正值夏天，保持土壤湿润，定期喷雾" },
        { "season": Season.autumn, "advice": "正值秋天，减少施肥，清理枯叶" },
        { "season": Season.winter, "advice": "正值冬天，减少浇水，停止施肥" }
      ],
      "special": [
        { "condition": (envParam: { wind_speed: number }) => envParam.wind_speed > 18, "advice": "风速过大，移至避风处，保护叶片", priority: 2 },
        { "condition": (envParam: { sunlight: number }) => envParam.sunlight < 4, "advice": "光照不足，补充人工光源", priority: 2 },
      ]
    },
    "growth_stages": {
      "dormant": { "watering": "土壤干透再浇", "fertilizing": "停止" },
      "growing": { "watering": "表土干即浇", "fertilizing": "每2周一次" },
      "new_leaf": { "watering": "保持湿润", "fertilizing": "含氮肥料" }
    }
  },
  {
    "plant_type": PlantType.flowering,
    "examples": ["玫瑰", "百合", "郁金香", "菊花"],
    "ideal_conditions": {
      "temperature": { "min": 10, "max": 28, "ideal": 20 },
      "humidity": { "min": 40, "max": 65, "ideal": 50 },
      "light": { "min": 6, "max": 10, "ideal": 8 },
      "watering": { "dry_days": 2, "wet_days": 0 }
    },
    "tolerance_limits": {
      "min_temp": 5,
      "max_temp": 32,
      "min_humidity": 35,
      "max_humidity": 75
    },
    "care_rules": {
      "temperature": [
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp < envParam.min_temp, "advice": "温度低于耐受下限，覆盖保温材料或移至室内", "priority": 1 },
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp >= envParam.min_temp && envParam.temp < 10, "advice": "温度低于理想范围，减少浇水，保护花蕾", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > 28 && envParam.temp <= envParam.max_temp, "advice": "温度超过理想范围，遮阳防晒，增加浇水", "priority": 1 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > envParam.max_temp, "advice": "温度超过耐受上限，移至阴凉处，喷水降温", "priority": 1 }
      ],
      "humidity": [
        { "condition": (envParam: { humidity: number, max_humidity: number }) => envParam.humidity > 65 && envParam.humidity <= envParam.max_humidity, "advice": "湿度超过理想范围，加强通风，防止霉菌病", "priority": 2 },
        { "condition": (envParam: { humidity: number, min_humidity: number }) => envParam.humidity >= envParam.min_humidity && envParam.humidity < 40, "advice": "湿度低于理想范围，早晨喷雾增加湿度", "priority": 3 }
      ],
      "watering": [
        { "condition": (envParam: { flowering: boolean, temp: number }) => envParam.flowering && envParam.temp > 25, "advice": "开花期且温度偏高，每天浇水，避免浇到花朵", "priority": 1 },
        { "condition": (envParam: { precipitation: number, sunny_days: number }) => envParam.precipitation < 5 && envParam.sunny_days > 3, "advice": "降水不足且连续晴天，每1-2天浇透一次", "priority": 2 },
        { "condition": (envParam: { precipitation: number }) => envParam.precipitation > 10, "advice": "降水充足，停止浇水，注意排水", "priority": 1 }
      ],
      "seasonal": [
        { "season": Season.spring, "advice": "正值春天，开始施肥，促进花芽形成" },
        { "season": Season.summer, "advice": "正值夏天，及时摘除残花，保持通风" },
        { "season": Season.autumn, "advice": "正值秋天，减少浇水，准备休眠" },
        { "season": Season.winter, "advice": "正值冬天，保护根部，覆盖保温材料" }
      ],
      "special": [
        { "condition": (envParam: { heavy_rain: boolean }) => envParam.heavy_rain, "advice": "遭遇暴雨，雨后检查花朵，摘除受损部分", priority: 2 },
        { "condition": (envParam: { frost_warning: boolean }) => envParam.frost_warning, "advice": "有霜冻预警，覆盖花朵或移至室内", priority: 2 }
      ]
    },
    "growth_stages": {
      "budding": { "watering": "保持土壤湿润", "fertilizing": "高磷肥" },
      "flowering": { "watering": "避免干旱", "fertilizing": "停止" },
      "post_flower": { "watering": "减少", "fertilizing": "平衡肥" }
    }
  },
  {
    "plant_type": PlantType.vegetable,
    "examples": ["番茄", "黄瓜", "辣椒", "生菜"],
    "ideal_conditions": {
      "temperature": { "min": 15, "max": 30, "ideal": 25 },
      "humidity": { "min": 50, "max": 70, "ideal": 60 },
      "light": { "min": 6, "max": 10, "ideal": 8 },
      "watering": { "dry_days": 1, "wet_days": 0 }
    },
    "tolerance_limits": {
      "min_temp": 10,
      "max_temp": 35,
      "min_humidity": 40,
      "max_humidity": 80
    },
    "care_rules": {
      "temperature": [
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp < envParam.min_temp, "advice": "温度低于耐受下限，建议覆盖保温膜或使用温室", "priority": 1 },
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp >= envParam.min_temp && envParam.temp < 15, "advice": "温度低于理想范围，生长缓慢，减少浇水", "priority": 2 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > 30 && envParam.temp <= envParam.max_temp, "advice": "温度超过理想范围，增加浇水，遮阳防晒", "priority": 1 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > envParam.max_temp, "advice": "温度超过耐受上限，加强通风，喷水降温", "priority": 1 }
      ],
      "humidity": [
        { "condition": (envParam: { humidity: number, max_humidity: number }) => envParam.humidity > 70 && envParam.humidity <= envParam.max_humidity, "advice": "湿度超过理想范围，加强通风，预防真菌病", "priority": 2 },
        { "condition": (envParam: { humidity: number, min_humidity: number }) => envParam.humidity >= envParam.min_humidity && envParam.humidity < 50, "advice": "湿度低于理想范围，早晨浇水，覆盖保墒", "priority": 2 }
      ],
      "watering": [
        { "condition": (envParam: { fruiting: boolean, temp: number }) => envParam.fruiting && envParam.temp > 25, "advice": "结果期且温度偏高，每天早晨浇透水", "priority": 1 },
        { "condition": (envParam: { precipitation: number }) => envParam.precipitation < 5, "advice": "降水不足，每1-2天浇水", "priority": 2 },
        { "condition": (envParam: { precipitation: number }) => envParam.precipitation > 15, "advice": "降水过多，停止浇水，注意排水", "priority": 1 }
      ],
      "seasonal": [
        { "season": Season.spring, "advice": "正值春天，播种或移栽，开始施肥" },
        { "season": Season.summer, "advice": "正值夏天，定期浇水，防治病虫害" },
        { "season": Season.autumn, "advice": "正值秋天，收获，清理田园" },
        { "season": Season.winter, "advice": "正值冬天，温室种植或休耕" }
      ],
      "special": [
        { "condition": (envParam: { high_uv?: boolean }) => envParam.high_uv ?? false, "advice": "紫外线强烈，果实遮阳防日灼", priority: 2 },
        { "condition": (envParam: { pest_alert: boolean }) => envParam.pest_alert, "advice": "病虫害预警，建议使用生物防治或有机农药", priority: 2 }
      ]
    },
    "growth_stages": {
      "seedling": { "watering": "保持表土湿润", "fertilizing": "稀薄液肥" },
      "vegetative": { "watering": "充足水分", "fertilizing": "高氮肥" },
      "fruiting": { "watering": "避免干旱", "fertilizing": "高钾肥" }
    }
  },
  {
    "plant_type": PlantType.herb,
    "examples": ["薄荷", "罗勒", "迷迭香", "百里香"],
    "ideal_conditions": {
      "temperature": { "min": 15, "max": 28, "ideal": 22 },
      "humidity": { "min": 40, "max": 60, "ideal": 50 },
      "light": { "min": 6, "max": 10, "ideal": 8 },
      "watering": { "dry_days": 2, "wet_days": 0 }
    },
    "tolerance_limits": {
      "min_temp": 5,
      "max_temp": 35,
      "min_humidity": 30,
      "max_humidity": 70
    },
    "care_rules": {
      "temperature": [
        { "condition": (envParam: { temp: number, min_temp: number }) => envParam.temp < envParam.min_temp, "advice": "温度低于耐受下限，移至室内或温室", "priority": 1 },
        { "condition": (envParam: { temp: number, max_temp: number }) => envParam.temp > 28 && envParam.temp <= envParam.max_temp, "advice": "温度超过理想范围，遮阳，增加浇水", "priority": 2 }
      ],
      "watering": [
        { "condition": (envParam: { topsoil_dry: boolean }) => envParam.topsoil_dry, "advice": "表土干燥，浇透水", "priority": 2 },
        { "condition": (envParam: { humidity: number, max_humidity: number }) => envParam.humidity > 60 && envParam.humidity <= envParam.max_humidity, "advice": "湿度超过理想范围，减少浇水，防止烂根", "priority": 2 }
      ],
      "special": [
        { "condition": (envParam: { frequent_harvest: boolean }) => envParam.frequent_harvest, "advice": "频繁采收消耗养分，增加施肥频率", "priority": 2 },
        { "condition": (envParam: { flowering: boolean }) => envParam.flowering, "advice": "开花影响叶片品质，及时摘除花蕾保持风味", "priority": 2 }
      ]
    },
    "growth_stages": {
      "seedling": {
        "watering": "保持土壤表面微湿但不积水",
        "temperature": "保持温暖稳定环境，避免温度骤变",
        "fertilizing": "不需施肥",
      },
      "vegetative": {
        "watering": "表土1-2厘米干燥时浇透水",
        "temperature": "避免温度超过28℃导致风味物质流失",
        "fertilizing": "稀薄平衡液肥",
      },
      "flowering": {
        "watering": "减少浇水频率",
        "fertilizing": "停止施用氮肥",
      },
      "dormant": {
        "watering": "大幅减少浇水",
        "temperature": "避免高温打破休眠",
        "fertilizing": "完全停止施肥",
      },
    }
  }
]
