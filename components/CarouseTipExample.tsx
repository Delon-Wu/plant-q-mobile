import React from 'react';
import { StyleSheet, View } from 'react-native';
import CarouselTip from './CarouseTip';

/**
 * CarouselTip 组件使用示例
 */
export default function CarouseTipExample() {
  const tips = [
    '💡 定期给植物浇水，保持土壤湿润',
    '🌱 选择适合的土壤和肥料',
    '☀️ 确保植物获得充足的阳光',
    '🌿 定期修剪枯萎的叶子',
    '🕷️ 注意观察害虫和疾病'
  ];

  return (
    <View style={styles.container}>
      {/* 基础淡入淡出效果 */}
      <View style={styles.section}>
        <CarouselTip
          tips={tips}
          textStyle={styles.basicText}
          duration={3000}
          animationDuration={500}
        />
      </View>

      {/* 滑动上升效果 */}
      <View style={styles.section}>
        <CarouselTip
          tips={tips}
          animationType="slideUp"
          textStyle={styles.slideText}
          duration={4000}
          animationDuration={600}
        />
      </View>

      {/* 缩放效果 */}
      <View style={styles.section}>
        <CarouselTip
          tips={tips}
          animationType="scale"
          textStyle={styles.scaleText}
          duration={3500}
          animationDuration={400}
          pauseOnHover={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginVertical: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  basicText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  slideText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  scaleText: {
    fontSize: 20,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 28,
  },
});
