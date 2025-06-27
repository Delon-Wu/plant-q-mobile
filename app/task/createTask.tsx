import Select from "@/components/Select";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";

const TASK_TYPES = [
  { label: "浇水", value: "watering" },
  { label: "施肥", value: "fertilizing" },
  { label: "修剪", value: "pruning" },
  { label: "其他", value: "other" },
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
  const [durationType, setDurationType] = useState<"stage" | "continuous">(
    "stage"
  );
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [intervalDays, setIntervalDays] = useState("");
  const [remark, setRemark] = useState("");
  const [alarmAdded, setAlarmAdded] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {/* 任务类型选择 - gluestack ui Select */}
      <ThemedText style={styles.label}>*任务类型</ThemedText>
      <Select className="mb-5" value={taskType} onValueChange={setTaskType} options={TASK_TYPES} variant="underlined" placeholder="任务分类" />
      {/* 养护作物选择 - gluestack ui Select */}
      <ThemedText style={styles.label}>养护的作物</ThemedText>
      <Select className="mb-5" value={plant} onValueChange={setPlant} options={PLANT_OBJECTS} variant="underlined" placeholder="养护的作物" />
      {/* 持续类型切换 */}
      <View style={styles.row}>
        <ThemedText>*持续类型：</ThemedText>
        <RadioButton.Group
          onValueChange={(v) => setDurationType(v as "stage" | "continuous")}
          value={durationType}
        >
          <View style={styles.radioRow}>
            <RadioButton value="stage" />
            <ThemedText>阶段型</ThemedText>
            <RadioButton value="continuous" />
            <ThemedText>持续型</ThemedText>
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
      <TextInput
        label="*间隔天数"
        value={intervalDays}
        onChangeText={setIntervalDays}
        keyboardType="numeric"
        style={styles.input}
      />
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
        icon="alarm"
        onPress={() => setAlarmAdded(!alarmAdded)}
        style={styles.input}
      >
        {alarmAdded ? "已添加闹钟" : "添加下一次任务闹钟"}
      </Button>
      {/* 提交按钮 */}
      <Button mode="contained" style={styles.submitBtn} onPress={() => {}}>
        提交任务
      </Button>
    </ThemedView>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
