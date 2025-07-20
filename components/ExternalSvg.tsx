import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface ExternalSvgProps {
  /** SVG文件的URL或本地路径 */
  source: string;
  /** 图标宽度，默认24 */
  width?: number;
  /** 图标高度，默认24 */
  height?: number;
  /** 图标颜色 */
  color?: string;
  /** 自定义样式 */
  style?: any;
  /** 加载失败时的回调 */
  onError?: (error: any) => void;
  /** 加载成功时的回调 */
  onLoad?: () => void;
  /** 是否显示加载指示器 */
  showLoading?: boolean;
  /** 加载指示器颜色 */
  loadingColor?: string;
}

/**
 * 外部SVG组件
 * 支持从URL或本地文件系统加载SVG文件
 * 
 * @example
 * ```tsx
 * // 从URL加载
 * <ExternalSvg 
 *   source="https://example.com/icon.svg"
 *   width={32} 
 *   height={32} 
 *   color="#007AFF" 
 * />
 * 
 * // 从本地文件加载
 * <ExternalSvg 
 *   source="file:///path/to/local/icon.svg"
 *   width={32} 
 *   height={32} 
 * />
 * ```
 */
export const ExternalSvg: React.FC<ExternalSvgProps> = ({
  source,
  width = 24,
  height = 24,
  color,
  style,
  onError,
  onLoad,
  showLoading = true,
  loadingColor = '#007AFF',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isUrl = source.startsWith('http://') || source.startsWith('https://');
  const isLocalFile = source.startsWith('file://');

  const loadLocalSvg = useCallback(async () => {
    try {
      // 这里可以根据需要实现本地文件读取逻辑
      // 由于React Native的限制，通常本地SVG文件需要通过require()引入
      setHasError(true);
      onError?.('本地文件加载需要使用require()方式引入');
    } catch (error) {
      setHasError(true);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (isLocalFile) {
      // 对于本地文件，我们需要读取文件内容
      loadLocalSvg();
    } else {
      setIsLoading(false);
    }
  }, [source, isLocalFile, loadLocalSvg]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const renderContent = () => {
    if (isLoading && showLoading) {
      return (
        <View style={[styles.container, { width, height }, style]}>
          <ActivityIndicator size="small" color={loadingColor} />
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={[styles.errorContainer, { width, height }, style]}>
          <Text style={styles.errorText}>⚠️</Text>
        </View>
      );
    }

    if (isUrl) {
      return (
        <SvgUri
          uri={source}
          width={width}
          height={height}
          fill={color}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
        />
      );
    }

    return (
      <View style={[styles.errorContainer, { width, height }, style]}>
        <Text style={styles.errorText}>?</Text>
      </View>
    );
  };

  return <View>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ExternalSvg;
