import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { setPosition } from '../src/store/userSlice';

interface LocationManager {
  getUserLocation: (forceRefresh?: boolean) => Promise<string>;
  getCachedPosition: () => { latitude: number | null; longitude: number | null };
  hasValidPosition: () => boolean;
}

export const useLocationManager = (): LocationManager => {
  const dispatch = useDispatch();
  const position = useSelector((state: RootState) => state.user.position);

  const getCachedPosition = () => position;

  const hasValidPosition = () => {
    return position.latitude !== null && position.longitude !== null;
  };

  const getUserLocation = async (forceRefresh = false): Promise<string> => {
    // 如果有缓存的位置且不强制刷新，直接使用缓存
    if (!forceRefresh && hasValidPosition()) {
      return `${position.latitude}:${position.longitude}`;
    }

    try {
      // 请求位置权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        // 权限被拒绝，如果有缓存位置则使用缓存，否则使用默认位置
        if (hasValidPosition()) {
          return `${position.latitude}:${position.longitude}`;
        } else if (process.env.NODE_ENV === 'development') {
          return '深圳'; // 开发环境默认位置
        } else {
          return '北京'; // 生产环境默认位置
        }
      }

      console.log('开始获取位置信息...');
      
      // 设置超时机制
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // 使用平衡模式，比 Low 稍高但比 High 快
        timeInterval: 3000, // 减少到3秒
        distanceInterval: 5000, // 5公里距离变化才更新
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Location timeout')), 8000); // 8秒超时
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      if (location?.coords) {
        const { latitude, longitude } = location.coords;
        console.log('成功获取位置:', latitude, longitude);
        
        // 缓存位置到 Redux store
        dispatch(setPosition({ latitude, longitude }));
        
        return `${latitude}:${longitude}`;
      } else {
        throw new Error('Unable to get location coordinates');
      }
    } catch (error) {
      console.error('获取位置失败:', error);
      
      // 尝试获取最后已知位置作为备选方案
      try {
        console.log('尝试获取最后已知位置...');
        const lastKnownPosition = await Location.getLastKnownPositionAsync({
          maxAge: 300000, // 接受5分钟内的位置
          requiredAccuracy: 5000, // 精度要求放宽到5公里
        });
        
        if (lastKnownPosition?.coords) {
          const { latitude, longitude } = lastKnownPosition.coords;
          console.log('使用最后已知位置:', latitude, longitude);
          
          // 缓存位置到 Redux store
          dispatch(setPosition({ latitude, longitude }));
          
          return `${latitude}:${longitude}`;
        }
      } catch (lastKnownError) {
        console.warn('获取最后已知位置也失败:', lastKnownError);
      }
      
      // 发生错误时的降级策略
      if (hasValidPosition()) {
        console.log('使用缓存位置');
        // 如果有缓存位置，使用缓存
        return `${position.latitude}:${position.longitude}`;
      } else if (process.env.NODE_ENV === 'development') {
        console.log('开发环境使用默认位置: 深圳');
        // 开发环境使用默认位置
        return '深圳';
      } else {
        console.log('生产环境使用默认位置: 北京');
        // 生产环境可以使用一个默认的大城市
        return '北京';
      }
    }
  };

  return {
    getUserLocation,
    getCachedPosition,
    hasValidPosition,
  };
};
