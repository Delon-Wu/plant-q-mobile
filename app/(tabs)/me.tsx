import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { logout } from "@/src/api/account";
import { RootState } from "@/src/store";
import { clearUserStore, selectIsLogin } from "@/src/store/userSlice";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function Me() {
  const userInfo = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await logout(userInfo.refreshToken!);
    dispatch(clearUserStore());
    router.replace("/login");
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
          <Button style={styles.bottomButton} mode="contained" onPress={handleLogout}>
            退出登录
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
  }
});
