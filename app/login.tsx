import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import customToast from "@/components/Toast";
import { useToast } from "@/components/ui/toast";
import { getUserInfo, login, sendVerificationCode, verifyCode } from "@/src/api/account";
import { setToken, setUserBasicInfo } from "@/src/store/userSlice";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostTapCount, setHostTapCount] = useState(0);
  const [loginFailCount, setLoginFailCount] = useState(0);
  const [needVerification, setNeedVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const lastTapTime = useRef<number>(0);
  const tost = useToast();
  const { showToast } = customToast(tost);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      showToast({ title: "请填写邮箱", action: "error" });
      return;
    }
    setIsSendingCode(true);
    setCountdown(60);
    try {
      const res = await sendVerificationCode({ email });
      if (res.data.code === 200) {
        showToast({ title: "验证码已发送", action: "success" });
      } else {
        showToast({
          title: res.data.message || "验证码发送失败",
          action: "error",
        });
        setIsSendingCode(false);
        setCountdown(0);
      }
    } catch {
      showToast({ title: "验证码发送失败", action: "error" });
      setIsSendingCode(false);
      setCountdown(0);
    }
  };

  // 倒计时效果
  React.useEffect(() => {
    let timer: number;
    if (isSendingCode && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsSendingCode(false);
    }
    return () => clearTimeout(timer);
  }, [isSendingCode, countdown]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    // 当邮箱改变时重置验证状态
    if (newEmail !== email) {
      setLoginFailCount(0);
      setNeedVerification(false);
      setVerificationCode("");
    }
  };

  const handleLogin = async () => {
    // 如果需要验证码验证，先验证验证码
    if (needVerification) {
      if (!verificationCode) {
        showToast({ title: "请输入验证码", action: "error" });
        return;
      }
      
      try {
        const verifyRes = await verifyCode({ email, code: verificationCode });
        if (verifyRes.data.code !== 200) {
          showToast({
            title: verifyRes.data.message || "验证码错误",
            action: "error",
          });
          return;
        }
      } catch {
        showToast({ title: "验证码校验失败", action: "error" });
        return;
      }
    }

    try {
      const { data } = await login(email, password);
      if (data.code === 200) {
        // 登录成功，重置失败计数
        setLoginFailCount(0);
        setNeedVerification(false);
        setVerificationCode("");
        
        // TODO: Store tokens in secure storage
        dispatch(
          setToken({
            accessToken: data.data.access,
            refreshToken: data.data.refresh,
          })
        );
        
        const userInfo = await getUserInfo();
        dispatch(
          setUserBasicInfo({
            name: userInfo.data.username,
            email: userInfo.data.email,
            phone: userInfo.data.phone,
          })
        );
        router.replace("/");
      } else {
        handleLoginFailure(data.message || "请检查您的邮箱和密码");
      }
    } catch (err: any) {
      handleLoginFailure(err.msg || "登录失败，请重试");
    }
  };

  const handleLoginFailure = (message: string) => {
    const newFailCount = loginFailCount + 1;
    setLoginFailCount(newFailCount);
    
    if (newFailCount >= 5) {
      setNeedVerification(true);
      showToast({ 
        title: "登录失败次数过多，请通过邮箱验证后重试", 
        action: "error" 
      });
    } else {
      const remainingAttempts = 5 - newFailCount;
      showToast({ 
        title: `${message}（还有${remainingAttempts}次尝试机会）`, 
        action: "error" 
      });
    }
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
        onChangeText={handleEmailChange}
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

      {needVerification && (
        <ThemedView style={styles.verificationContainer}>
          <ThemedText style={styles.verificationText}>
            登录失败次数过多，请通过邮箱验证后重试
          </ThemedText>
          <ThemedView style={styles.verificationRow}>
            <TextInput
              label="邮箱验证码"
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.verificationInput}
              mode="outlined"
            />
            <Button
              mode="outlined"
              onPress={handleSendCode}
              disabled={isSendingCode || !email}
              style={styles.sendCodeButton}
            >
              {isSendingCode ? `重新发送(${countdown}s)` : "发送验证码"}
            </Button>
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          登录
        </Button>

        <Button mode="text" onPress={handleRegister} style={styles.button}>
          还没有账号？注册一个
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
  verificationContainer: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  verificationText: {
    fontSize: 14,
    marginBottom: 12,
    color: "#ff9800",
    textAlign: "center",
  },
  verificationRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  verificationInput: {
    flex: 1,
    marginBottom: 0,
  },
  sendCodeButton: {
    marginBottom: 0,
    paddingHorizontal: 12,
  },
});
