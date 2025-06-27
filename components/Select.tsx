import { Ionicons } from "@expo/vector-icons";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "./ui/select";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string; isDisabled?: boolean }[];
  placeholder?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "underlined" | "rounded";
  className?: string;
}

function _Select(
  props: Props = {
    size: "xl",
    variant: "outline",
    placeholder: "请选择",
    options: [],
    value: "",
    onValueChange: () => {},
    className: "",
  }
) {
  const selectedLabel =
    props.options.find((opt) => opt.value === props.value)?.label || "";
  return (
    <Select
      {...props}
      selectedValue={props.value}
      onValueChange={props.onValueChange}
    >
      <SelectTrigger className="flex items-center justify-between" variant={props.variant} size={props.size}>
        <SelectInput
          placeholder={props.placeholder}
          value={selectedLabel}
          style={{
            paddingVertical: 8,
            minHeight: 24,
            textAlignVertical: "center",
          }}
        />
        <SelectIcon
          className="mr-3"
          as={() => <Ionicons name="chevron-down" size={16} color="gray" />}
        />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {props.options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
              isDisabled={option.isDisabled}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}

export default _Select;
