import React from "react";
import { TextProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface BlinkingTextProps extends TextProps {
  children: React.ReactNode;
  duration?: number; // 单次闪烁周期，毫秒
  minOpacity?: number;
  maxOpacity?: number;
}

/**
 * 无限闪烁的文字组件
 */
export default function BlinkingText({
  children,
  duration = 800,
  minOpacity = 0.2,
  maxOpacity = 1,
  style,
  ...rest
}: BlinkingTextProps) {
  const opacity = useSharedValue(maxOpacity);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(minOpacity, { duration: duration / 2 }),
      -1,
      true
    );
  }, [duration, minOpacity, maxOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.Text>
  );
}
