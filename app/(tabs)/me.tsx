import { ThemedText } from "@/components/ThemedText";
import ThemeScrollView from "@/components/ThemeScrollView";
import { logout } from "@/src/api/account";
import { AccessToken, RefreshToken } from "@/src/constant/localStorageKey";
import { RootState } from "@/src/store";
import { clearUserInfo } from "@/src/store/userSlice";
import { router } from "expo-router";
import { useEffect, useState } from "react"; // 引入 React 的 useEffect 和 useState
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(true); // 加载状态

  const userInfo = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserInfo = async () => {
      
    };

    fetchUserInfo(); // 组件首次渲染时调用
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  const handleLogout = () => {
    logout()
    .then(() => {
      dispatch(clearUserInfo());
      localStorage.removeItem(AccessToken);
      localStorage.removeItem(RefreshToken);
      router.replace("/login");
    });
  };

  return (
    <ThemeScrollView>
      {/* 显示用户信息 */}
      {userInfo.name && (
        <>
          <ThemedText>用户名：{userInfo.name}</ThemedText>
          <ThemedText>邮箱：{userInfo.email}</ThemedText>
        </>
      )}
      <Button mode="contained" onPress={handleLogout}>
        退出登录
      </Button>

    </ThemeScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
