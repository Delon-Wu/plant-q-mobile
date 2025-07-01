import * as React from "react";
import { Toast, ToastDescription, ToastTitle } from "./ui/toast";

const customToast = (toast: any) => {
  const toastId = Math.random();
  const showToast = ({
    title,
    description,
    action = "info",
    variant = "solid",
  }: {
    title: string;
    description?: string;
    action?: "error" | "warning" | "success" | "info" | "muted";
    variant?: "solid" | "outline";
  }) => {
    if (toast.isActive(toastId.toString())) {
      return; // 如果当前 toast 仍然活跃，则不显示新的 toast
    }
    toast.show({
      id: toastId.toString(),
      placement: "top",
      duration: 2000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast nativeID={uniqueToastId} action={action} variant={variant}>
            <ToastTitle>{title}</ToastTitle>
            <ToastDescription>{description}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  return {
    toastId,
    showToast,
  };
};

export default customToast;
