import ActionSelector, { Action } from "@/components/ActionSelector";
import BlinkingText from "@/components/BlinkingText";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useTheme";
import { store } from "@/src/store";
import request from '@/src/utils/request';
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
import Markdown from "react-native-markdown-display";
import { Button } from "react-native-paper";
import EventSource from "react-native-sse";

const SYSTEM_PROMPT = `你是一名专业的植物学家和园艺顾问，专注于为用户提供准确、易懂的植物养护解决方案。你的回答需结合科学知识和实际经验，语言亲切自然，适合普通用户理解。  

**回答要求：**  
1. **精准性**：根据用户提供的植物名称（如用户未说明，需主动询问）给出针对性建议，避免笼统回答。  
2. **结构化**：分点列出关键信息（如光照、浇水、土壤、常见问题），必要时用符号/emoji（🌞💧）增强可读性。  
3. **问题解决**：若用户描述植物异常（如黄叶、枯萎），先分析可能原因（缺水/病虫害等），再提供步骤化解决建议。  
4. **安全提示**：涉及农药、修剪等操作时，需标注安全注意事项。  
5. **主动追问**：若信息不足（如未说明植物类型或环境），礼貌请求用户补充细节。  

**示例回答风格：**  
『您的绿萝出现黄叶，可能是以下原因：  
1. **过度浇水**💧：绿萝喜湿润但忌积水，建议每周浇水1-2次，保持土壤微湿即可。  
2. **光照不足**🌞：移至明亮散射光处，避免阳光直射。  
...  
需要更具体的帮助吗？请告诉我您的养护环境（如室内/阳台）~』  

**禁止事项：**  
- 避免模糊表述（如“多浇水”），需量化建议（如“夏季每周浇水3次”）。  
- 不回答与植物无关的问题。`;

interface MessageLine {
  function_call?: {
    name: string;
    arguments: {
      image_url: string;
    };
  };
  isStreaming?: boolean;
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

const QAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [quickAskEnabled, setQuickAskEnabled] = useState(false);
  const [quickAsk, setQuickAsk] = useState("");
  const [showImageSelect, setShowImageSelect] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const colors = useThemeColor();
  const baseURL = store.getState().settings.baseURL;
  const accessToken = store.getState().user.accessToken;

  // 图片选择逻辑
  const takePhoto = async () => {
    setShowImageSelect(false);
    // 1. 先请求相机权限
    // const { status } = await ImagePicker.requestCameraPermissionsAsync();
    // if (status !== "granted") {
    //   Alert.alert("权限不足", "请在设置中允许访问相机以拍摄照片。");
    //   return;
    // }
    // 2. 打开相机
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log("image result-->", result);
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
      // setQuickAskEnabled(true);
    }
  };

  const choosePhoto = async () => {
    setShowImageSelect(false);
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
      // setQuickAskEnabled(true);
    }
  };

  const actions: Action[] = [
    {
      label: "拍照",
      icon: Ionicons,
      iconProps: { name: "camera", size: 14, color: "white" },
      onPress: takePhoto,
    },
    {
      label: "从相册选择",
      icon: Ionicons,
      iconProps: { name: "images", size: 14, color: "white" },
      onPress: choosePhoto,
    },
  ];

  // 发送逻辑
  const handleSend = async () => {
    if ((!input.trim() && !quickAsk) || isLoading || !accessToken) return;
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

      // TODO:  1. 将图片插进去 2. 优化黑暗模式的样式 3. 如果有图片，先上传图片到 百度 的植物图片识别接口
      // system prompt
      const systemPrompt = {
        role: "system",
        content: SYSTEM_PROMPT,
      };
      const allMessages = [
        systemPrompt,
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          ...(msg.function_call ? { function_call: msg.function_call } : {}),
        })),
        {
          role: userMessage.role,
          content: userMessage.content,
          ...(userMessage.function_call
            ? { function_call: userMessage.function_call }
            : {}),
        },
      ];
      const body = JSON.stringify({
        model: "deepseek-chat",
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      });
      request.post("/ai/chat", body)
        .then((response) => { 
          console.log('response-->', response)
          const eventSource = new EventSource(baseURL + "/ai/chat", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            method: "GET",
          });
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
        });
    } catch (error: any) {
      let errorMessage = "❌ 请求失败，请稍后再试";
      console.error("请求失败:", error);
      setIsLoading(false);
      if (error?.status === 401) {
        errorMessage = "啊哦，预算花完了，功能暂时停用，请耐心等待再次开放~ 😊";
      }
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: errorMessage,
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
      <ThemedView style={[styles.header, { borderColor: colors.outline }]}>
        <ThemedText style={styles.title}>Q助手</ThemedText>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="trash-outline" size={18} color={colors.text} />
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
                {
                  backgroundColor:
                    message.role === "user"
                      ? colors.secondaryContainer
                      : "white",
                },
              ]}
            >
              <ThemedText style={styles.messageRole}>
                {message.role === "user" ? "你" : "Q助手"}
              </ThemedText>
              <Markdown style={markdownStyles}>{message.content}</Markdown>
              {message.isStreaming && <BlinkingText>...</BlinkingText>}
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
        <ThemedView
          style={[styles.inputAreaContainer, { borderColor: colors.outline }]}
        >
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
                  // setQuickAskEnabled(false);
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
            placeholder="给 Q助手 发送消息"
            placeholderTextColor="#999"
            editable={!isLoading}
            multiline
          />
          <View style={styles.chatToolRow}>
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
              disabled={!(input.trim() || quickAsk) || isLoading || !accessToken}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={28}
                  color={
                    !(input.trim() || quickAsk) || isLoading || !accessToken
                      ? colors.surfaceDisabled
                      : colors.primary
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
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

const markdownStyles = {
  // body: {
  //   fontSize: 16,
  //   color: '#333',
  //   lineHeight: 22,
  // },
  // paragraph: {
  //   marginTop: 0,
  //   marginBottom: 8,
  // },
  // list_item: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   marginBottom: 4,
  // },
  // bullet_list: {
  //   marginBottom: 8,
  // },
  // ordered_list: {
  //   marginBottom: 8,
  // },
  // code_inline: {
  //   backgroundColor: '#f5f5f5',
  //   borderRadius: 4,
  //   paddingHorizontal: 4,
  //   fontFamily: 'monospace',
  // },
  // code_block: {
  //   backgroundColor: '#f5f5f5',
  //   borderRadius: 6,
  //   padding: 8,
  //   fontFamily: 'monospace',
  //   marginBottom: 8,
  // },
  // heading1: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   marginBottom: 8,
  // },
  // heading2: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: 6,
  // },
  // heading3: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   marginBottom: 4,
  // },
};

export default QAssistant;
