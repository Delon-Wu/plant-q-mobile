import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button } from "react-native-paper";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  style?: any;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange, style }) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button
        mode="outlined"
        onPress={() => setShow(true)}
        style={style}
        icon="calendar"
      >
        {value ? `${label}: ${value.toLocaleDateString()}` : `选择${label}`}
      </Button>
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={(_: any, date?: Date) => {
            setShow(false);
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
};

export default DatePickerField;
