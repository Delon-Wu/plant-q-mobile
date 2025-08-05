import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useTheme';
import { getPlantDetail } from '@/src/api/plant';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const HOST = process.env.EXPO_PUBLIC_HOST || "http://localhost:8000";

type PlantRecord = {
  id: number | string;
  plant: number | string;
  image: string;
  record_time: string;
  remark: string;
  created_at: string;
};

type Plant = {
  name: string;
  id: string | number;
  cover: string;
  records: PlantRecord[];
  created_at: string;
};

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const colors = useThemeColor();
  const backgroundColor = colors.background;
  const textColor = colors.text;
  const cardBackground = colors.surface;

  const fetchPlantDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPlantDetail(id!);
      setPlant(response.data);
    } catch (error) {
      console.error('获取植物详情失败:', error);
      Alert.alert('错误', '获取植物详情失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPlantDetail();
    }
  }, [id, fetchPlantDetail]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedRecords = plant?.records.sort((a, b) => 
    new Date(b.record_time).getTime() - new Date(a.record_time).getTime()
  ) || [];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: '植物详情',
            headerShown: true,
            headerStyle: { backgroundColor },
            headerTintColor: textColor,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColor} />
          <ThemedText style={styles.loadingText}>加载中...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!plant) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: '植物详情',
            headerShown: true,
            headerStyle: { backgroundColor },
            headerTintColor: textColor,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={textColor} />
          <ThemedText style={styles.errorText}>未找到植物信息</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: textColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.retryButtonText}>返回</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: plant.name,
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 植物封面和基本信息 */}
        <View style={[styles.headerSection, { backgroundColor: cardBackground }]}>
          <Image
            source={{ uri: HOST + plant.cover }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.plantInfo}>
            <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
            <ThemedText style={styles.createTime}>
              创建时间: {formatDate(plant.created_at)}
            </ThemedText>
          </View>
        </View>

        {/* 记录列表 */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <ThemedText style={styles.sectionTitle}>成长记录</ThemedText>
            <ThemedText style={styles.recordCount}>
              共 {sortedRecords.length} 条记录
            </ThemedText>
          </View>

          {sortedRecords.length === 0 ? (
            <View style={[styles.emptyRecords, { backgroundColor: cardBackground }]}>
              <Ionicons name="camera-outline" size={48} color={textColor} />
              <ThemedText style={styles.emptyText}>暂无成长记录</ThemedText>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {sortedRecords.map((record, index) => (
                <TouchableOpacity
                  key={record.id}
                  style={[styles.recordItem, { backgroundColor: cardBackground }]}
                  onPress={() => setSelectedImage(record.image)}
                >
                  <Image
                    source={{ uri: HOST + record.image }}
                    style={styles.recordImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recordContent}>
                    <ThemedText style={styles.recordTime}>
                      {formatDate(record.record_time)}
                    </ThemedText>
                    {record.remark && (
                      <ThemedText style={styles.recordRemark}>
                        {record.remark}
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={textColor}
                    style={styles.recordArrow}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <TouchableOpacity
          style={styles.imageModal}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage.startsWith('http') ? selectedImage : HOST + selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
  },
  headerSection: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  createTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  recordsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recordCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyRecords: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  recordsList: {
    gap: 12,
  },
  recordItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
  },
  recordImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  recordContent: {
    flex: 1,
    marginLeft: 12,
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recordRemark: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  recordArrow: {
    marginLeft: 8,
  },
  imageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: width - 40,
    height: '70%',
  },
});
