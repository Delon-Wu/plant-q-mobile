import ActionSelector from "@/components/ActionSelector";
import BlinkingText from "@/components/BlinkingText";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useTheme";
import { DEEPSEEK_API_ADDRESS } from "@/src/constants/common";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import EventSource from "react-native-sse";

const QAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quickAskEnabled, setQuickAskEnabled] = useState(false);
  const [quickAsk, setQuickAsk] = useState("");
  const [showImageSelect, setShowImageSelect] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY; // TODO: 通过加密方式存储和获取API密钥
  const colors = useThemeColor();

  // 图片选择逻辑
  const takePhoto = async () => {
    console.log('-------------------Take Photo------------------')
    // 1. 先请求相机权限
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("权限不足", "请在设置中允许访问相机以拍摄照片。");
      return;
    }
    // 2. 打开相机
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
      setQuickAskEnabled(true);
    }
  };

  const choosePhoto = async () => {
    // 1. 先请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("权限不足", "请在设置中允许访问相册以选择图片。");
      return;
    }
    // 2. 打开相册
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
      setQuickAskEnabled(true);
    }
  };

  const actions = [
    {
      label: "拍照",
      icon: Ionicons,
      iconProps: { name: "camera", size: 14, color: "white" },
      onclose: takePhoto,
    },
    {
      label: "从相册选择",
      icon: Ionicons,
      iconProps: { name: "images", size: 14, color: "white" },
      onclose: choosePhoto,
    },
  ];

  // 发送逻辑
  const handleSend = async () => {
    if ((!input.trim() && !quickAsk) || isLoading || !API_KEY) return;
    let content = input;
    // 如果有快速提问，优先发送快速提问内容
    if (quickAsk) {
      content = quickAsk;
    }
    // 如果有图片，构造 function call 请求
    let functionCall = null;
    if (selectedImage && quickAsk) {
      functionCall = {
        name: "ask_plant_type",
        arguments: { image_url: selectedImage },
      };
    }
    // 添加用户消息
    const userMessage = {
      id: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-user`
      ),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      ...(functionCall ? { function_call: functionCall } : {}),
    };
    setMessages((prev) => [...prev, userMessage]);
    // 添加占位消息
    const assistantMessage = {
      id: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-assistant`
      ),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setInput("");
    setQuickAsk("");
    setIsLoading(true);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      const body = JSON.stringify({
        model: "deepseek-chat",
        messages: [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
          ...(msg.function_call ? { function_call: msg.function_call } : {}),
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      });
      console.log('DEEPSEEK_API_ADDRESS-->', DEEPSEEK_API_ADDRESS)
      const eventSource = new EventSource(
        DEEPSEEK_API_ADDRESS,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          method: "POST",
          body: body,
        }
      );
      eventSourceRef.current = eventSource;
      let fullResponse = "";
      eventSource.addEventListener("message", (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          return;
        }
        try {
          const parsed = JSON.parse(event.data ?? "");
          const content = parsed.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            setMessages((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: fullResponse,
                };
              }
              return updated;
            });
          }
        } catch (error) {
          console.error("解析错误:", error);
        }
      });
      eventSource.addEventListener("error", (event) => {
        console.error("SSE错误:", event);
        if (event.type === "error") {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: "❌ 请求失败，请稍后再试",
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsLoading(false);
          eventSource.close();
        }
      });
      eventSource.addEventListener("close", () => {
        setIsLoading(false);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
            };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error("请求失败:", error);
      setIsLoading(false);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "❌ 请求失败，请稍后再试",
            isStreaming: false,
          };
        }
        return updated;
      });
    }
  };

  // 滚动到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const clearChat = () => {
    Alert.alert("清除聊天", "确定要清除所有聊天记录吗？", [
      { text: "取消", style: "cancel" },
      { text: "确定", onPress: () => setMessages([]) },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      {/* 标题栏 */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Q助手</ThemedText>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="trash-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </ThemedView>
      {/* 聊天内容 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <ThemedView style={styles.welcomeContainer}>
            <ThemedText style={styles.welcomeTitle}>
              我是 Q助手，很高兴见到你！
            </ThemedText>
            <ThemedText style={styles.welcomeText}>
              我可以帮你回答关于植物的问题，或者提供一些有趣的植物知识。你可以直接输入问题，或者使用下面的按钮上传图片来获取植物识别结果。
            </ThemedText>
          </ThemedView>
        ) : (
          messages.map((message, index) => (
            <ThemedView
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
                { backgroundColor: message.role === "user" ? colors.secondaryContainer : "white"}
              ]}
            >
              <ThemedText style={styles.messageRole}>
                {message.role === "user" ? "你" : "Q助手"}
              </ThemedText>
              <ThemedText style={styles.messageContent}>
                {message.content}
                {1 && (
                  <BlinkingText>
                    ...
                  </BlinkingText>
                )}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>
      {/* 快速提问选项（默认禁用，选中图片后激活） */}
      <View style={styles.quickAskContainer}>
        <Button
          mode="outlined"
          disabled={!selectedImage}
          onPress={() => {}}
          style={styles.inlineButton}
        >
          问植物类型
        </Button>
      </View>
      {/* 输入区域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ThemedView style={styles.inputAreaContainer}>
          {/* 图片预览 */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => {
                  setSelectedImage(null);
                  setQuickAskEnabled(false);
                  setQuickAsk("");
                }}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          {/* 输入框单独一行，无边框 */}
          <TextInput
            style={styles.inputPlain}
            value={input}
            onChangeText={setInput}
            placeholder="输入消息..."
            placeholderTextColor="#999"
            editable={!isLoading}
            multiline
          />
          <View style={styles.chatToolRow}>
            {/* TODO: 使用gluestack 的acionsheet组件来实现 */}
            <TouchableOpacity
              style={styles.imageAddBtn}
              onPress={() => setShowImageSelect(!showImageSelect)}
              disabled={isLoading}
            >
              <Ionicons name="camera-outline" size={28} color={colors.text} />
            </TouchableOpacity>
            <ActionSelector
              isOpen={showImageSelect}
              onClose={() => setShowImageSelect(false)}
              actions={actions}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!(input.trim() || quickAsk) || isLoading || !API_KEY}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={28}
                  color={
                    !(input.trim() || quickAsk) || isLoading || !API_KEY
                      ? colors.surfaceDisabled
                      : colors.primary
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
      {/* API密钥设置提示 */}
      {!API_KEY && (
        <ThemedView style={styles.apiKeyWarning}>
          <ThemedText style={styles.apiKeyWarningText}>
            请设置有效的Q助手 API密钥
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0ff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 50,
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
  quickAskContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inlineButton: {
    alignSelf: "flex-start",
    minWidth: undefined,
    width: undefined,
    marginVertical: 0,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
  },
  inputAreaContainer: {
    position: "relative",
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0ff",
  },
  inputPlain: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    marginBottom: 8,
  },
  chatToolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  imageAddBtn: {
    marginRight: 26,
    padding: 4,
  },
  imageSelect: {
    minWidth: 120,
  },
  sendButtonIcon: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  removeImageBtn: {
    padding: 2,
  },
  apiKeyWarning: {
    backgroundColor: "#ffebee",
    padding: 10,
    alignItems: "center",
  },
  apiKeyWarningText: {
    color: "#f44336",
    fontWeight: "bold",
  },
});

export default QAssistant;
