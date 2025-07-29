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
import React from "react";

export type Action = {
  label: string;
  icon: React.ElementType;
  iconProps: React.ComponentProps<React.ElementType>;
  onPress?: () => void;
  isDisabled?: boolean;
};

type ActionSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
};

export default function ActionSelector({ isOpen, onClose, actions }: ActionSelectorProps) {
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
            <ActionsheetIcon className="stroke-background-700" as={action.icon} {...action.iconProps}/>
            <ActionsheetItemText>{action.label}</ActionsheetItemText>
          </ActionsheetItem>
        ))}
      </ActionsheetContent>
    </Actionsheet>
  );
}