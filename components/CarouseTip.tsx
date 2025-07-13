import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

// 定义动画类型
export type AnimationType = 'fade' | 'scroll';

// 定义组件的 props 接口
interface TipProps {
  tips: string[];
  animationType?: AnimationType;
  duration?: number; // 动画持续时间
  textStyle?: {[key in string]: string};
}

/**
 * CarouselTip 轮播提示组件
 * @param {{ tips: string[], style?: object }} props
 * tips: 要轮播显示的提示文本数组
 * style: 容器样式
 * textStyle: 文本样式
 */
export default function CarouselTip({ tips, textStyle, duration: totalDuration }: TipProps) {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(0);
  const defaultDuration = 3000;

  // 当 index 改变时，触发淡入淡出动画
  useEffect(() => {
    // 动画：淡入 500ms -> 保持 2000ms -> 淡出 500ms
    opacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withDelay((totalDuration ?? defaultDuration) - 1000, withTiming(0, { duration: 500 }))
    );
  }, [index, opacity, totalDuration]);

  // 使用定时器每 3 秒切换一次提示
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, totalDuration ?? defaultDuration);
    return () => clearInterval(timer);
  }, [tips.length, totalDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[textStyle, animatedStyle]}>
      {tips[index]}
    </Animated.Text>
  );
}
