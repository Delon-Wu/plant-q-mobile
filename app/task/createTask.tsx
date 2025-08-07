import DatePickerField from "@/components/DatePickerField";
import Select from "@/components/Select";
import ThemedScrollView from "@/components/ThemedScrollView";
import ThemedText from "@/components/ThemedText";
import customToast from "@/components/Toast";
import { useToast } from "@/components/ui/toast";
import { plantList } from "@/src/api/plant";
import { createTask } from "@/src/api/task";
import { TASK_TYPES } from "@/src/constants/task";
import { DurationType } from "@/src/types/task";
import { asyncSaveTaskToCalendar, getNextTaskDate } from "@/src/utils/task";
import * as Calendar from "expo-calendar";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";

const CreateTask = () => {
  const [taskType, setTaskType] = useState("");
  const [plant, setPlant] = useState("");
  const [plantOptions, setPlantOptions] = useState<{ label: string; value: string }[]>([]);
  const [plantsLoaded, setPlantsLoaded] = useState(false);
  const [durationType, setDurationType] = useState<DurationType>(
    DurationType.stage
  );
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [onceDate, setOnceDate] = useState<Date | null>(new Date());
  const [intervalDays, setIntervalDays] = useState("");
  const [remark, setRemark] = useState("");
  const [alarmAdded, setAlarmAdded] = useState(false);
  const toast = useToast();

  // 获取植物列表
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await plantList();
        if (res.status === 200) {
          const options = res.data.map(plantItem => ({
            label: plantItem.name,
            value: plantItem.id.toString()
          }));
          setPlantOptions(options);
          // 设置默认值为第一个植物
          if (options.length > 0) {
            setPlant(options[0].value);
          }
        }
      } catch (error) {
        console.error('获取植物列表失败:', error);
        // 如果获取失败，使用默认选项
        const defaultOptions = [{ label: "其他", value: "other" }];
        setPlantOptions(defaultOptions);
        setPlant("other");
      } finally {
        setPlantsLoaded(true);
      }
    };
    
    if (!plantsLoaded) {
      fetchPlants();
    }
  }, [plantsLoaded]);

  // 校验函数
  const validate = () => {
    if (!taskType) return "请选择任务类型";
    if (!durationType) return "请选择持续类型";
    if (durationType === DurationType.stage) {
      if (!startDate) return "请选择开始时间";
      if (!endDate) return "请选择结束时间";
      if (startDate && endDate && endDate < startDate)
        return "结束时间不能早于开始时间";
      if (!intervalDays) return "请输入间隔天数";
    } else if (durationType === "continuous") {
      if (!intervalDays) return "请输入间隔天数";
    } else if (durationType === "once") {
      if (!onceDate) return "请选择单次任务时间";
    }
    return null;
  };

  // 提交处理
  const handleSubmit = async () => {
    const { showToast } = customToast(toast);
    const err = validate();
    if (err) {
      showToast({ title: err, action: "error" });
      return;
    }
    let data: any = {
      task_type: taskType,
      plant,
      duration_type: durationType,
      remark,
    };
    if (durationType === DurationType.stage) {
      data.start_time = startDate;
      data.end_time = endDate;
      data.interval_days = Number(intervalDays);
    } else if (durationType === "continuous") {
      data.interval_days = Number(intervalDays);
    } else if (durationType === "once") {
      data.time_at_once = onceDate;
    }
    try {
      await createTask(data);
      showToast({ title: "创建成功", action: "success" });
      router.replace("/");
    } catch (e: any) {
      showToast({ title: e?.message || "创建失败", action: "error" });
    }
  };

  // 添加到日历
  const handleAddToCalendar = async () => {
    if (alarmAdded) return;
    const { showToast } = customToast(toast);
    const err = validate();
    if (err) {
      showToast({ title: err, action: "error" });
      return;
    }
    const nextDate = getNextTaskDate(
      Number(intervalDays),
      durationType,
      startDate,
      onceDate
    );
    if (!nextDate) {
      showToast({ title: "无法计算下次任务时间", action: "error" });
      return;
    }
    try {
      const eventId = await asyncSaveTaskToCalendar({
        taskType,
        remark,
        nextDate,
      });
      await Calendar.openEventInCalendarAsync({ id: eventId });
      showToast({ title: "成功添加日历提醒", action: "success" });
      setAlarmAdded(true);
      // 打开日历应用查看刚刚添加的事件
    } catch (e: any) {
      showToast({
        title: typeof e === "string" ? e : e?.message || "添加日历失败",
        action: "error",
      });
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
        options={plantOptions}
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
            <RadioButton value={DurationType.stage} />
            <ThemedText>阶段型</ThemedText>
            <RadioButton value={DurationType.continuous} />
            <ThemedText>持续型</ThemedText>
            <RadioButton value={DurationType.once} />
            <ThemedText>单次</ThemedText>
          </View>
        </RadioButton.Group>
      </View>
      {/* 阶段型时显示时间选择 */}
      {durationType === DurationType.stage && (
        <>
          <DatePickerField
            label="开始时间"
            value={startDate}
            onChange={setStartDate}
            style={styles.input}
          />
          <DatePickerField
            label="结束时间"
            value={endDate}
            onChange={setEndDate}
            style={styles.input}
          />
        </>
      )}
      {/* 间隔天数输入 */}
      {durationType === "once" ? (
        <DatePickerField
          label="单次任务时间"
          value={onceDate}
          onChange={setOnceDate}
          style={styles.input}
        />
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
      <View className="mt-10">
        {/* 添加下一次任务闹钟按钮 */}
        <Button
          mode={alarmAdded ? "contained" : "outlined"}
          icon="calendar"
          onPress={handleAddToCalendar}
        >
          {alarmAdded ? "已添加日历提醒" : "添加下一次任务日历提醒"}
        </Button>
        {/* 提交按钮 */}
        <Button style={styles.submitBtn} mode="contained" onPress={handleSubmit}>
          提交任务
        </Button>
      </View>
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
