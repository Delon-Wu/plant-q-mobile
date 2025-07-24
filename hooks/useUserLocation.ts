import { setPosition } from '@/src/store/userSlice';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

// 位置获取配置选项
export interface LocationOptions {
  /** 位置精度 */
  accuracy?: Location.LocationAccuracy;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否自动获取位置 */
  autoFetch?: boolean;
  /** 是否在后台更新位置 */
  enableHighAccuracy?: boolean;
}

// Hook 返回值类型定义
export interface UseUserLocationReturn {
  /** 当前位置信息 */
  location: Location.LocationObject | null;
  /** 错误信息 */
  errorMsg: string | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否有位置权限 */
  hasPermission: boolean | null;
  /** 手动刷新位置 */
  refreshLocation: () => Promise<void>;
  /** 清除错误信息 */
  clearError: () => void;
}

// 默认配置
const DEFAULT_OPTIONS: Required<LocationOptions> = {
  accuracy: Location.LocationAccuracy.Balanced,
  timeout: 10000, // 10秒超时
  autoFetch: true,
  enableHighAccuracy: false,
};

/**
 * 用户位置 Hook
 * @param options 位置获取配置选项
 * @returns 位置信息和相关操作方法
 */
export function useUserLocation(options: LocationOptions = {}): UseUserLocationReturn {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const dispatch = useDispatch();
  
  // 使用 ref 防止组件卸载后的状态更新
  const isMountedRef = useRef<boolean>(true);
  
  // 合并配置选项
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 清除错误信息
  const clearError = useCallback(() => {
    setErrorMsg(null);
  }, []);

  // 检查并请求位置权限
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      // 首先检查位置服务是否启用
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        if (isMountedRef.current) {
          setHasPermission(false);
          setErrorMsg('设备位置服务未启用，请在系统设置中开启位置服务');
        }
        return false;
      }

      // 检查现有权限状态
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        if (isMountedRef.current) {
          setHasPermission(true);
        }
        return true;
      }

      // 请求权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      if (isMountedRef.current) {
        setHasPermission(granted);
        if (!granted) {
          if (status === 'denied') {
            setErrorMsg('位置权限被拒绝，请在应用设置中手动开启位置权限');
          } else {
            setErrorMsg('无法获取位置权限，请检查应用权限设置');
          }
        }
      }
      
      return granted;
    } catch (error) {
      console.warn('检查位置权限失败:', error);
      if (isMountedRef.current) {
        setHasPermission(false);
        setErrorMsg('检查位置权限时发生错误，请重试或检查设备设置');
      }
      return false;
    }
  }, []);

  // 获取当前位置
  const getCurrentLocation = useCallback(async (): Promise<Location.LocationObject | null> => {
    try {
      // 首先检查位置服务是否启用
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        throw new Error('位置服务未启用，请在设备设置中开启位置服务');
      }

      const locationOptions: Location.LocationOptions = {
        accuracy: config.accuracy,
        timeInterval: config.timeout,
        distanceInterval: 0,
      };

      if (config.enableHighAccuracy) {
        locationOptions.accuracy = Location.LocationAccuracy.BestForNavigation;
      }

      const position = await Location.getCurrentPositionAsync(locationOptions);
      console.log('position-->', position);
      return position;
    } catch (error) {
      console.error('Error getting current position:', error);
      
      // 处理特定的错误类型
      let errorMessage = '获取位置失败';
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('location services') || message.includes('location is unavailable')) {
          errorMessage = '位置服务不可用，请检查设备设置中的位置服务是否已开启';
        } else if (message.includes('permission') || message.includes('denied')) {
          errorMessage = '位置权限被拒绝，请在应用设置中允许位置访问';
        } else if (message.includes('timeout')) {
          errorMessage = '位置获取超时，请检查网络连接或重试';
        } else if (message.includes('accuracy')) {
          errorMessage = '位置精度不足，请确保GPS信号良好';
        } else {
          errorMessage = `位置获取失败: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }, [config.accuracy, config.timeout, config.enableHighAccuracy]);

  // 刷新位置信息
  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setErrorMsg(null);

    try {
      // 检查权限
      const hasPermissionGranted = await checkPermission();
      if (!hasPermissionGranted) {
        return;
      }

      // 获取位置
      const position = await getCurrentLocation();
      
      if (isMountedRef.current && position) {
        setLocation(position);
        dispatch(setPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude }));
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        setErrorMsg(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [checkPermission, getCurrentLocation]);

  // 初始化获取位置
  useEffect(() => {
    if (config.autoFetch) {
      refreshLocation();
    }
  }, [config.autoFetch, refreshLocation]);

  // 清理函数
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    location,
    errorMsg,
    loading,
    hasPermission,
    refreshLocation,
    clearError,
  };
}