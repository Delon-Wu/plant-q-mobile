import { ThemedText } from "@/components/ThemedText";
import ThemeScrollView from "@/components/ThemeScrollView";
import { logout } from "@/src/api/account";
import { AccessToken, RefreshToken } from "@/src/constant/localStorageKey";
import { RootState } from "@/src/store";
import { clearUserInfo, selectIsLogin } from "@/src/store/userSlice";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function TabTwoScreen() {

  const userInfo = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await logout(userInfo.refreshToken!);
    dispatch(clearUserInfo());
    router.replace("/login");
  };

  return (
    <ThemeScrollView>
      {/* 用户信息 */}
      {userInfo.email ? (
        <>
          <ThemedText>用户名：{userInfo.name}</ThemedText>
          <ThemedText>邮箱：{userInfo.email}</ThemedText>
        </>
      ) : null
    }

      {selectIsLogin(userInfo) ? (
        <Button mode="contained" onPress={handleLogout}>
          退出登录
        </Button>
      ) : <Button mode="contained" onPress={() => router.push("/login")}>
          登录
        </Button>}
    </ThemeScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
