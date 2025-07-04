import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getUserInfo, login } from "@/src/api/account";
import { setToken, setUserInfo } from "@/src/store/userSlice";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostTapCount, setHostTapCount] = useState(0);
  const dispatch = useDispatch();
  const lastTapTime = useRef<number>(0);

  const handleLogin = () => {
    login(email, password)
      .then(({ data }) => {
        if (data.code === 200) {
          // TODO: Store tokens in secure storage
          dispatch(
            setToken({
              accessToken: data.data.access,
              refreshToken: data.data.refresh,
            })
          );
          return Promise.resolve();
        }
        return Promise.reject(new Error(data.message || "登录失败"));
      })
      .then(() => {
        getUserInfo().then(({ data }) => {
          dispatch(
            setUserInfo({
              name: data.username,
              email: data.email,
              phone: data.phone,
            })
          );
          router.push("/");
        });
      });
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleHostPress = () => {
    const now = Date.now();
    if (now - lastTapTime.current > 1000) {
      setHostTapCount(1);
      lastTapTime.current = now;
    } else {
      const nextCount = hostTapCount + 1;
      setHostTapCount(nextCount);
      lastTapTime.current = now;
      if (nextCount >= 8) {
        setHostTapCount(0);
        lastTapTime.current = 0;
        router.push("/host");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        登录
      </ThemedText>

      <TextInput
        label="邮箱"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <ThemedView style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          登录
        </Button>

        <Button mode="outlined" onPress={handleRegister} style={styles.button}>
          注册
        </Button>

        <Button
          mode="outlined"
          onPress={handleHostPress}
          style={styles.setHostButton}
        >
          设置服务器地址
        </Button>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    marginTop: 10,
  },
  setHostButton: {
    marginTop: 20,
    opacity: 0,
  },
});
