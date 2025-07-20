import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import customToast from "@/components/Toast";
import { useToast } from "@/components/ui/toast";
import { logout } from "@/src/api/account";
import { RootState } from "@/src/store";
import { clearUserStore, selectIsLogin } from "@/src/store/userSlice";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function Me() {
  const userInfo = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();
  const { showToast } = customToast(toast);

  const handleLogout = async () => {
    // 显示确认对话框
    Alert.alert(
      "确认退出",
      "您确定要退出登录吗？",
      [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "确定",
          style: "destructive",
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // 只有当用户有 refreshToken 时才调用后端退出接口
      if (userInfo.refreshToken) {
        await logout(userInfo.refreshToken);
      }
      
      // 清除本地用户数据
      dispatch(clearUserStore());
      
      // 显示成功提示
      showToast({
        title: "退出成功",
        description: "已安全退出登录",
        action: "success"
      });
      
      // 导航到登录页面
      router.replace("/login");
    } catch (error) {
      console.error("退出登录失败:", error);
      
      // 即使网络请求失败，也要清除本地数据和导航
      dispatch(clearUserStore());
      router.replace("/login");
      
      // 显示警告提示
      showToast({
        title: "已本地退出",
        description: "网络请求失败，但已清除本地登录信息",
        action: "info"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* 用户信息 */}
      {userInfo.email ? (
        <ThemedView style={styles.inFoContainer}>
          <Avatar.Text
            label={userInfo.name.charAt(0).toUpperCase()}
            size={64}
          />
          <ThemedView>
            <ThemedText>你好！{userInfo.name}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: "gray" }}>
              {userInfo.email}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      ) : null}

      {/* 登录/退出按钮 */}
      <ThemedText style={{ marginBottom: 16 }}>
        {selectIsLogin(userInfo) ? (
          <Button
            style={styles.bottomButton}
            mode="contained"
            onPress={handleLogout}
            loading={isLoggingOut}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "退出中..." : "退出登录"}
          </Button>
        ) : (
          <Button
            style={styles.bottomButton}
            mode="contained"
            onPress={() => router.push("/login")}
          >
            登录
          </Button>
        )}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  inFoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bottomButton: {
    width: "100%",
  },
});
