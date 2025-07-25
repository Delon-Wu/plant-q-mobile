import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import * as Crypto from 'expo-crypto';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import EventSource from 'react-native-sse';

const DeepSeekChatApp = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const scrollViewRef = useRef<ScrollView | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 模拟API密钥存储（实际应用中应使用安全存储）
  useEffect(() => {
    // 这里应该从安全存储中获取API密钥
    setApiKey('sk-919d95fe290b4b168e8ee37381a4ea77');
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey) return;

    // 添加用户消息
    const userMessage = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-user`),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
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
    setIsLoading(true);

    try {
      // 关闭之前的连接（如果有）
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // 创建请求体
      const body = JSON.stringify({
        model: 'deepseek-chat',
        messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      });

      // 创建SSE连接
      const eventSource = new EventSource('https://api.deepseek.com/chat/completions', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
            
            // 更新最后一条消息
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
        
        // 标记流结束
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
        <ThemedText style={styles.title}>DeepSeek Chat</ThemedText>
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
            <ThemedText style={styles.welcomeTitle}>DeepSeek API 聊天</ThemedText>
            <ThemedText style={styles.welcomeText}>
              输入消息开始与DeepSeek AI对话。消息将实时流式传输显示。
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
                {message.role === 'user' ? '你' : 'DeepSeek'}
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
      
      {/* 输入区域 */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="输入消息..."
            placeholderTextColor="#999"
            editable={!isLoading}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!input.trim() || isLoading || !apiKey) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading || !apiKey}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText style={styles.sendButtonText}>发送</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
      
      {/* API密钥设置提示 */}
      {!apiKey && (
        <ThemedView style={styles.apiKeyWarning}>
          <ThemedText style={styles.apiKeyWarningText}>
            请设置有效的DeepSeek API密钥
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 25,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 150,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9fa8da',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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

export default DeepSeekChatApp;