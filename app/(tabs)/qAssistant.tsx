import Select from '@/components/Select';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
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
  View
} from 'react-native';
import EventSource from 'react-native-sse';

const Q助手ChatApp = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quickAskEnabled, setQuickAskEnabled] = useState(false);
  const [quickAsk, setQuickAsk] = useState('');
  const [showImageSelect, setShowImageSelect] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY; // TODO: 通过加密方式存储和获取API密钥


  // 图片选择逻辑
  const handleImageSelect = async (option: string) => {
    let result;
    if (option === 'camera') {
      result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    } else if (option === 'file') {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    }
    if (!result?.cancelled && result?.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
      setQuickAskEnabled(true);
    }
  };

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
        name: 'ask_plant_type',
        arguments: { image_url: selectedImage }
      };
    }
    // 添加用户消息
    const userMessage = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-user`),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...(functionCall ? { function_call: functionCall } : {})
    };
    setMessages(prev => [...prev, userMessage]);
    // 添加占位消息
    const assistantMessage = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-assistant`),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages(prev => [...prev, assistantMessage]);
    setInput('');
    setQuickAsk('');
    setIsLoading(true);
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      const body = JSON.stringify({
        model: 'deepseek-chat',
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.function_call ? { function_call: msg.function_call } : {})
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      });
      const eventSource = new EventSource('https://api.deepseek.com/chat/completions', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        method: 'POST',
        body: body,
      });
      eventSourceRef.current = eventSource;
      let fullResponse = '';
      eventSource.addEventListener('message', (event) => {
        if (event.data === '[DONE]') {
          eventSource.close();
          return;
        }
        try {
          const parsed = JSON.parse(event.data ?? '');
          const content = parsed.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: fullResponse
                };
              }
              return updated;
            });
          }
        } catch (error) {
          console.error('解析错误:', error);
        }
      });
      eventSource.addEventListener('error', (event) => {
        console.error('SSE错误:', event);
        if (event.type === 'error') {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: '❌ 请求失败，请检查API密钥和网络连接',
                isStreaming: false
              };
            }
            return updated;
          });
          setIsLoading(false);
          eventSource.close();
        }
      });
      eventSource.addEventListener('close', () => {
        setIsLoading(false);
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false
            };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error('请求失败:', error);
      setIsLoading(false);
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: '❌ 请求失败，请检查API密钥和网络连接',
            isStreaming: false
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
    Alert.alert(
      '清除聊天',
      '确定要清除所有聊天记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => setMessages([]) }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* 标题栏 */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Q助手</ThemedText>
        <TouchableOpacity onPress={clearChat}>
          <ThemedText style={styles.clearButton}>清除</ThemedText>
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
            <ThemedText style={styles.welcomeTitle}>Q助手 API 聊天</ThemedText>
            <ThemedText style={styles.welcomeText}>
              输入消息开始与Q助手对话。消息将实时流式传输显示。
            </ThemedText>
            <ThemedText style={styles.welcomeTip}>
              提示: 确保已设置有效的API密钥
            </ThemedText>
          </ThemedView>
        ) : (
          messages.map((message, index) => (
            <ThemedView
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble
              ]}
            >
              <ThemedText style={styles.messageRole}>
                {message.role === 'user' ? '你' : 'Q助手'}
              </ThemedText>
              <ThemedText style={styles.messageContent}>
                {message.content}
                {message.isStreaming && (
                  <ThemedView style={styles.streamingIndicator}>
                    <ThemedView style={styles.streamingDot} />
                  </ThemedView>
                )}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>
      {/* 快速提问选项（默认禁用，选中图片后激活） */}
      <View style={styles.quickAskContainer}>
        <Select
          value={quickAsk}
          onValueChange={setQuickAsk}
          options={[{ label: '问植物类型', value: '请识别图片中的植物类型' }]}
          variant="underlined"
          placeholder="快速提问"
          disabled={!quickAskEnabled}
          style={styles.quickAskSelect}
        />
      </View>
      {/* 输入区域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.inputAreaContainer}>
          {/* 图片预览 */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => {
                setSelectedImage(null);
                setQuickAskEnabled(false);
                setQuickAsk('');
              }}>
                <Ionicons name="close-circle" size={24} color="#f44336" />
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
          {/* 图片选择按钮+Select */}
          <View style={styles.imageSelectRow}>
            {/* TODO: 使用gluestack 的acionsheet组件来实现 */}
            {/* <TouchableOpacity
              style={styles.imageAddBtn}
              onPress={() => setShowImageSelect(!showImageSelect)}
              disabled={isLoading}
            >
              <Ionicons name="camera-outline" size={28}/>
            </TouchableOpacity>
              <Select
                value=""
                onValueChange={(v) => {
                  setShowImageSelect(false);
                  handleImageSelect(v);
                }}
                options={[
                  { label: '拍照', value: 'camera' },
                  { label: '从文件系统选择图片', value: 'file' }
                ]}
                variant="underlined"
                placeholder="选择图片来源"
                style={styles.imageSelect}
              ></Select> */}
          </View>
          {/* 发送按钮右下角绝对定位 */}
          <TouchableOpacity
            style={[
              styles.sendButtonIcon,
              ((!(input.trim() || quickAsk) || isLoading || !API_KEY) && styles.sendButtonDisabledIcon)
            ]}
            onPress={handleSend}
            disabled={!(input.trim() || quickAsk) || isLoading || !API_KEY}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={28} color="white" />
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#f5f7fb',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  clearButton: {
    color: '#f44336',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
  welcomeTip: {
    fontSize: 14,
    color: '#f44336',
    fontStyle: 'italic',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3f51b5',
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  streamingIndicator: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginLeft: 2,
  },
  quickAskContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  quickAskSelect: {
    minWidth: 120,
    marginBottom: 5,
  },
  inputAreaContainer: {
    position: 'relative',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingBottom: 25,
    paddingTop: 10,
  },
  inputPlain: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    marginBottom: 8,
  },
  imageSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageAddBtn: {
    marginRight: 8,
    padding: 4,
  },
  imageSelect: {
    minWidth: 120,
  },
  sendButtonIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendButtonDisabledIcon: {
    backgroundColor: '#9fa8da',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#ffebee',
    padding: 10,
    alignItems: 'center',
  },
  apiKeyWarningText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
});

export default Q助手ChatApp;