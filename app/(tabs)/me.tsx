import { useEffect, useState } from 'react'; // 引入 React 的 useEffect 和 useState

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getUserInfo } from '@/src/api/account';
import { StyleSheet } from 'react-native';

export default function TabTwoScreen() {
  const [userInfo, setUserInfo] = useState<{username: string, email: string, phone: string}>(); // 存储用户信息
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState<null | string>(null); // 错误信息

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo();
        setUserInfo(data.data);
        console.log('data-->', data)
      } catch (err) {
        // TODO: 报错
      } finally {
        setLoading(false);
        console.log('userInfo-->', userInfo)
      }
    };

    fetchUserInfo(); // 组件首次渲染时调用
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      {/* 显示加载状态 */}
      {loading && <ThemedText>正在加载用户信息...</ThemedText>}

      {/* 显示错误信息 */}
      {error && <ThemedText type="defaultSemiBold" style={{ color: 'red' }}>{error}</ThemedText>}

      {/* 显示用户信息 */}
      {userInfo && (
        <>
          <ThemedText>用户名：{userInfo.username}</ThemedText>
          <ThemedText>邮箱：{userInfo.email}</ThemedText>
        </>
      )}

      {/* 其他内容保持不变 */}
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* 其余部分保持原样 */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
