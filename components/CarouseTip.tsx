import React, { useCallback, useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// 定义动画类型
export type AnimationType = "fade" | "scroll" | "slideUp" | "scale";

// 定义组件的 props 接口
interface TipProps {
  tips: string[];
  animationType?: AnimationType;
  duration?: number; // 总时长（包含动画时间）
  animationDuration?: number; // 单个动画持续时间
  textStyle?: any; // 使用any类型以支持React Native的样式对象
  pauseOnHover?: boolean; // 是否支持悬停暂停（主要用于web）
}

/**
 * CarouselTip 轮播提示组件 - 优化版本
 * @param props 组件属性
 * tips: 要轮播显示的提示文本数组
 * animationType: 动画类型 ('fade' | 'scroll' | 'slideUp' | 'scale')
 * duration: 每个提示的总显示时长（毫秒，默认3000）
 * animationDuration: 单个过渡动画时长（毫秒，默认500）
 * textStyle: 文本样式
 * pauseOnHover: 是否支持悬停暂停
 */
export default function CarouselTip({
  tips,
  textStyle,
  duration: totalDuration = 3000,
  animationDuration = 500,
  animationType = "fade",
  pauseOnHover = false,
}: TipProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 动画值
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // 确保有效的时长设置
  const safeTotalDuration = Math.max(
    totalDuration,
    animationDuration * 2 + 500
  );
  const safeAnimationDuration = Math.min(
    animationDuration,
    safeTotalDuration / 3
  );

  // 切换到下一个提示的函数
  const nextTip = useCallback(() => {
    if (!isPlaying || tips.length <= 1) return;

    setIndex((prev) => (prev + 1) % tips.length);
  }, [tips.length, isPlaying]);

  // 执行动画的函数
  const performAnimation = useCallback(() => {
    if (!isPlaying) return;

    const displayDuration = safeTotalDuration - safeAnimationDuration * 2;

    switch (animationType) {
      case "fade":
        opacity.value = withSequence(
          withTiming(1, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(0, { duration: safeAnimationDuration })
          )
        );
        break;

      case "slideUp":
        translateY.value = withSequence(
          withTiming(0, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(-20, { duration: safeAnimationDuration })
          )
        );
        opacity.value = withSequence(
          withTiming(1, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(0, { duration: safeAnimationDuration })
          )
        );
        break;

      case "scale":
        scale.value = withSequence(
          withTiming(1, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(0.8, { duration: safeAnimationDuration })
          )
        );
        opacity.value = withSequence(
          withTiming(1, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(0, { duration: safeAnimationDuration })
          )
        );
        break;

      default: // fade
        opacity.value = withSequence(
          withTiming(1, { duration: safeAnimationDuration }),
          withDelay(
            displayDuration,
            withTiming(0, { duration: safeAnimationDuration })
          )
        );
    }
  }, [
    animationType,
    opacity,
    translateY,
    scale,
    safeAnimationDuration,
    safeTotalDuration,
    isPlaying,
  ]);

  // 重置动画值到初始状态
  const resetAnimationValues = useCallback(() => {
    switch (animationType) {
      case "slideUp":
        translateY.value = 20;
        break;
      case "scale":
        scale.value = 0.8;
        break;
    }
    opacity.value = 0;
  }, [animationType, opacity, translateY, scale]);

  // 监听索引变化，触发动画
  useEffect(() => {
    if (tips.length === 0) return;

    resetAnimationValues();
    // 给一个小延迟确保重置完成
    const timeoutId = setTimeout(() => {
      performAnimation();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [index, performAnimation, resetAnimationValues, tips.length]);

  // 定时器控制轮播
  useEffect(() => {
    if (!isPlaying || tips.length <= 1) return;

    const timer = setInterval(nextTip, safeTotalDuration);
    return () => clearInterval(timer);
  }, [nextTip, safeTotalDuration, isPlaying, tips.length]);

  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      opacity: opacity.value,
    };

    switch (animationType) {
      case "slideUp":
        return {
          ...baseStyle,
          transform: [{ translateY: translateY.value }],
        };
      case "scale":
        return {
          ...baseStyle,
          transform: [{ scale: scale.value }],
        };
      default:
        return baseStyle;
    }
  }, [animationType]);

  // 处理悬停事件（主要用于web平台）
  const handlePressIn = useCallback(() => {
    if (pauseOnHover) {
      setIsPlaying(false);
    }
  }, [pauseOnHover]);

  const handlePressOut = useCallback(() => {
    if (pauseOnHover) {
      setIsPlaying(true);
    }
  }, [pauseOnHover]);

  // 如果没有提示内容，返回null
  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <Animated.Text
      style={[textStyle, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {tips[index]}
    </Animated.Text>
  );
}
