import DatePickerField from "@/components/DatePickerField";
import Select from "@/components/Select";
import ThemedScrollView from "@/components/ThemedScrollView";
import ThemedText from "@/components/ThemedText";
import customToast from "@/components/Toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getTaskDetail, updateTask } from "@/src/api/task";
import { TASK_TYPES } from "@/src/constants/task";
import { DurationType } from "@/src/types/task";
import { asyncSaveTaskToCalendar, getNextTaskDate } from "@/src/utils/task";
import * as Calendar from "expo-calendar";
import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";

const PLANT_OBJECTS = [
  { label: "玫瑰", value: "rose" },
  { label: "多肉", value: "succulent" },
  { label: "绿萝", value: "pothos" },
  { label: "其他", value: "other" },
];

const TaskDetail = () => {
  const { id } = useLocalSearchParams();
  const toast = useToast();
  const { showToast } = customToast(toast);
  const [loading, setLoading] = useState(true);
  const [taskType, setTaskType] = useState("");
  const [plant, setPlant] = useState("rose");
  const [durationType, setDurationType] = useState<DurationType>(
    DurationType.stage
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [onceDate, setOnceDate] = useState<Date | null>(null);
  const [intervalDays, setIntervalDays] = useState("");
  const [remark, setRemark] = useState("");
  const [alarmAdded, setAlarmAdded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!id) return;
    const taskId = Array.isArray(id) ? id[0] : id;
    setLoading(true);
    getTaskDetail(taskId)
      .then((res) => {
        if (res.data.code === 200) {
          const t = res.data.data;
          setTaskType(t.task_type);
          setPlant(t.plant);
          setDurationType(t.duration_type);
          setStartDate(t.start_time ? new Date(t.start_time) : null);
          setEndDate(t.end_time ? new Date(t.end_time) : null);
          setOnceDate(t.time_at_once ? new Date(t.time_at_once) : null);
          setIntervalDays(t.interval_days ? String(t.interval_days) : "");
          setRemark(t.remark || "");
          setIsComplete(t.is_completed);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 保存间隔天数和备注（页面卸载时）
  useEffect(() => {
    return () => {
      if (!id) return;
      const taskId = Array.isArray(id) ? id[0] : id;
      if (intervalDays !== "") {
        updateTask(taskId, { interval_days: Number(intervalDays) });
      }
      if (remark !== "") {
        updateTask(taskId, { remark });
      }
    };
  }, [id, intervalDays, remark]);

  // 通用自动保存（只用于即时保存的字段）
  const autoSave = async (field: string, value: any) => {
    if (!id) return;
    const taskId = Array.isArray(id) ? id[0] : id;
    try {
      await updateTask(taskId, { [field]: value });
      showToast({ title: "更新成功", action: "success" });
    } catch (e: any) {
      showToast({
        title: typeof e === "string" ? e : e?.message || "更新失败",
        action: "error",
      });
    }
  };

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

  // 添加到日历
  const handleAddToCalendar = async () => {
    if (alarmAdded) return;
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
      showToast({ title: "已添加到日历", action: "success" });
      setAlarmAdded(true);
      // 打开日历应用查看刚刚添加的事件
    } catch (e: any) {
      showToast({
        title: typeof e === "string" ? e : e?.message || "添加日历失败",
        action: "error",
      });
    }
  };

  const handleCompleteTask = async () => {
    if (isComplete) return;
    await autoSave("is_completed", true);
    setIsComplete(true);
    showToast({ title: "任务已标记为完成", action: "success" });
  };

  if (loading) return <Skeleton style={styles.container}></Skeleton>;

  return (
    <ThemedScrollView>
      <ThemedText style={styles.label}>*任务类型</ThemedText>
      <Select
        className="mb-5"
        value={taskType}
        onValueChange={(v) => {
          setTaskType(v);
          autoSave("task_type", v);
        }}
        options={TASK_TYPES}
        variant="underlined"
        placeholder="任务分类"
      />
      <ThemedText style={styles.label}>养护的作物</ThemedText>
      <Select
        className="mb-5"
        value={plant}
        onValueChange={(v) => {
          setPlant(v);
          autoSave("plant", v);
        }}
        options={PLANT_OBJECTS}
        variant="underlined"
        placeholder="养护的作物"
      />
      <ThemedText style={styles.label}>*持续类型：</ThemedText>
      <View style={styles.row}>
        <RadioButton.Group
          onValueChange={(v) => {
            setDurationType(v as any);
            autoSave("duration_type", v);
          }}
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
          <TextInput
            label="*间隔天数"
            value={intervalDays}
            onChangeText={(v) => {
              setIntervalDays(v);
            }}
            keyboardType="numeric"
            style={styles.input}
          />
        </>
      )}
      {durationType === DurationType.once && (
        <DatePickerField
          label="单次任务时间"
          value={onceDate}
          onChange={setOnceDate}
          style={styles.input}
        />
      )}
      {durationType === DurationType.continuous && (
        <TextInput
          label="*间隔天数"
          value={intervalDays}
          onChangeText={(v) => {
            setIntervalDays(v);
          }}
          keyboardType="numeric"
          style={styles.input}
        />
      )}
      <TextInput
        label="备注"
        value={remark}
        onChangeText={(v) => {
          setRemark(v);
        }}
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
        <Button
          style={styles.submitBtn}
          mode={isComplete ? "contained" : "outlined"}
          onPress={handleCompleteTask}
        >
          {isComplete ? "已完成" : "标记为完成"}
        </Button>
      </View>
    </ThemedScrollView>
  );
};

export default TaskDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginTop: 20,
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
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  submitBtn: {
    marginTop: 20,
  },
});
