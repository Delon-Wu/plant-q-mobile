import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WeatherSvg, {
    getWeatherCategory,
    getWeatherDescription,
    isValidWeatherCode
} from './WeatherSvg';

/**
 * WeatherSvg 组件使用示例
 */
const WeatherSvgExample: React.FC = () => {
  const weatherCodes = ['0', '10', '15', '24', '32', '99'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>天气图标示例</Text>
      
      {weatherCodes.map((code) => (
        <View key={code} style={styles.weatherItem}>
          <WeatherSvg 
            code={code} 
            width={50} 
            height={50} 
            style={styles.icon}
          />
          <View style={styles.weatherInfo}>
            <Text style={styles.code}>代码: {code}</Text>
            <Text style={styles.description}>
              {getWeatherDescription(code)}
            </Text>
            <Text style={styles.category}>
              类别: {getWeatherCategory(code)}
            </Text>
            <Text style={styles.valid}>
              有效: {isValidWeatherCode(code) ? '是' : '否'}
            </Text>
          </View>
        </View>
      ))}

      {/* 自定义样式示例 */}
      <View style={styles.customExample}>
        <Text style={styles.subtitle}>自定义样式示例</Text>
        <WeatherSvg 
          code="15" 
          width={60} 
          height={60} 
          style={styles.customIcon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  category: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  valid: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  customExample: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  customIcon: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 10,
  },
});

export default WeatherSvgExample;
