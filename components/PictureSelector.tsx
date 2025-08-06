import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { choosePhoto, takePhoto } from "@/src/utils/common";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export type Action = {
  label: string;
  icon: React.ElementType;
  iconProps: React.ComponentProps<React.ElementType>;
  onPress?: () => void;
  isDisabled?: boolean;
};

type PictureSelectorProps = {
  isOpen: boolean;
  onChange: (uri: string) => void;
  onClose?: () => void;
};

export default function PictureSelector({
  isOpen,
  onClose,
  onChange,
}: PictureSelectorProps) {
  const actions: Action[] = [
    {
      label: "拍照",
      icon: Ionicons,
      iconProps: { name: "camera", size: 14, color: "white" },
      onPress: () => takePhoto(onChange),
    },
    {
      label: "从相册选择",
      icon: Ionicons,
      iconProps: { name: "images", size: 14, color: "white" },
      onPress: () => choosePhoto(onChange)
    },
  ];
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        {actions.map((action, idx) => (
          <ActionsheetItem
            key={action.label}
            onPress={action.onPress || onClose}
            isDisabled={action.isDisabled}
          >
            <ActionsheetIcon
              className="stroke-background-700"
              as={action.icon}
              {...action.iconProps}
            />
            <ActionsheetItemText>{action.label}</ActionsheetItemText>
          </ActionsheetItem>
        ))}
      </ActionsheetContent>
    </Actionsheet>
  );
}
