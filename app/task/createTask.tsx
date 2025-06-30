import Select from "@/components/Select";
import ThemedScrollView from "@/components/ThemedScrollView";
import { ThemedText } from "@/components/ThemedText";
import customToast from "@/components/Toast";
import { createTask } from "@/src/api/task";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";

const TASK_TYPES = [
  { label: "灌溉", value: "Irrigation" },
  { label: "排水优化", value: "DrainageImprovement" },
  { label: "施肥", value: "Fertilization" },
  { label: "修剪", value: "Pruning" },
  { label: "整形", value: "Training" },
  { label: "施药", value: "PesticideApplication)" },
  { label: "休眠期管理", value: "DormancyManagement" },
  { label: "繁殖操作", value: "Propagation" },
  { label: "光照调控", value: "LightRegulation" },
  { label: "温湿度控制", value: "Temperature&HumidityControl" },
  { label: "换土/换盆", value: "Repotting" },
  { label: "基质调配", value: "SubstrateFormulation" },
  { label: "其它", value: "other" },
];
const PLANT_OBJECTS = [
  { label: "玫瑰", value: "rose" },
  { label: "多肉", value: "succulent" },
  { label: "绿萝", value: "pothos" },
  { label: "其他", value: "other" },
];

const CreateTask = () => {
  const [taskType, setTaskType] = useState("watering");
  const [plant, setPlant] = useState("rose");
  const [durationType, setDurationType] = useState<
    "stage" | "continuous" | "onece"
  >("stage");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [oneceDate, setOneceDate] = useState<Date | null>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showOnecePicker, setShowOnecePicker] = useState(false);
  const [intervalDays, setIntervalDays] = useState("");
  const [remark, setRemark] = useState("");
  const [alarmAdded, setAlarmAdded] = useState(false);

  // 校验函数
  const validate = () => {
    if (!taskType) return "请选择任务类型";
    if (!durationType) return "请选择持续类型";
    if (durationType === "stage") {
      if (!startDate) return "请选择开始时间";
      if (!endDate) return "请选择结束时间";
      if (startDate && endDate && endDate < startDate)
        return "结束时间不能早于开始时间";
      if (!intervalDays) return "请输入间隔天数";
    } else if (durationType === "continuous") {
      if (!intervalDays) return "请输入间隔天数";
    } else if (durationType === "onece") {
      if (!oneceDate) return "请选择单次任务时间";
    }
    return null;
  };

  // 提交处理
  const handleSubmit = async () => {
    const { showToast } = customToast();
    const err = validate();
    if (err) {
      showToast({title: err, action: "error"});
      return;
    }
    let data: any = {
      type: taskType,
      plant,
      duration_type: durationType,
      remark,
      alarm: alarmAdded,
    };
    if (durationType === "stage") {
      data.start_time = startDate;
      data.end_time = endDate;
      data.interval_days = Number(intervalDays);
    } else if (durationType === "continuous") {
      data.interval_days = Number(intervalDays);
    } else if (durationType === "onece") {
      data.time = oneceDate;
    }
    try {
      await createTask(data);
      showToast({ title: "创建成功", action: "success" });
      router.replace("/");
    } catch (e: any) {
      showToast({ title: e?.message || "创建失败", action: "error" });
    }
  };

  return (
    <ThemedScrollView>
      {/* 任务类型选择 - gluestack ui Select */}
      <ThemedText style={styles.label}>*任务类型</ThemedText>
      <Select
        className="mb-5"
        value={taskType}
        onValueChange={setTaskType}
        options={TASK_TYPES}
        variant="underlined"
        placeholder="任务分类"
      />
      {/* 养护作物选择 - gluestack ui Select */}
      <ThemedText style={styles.label}>养护的作物</ThemedText>
      <Select
        className="mb-5"
        value={plant}
        onValueChange={setPlant}
        options={PLANT_OBJECTS}
        variant="underlined"
        placeholder="养护的作物"
      />
      {/* 持续类型切换 */}
      <ThemedText style={styles.label}>*持续类型：</ThemedText>
      <View style={styles.row}>
        <RadioButton.Group
          onValueChange={(v) => setDurationType(v as any)}
          value={durationType}
        >
          <View style={styles.radioRow}>
            <RadioButton value="stage" />
            <ThemedText>阶段型</ThemedText>
            <RadioButton value="continuous" />
            <ThemedText>持续型</ThemedText>
            <RadioButton value="onece" />
            <ThemedText>单次</ThemedText>
          </View>
        </RadioButton.Group>
      </View>
      {/* 阶段型时显示时间选择 */}
      {durationType === "stage" && (
        <>
          <Button
            mode="outlined"
            onPress={() => setShowStartPicker(true)}
            style={styles.input}
            icon="calendar"
          >
            {startDate
              ? `开始时间: ${startDate.toLocaleDateString()}`
              : "选择开始时间"}
          </Button>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(_: any, date?: Date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
          <Button
            mode="outlined"
            onPress={() => setShowEndPicker(true)}
            style={styles.input}
            icon="calendar"
          >
            {endDate
              ? `结束时间: ${endDate.toLocaleDateString()}`
              : "选择结束时间"}
          </Button>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(_: any, date?: Date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </>
      )}
      {/* 间隔天数输入 */}
      {durationType === "onece" ? (
        <>
          <Button
            mode="outlined"
            onPress={() => setShowOnecePicker(true)}
            style={styles.input}
            icon="calendar"
          >
            {oneceDate
              ? `单次任务时间: ${oneceDate.toLocaleDateString()}`
              : "选择时间"}
          </Button>
          {showOnecePicker && (
            <DateTimePicker
              value={oneceDate || new Date()}
              mode="date"
              display="default"
              onChange={(_: any, date?: Date) => {
                setShowOnecePicker(false);
                if (date) setOneceDate(date);
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          label="*间隔天数"
          value={intervalDays}
          onChangeText={setIntervalDays}
          keyboardType="numeric"
          style={styles.input}
        />
      )}
      {/* 备注 */}
      <TextInput
        label="备注"
        value={remark}
        onChangeText={setRemark}
        multiline
        style={styles.input}
      />
      {/* 添加下一次任务闹钟按钮 */}
      <Button
        mode={alarmAdded ? "contained" : "outlined"}
        icon="calendar"
        onPress={() => setAlarmAdded(!alarmAdded)}
        style={styles.input}
      >
        {alarmAdded ? "已添加日历事件" : "添加下一次任务到日历"}
      </Button>
      {/* 提交按钮 */}
      <Button mode="contained" style={styles.submitBtn} onPress={handleSubmit}>
        提交任务
      </Button>
    </ThemedScrollView>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  submitBtn: {
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
