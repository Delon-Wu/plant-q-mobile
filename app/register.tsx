import ThemedView from "@/components/ThemedView";
import customToast from "@/components/Toast";
import { useToast } from "@/components/ui/toast";
import { register, sendVerificationCode, verifyCode } from "@/src/api/account";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function Resgister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const toast = useToast();
  const { showToast } = customToast(toast);
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
    } catch (err) {
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

  const validateInputs = (): Promise<string | void> => {
    if (!username) {
      return Promise.reject("用户名不能为空");
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return !email
        ? Promise.reject("邮箱不能为空")
        : Promise.reject("请输入有效的邮箱地址");
    }

    const phonePattern = /^\d{10,15}$/; // 简单的手机号验证
    if (!phonePattern.test(phone)) {
      return !phone
        ? Promise.reject("手机号不能为空")
        : Promise.reject("请输入有效的手机号");
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/; // 密码至少6位，包含大小写字母和数字
    if (!passwordPattern.test(password)) {
      return !password
        ? Promise.reject("密码不能为空")
        : Promise.reject("密码至少6位，包含大小写字母和数字");
    }
    return Promise.resolve();
  };

  // 校验验证码并注册
  const handleVerifyAndRegister = () => {
    validateInputs()
      .then(async () => {
        if (!code) {
          showToast({ title: "请输入验证码", action: "error" });
          return;
        }
        try {
          const verifyRes = await verifyCode({ email, code });
          if (verifyRes.data.code === 200) {
            // 验证码通过，注册
            register({
              username,
              password,
              password2: password,
              phone,
              email,
            }).then((res: any) => {
              if (res.data) {
                showToast({
                  title: "注册成功",
                  action: "success",
                });
                router.push("/login");
              }
            }).catch((err: any) => {
              if (err.code === 400) {
                showToast({ title: '注册失败, 该邮箱已注册', action: "error" });
              }
            });
          } else {
            showToast({
              title: verifyRes.data.message || "验证码错误",
              action: "error",
            });
          }
        } catch (err: any) {
          showToast({ title: "验证码校验失败", description: err?.message ?? '', action: "error" });
        }
      })
      .catch((error) => {
        showToast({ title: error, action: "error" });
      });
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        label="用户名"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
      />

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

      <TextInput
        label="联系电话"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        mode="outlined"
      />

      <ThemedView style={styles.buttonContainer}>
        <TextInput
          label="邮箱验证码"
          value={code}
          onChangeText={setCode}
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="outlined"
          onPress={handleSendCode}
          disabled={isSendingCode}
          style={styles.button}
        >
          {isSendingCode ? `重新发送(${countdown}s)` : "发送验证码"}
        </Button>
        <Button
          mode="contained"
          onPress={handleVerifyAndRegister}
          style={styles.button}
        >
          注册
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
});
