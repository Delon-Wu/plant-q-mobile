import PictureSelector from "@/components/PictureSelector";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useTheme";
import { addPlantRecord, getPlantDetail, updatePlant } from "@/src/api/plant";
import { getFileObject, getFileObjectWeb } from "@/src/utils/common";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

const { width } = Dimensions.get("window");
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
  const [showImageSelect, setShowImageSelect] = useState(false);
  const [recordDialogVisible, setRecordDialogVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [recordForm, setRecordForm] = useState<{
    remark: string;
    image: string | null;
  }>({ remark: "", image: null });
  const [recordFormLoading, setRecordFormLoading] = useState(false);

  // 编辑植物弹窗相关状态
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    cover: string | File | null;
  }>({ name: "", cover: null });
  const [editFormLoading, setEditFormLoading] = useState(false);

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
      console.error("获取植物详情失败:", error);
      Alert.alert("错误", "获取植物详情失败，请重试");
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
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePictureSelect = (uri: string) => {
    setShowImageSelect(false);
    setRecordForm({ ...recordForm, image: uri });
  };

  const sortedRecords =
    plant?.records.sort(
      (a, b) =>
        new Date(b.record_time).getTime() - new Date(a.record_time).getTime()
    ) || [];

  const submitRecord = async () => {
    setRecordFormLoading(true);
    try {
      await addPlantRecord(id, {
        remark: recordForm.remark,
        image:
          Platform.OS === "web"
            ? getFileObjectWeb(recordForm.image as string)!
            : getFileObject(recordForm.image!),
      });
      // 刷新列表
      fetchPlantDetail();
      setRecordDialogVisible(false);
      setRecordForm({ remark: "", image: null });
    } catch (err) {
      Alert.alert("添加失败");
    } finally {
      setRecordFormLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: "植物详情",
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
            title: "植物详情",
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 植物封面和基本信息 */}
        <View
          style={[styles.headerSection, { backgroundColor: cardBackground }]}
        >
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
            <View
              style={[styles.emptyRecords, { backgroundColor: cardBackground }]}
            >
              <TouchableOpacity>
                <Feather name="coffee" size={48} color={textColor} />
              </TouchableOpacity>

              <ThemedText style={styles.emptyText}>暂无成长记录</ThemedText>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {sortedRecords.map((record, index) => (
                <TouchableOpacity
                  key={record.id}
                  style={[
                    styles.recordItem,
                    { backgroundColor: cardBackground },
                  ]}
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
              source={{
                uri: selectedImage.startsWith("http")
                  ? selectedImage
                  : HOST + selectedImage,
              }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      )}

      <Portal>
        <FAB.Group
          icon="menu"
          visible
          open={fabOpen}
          style={styles.fab}
          actions={[
            {
              icon: "camera",
              onPress: () => setRecordDialogVisible(true),
            },
            {
              icon: ({ color, size }) => (
                <AntDesign name="edit" size={size} color={color} />
              ),
              onPress: () => {
                setEditForm({ name: plant.name, cover: plant.cover });
                setEditDialogVisible(true);
              },
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
        {/* 新增成长记录弹窗 */}
        <Dialog
          visible={recordDialogVisible}
          onDismiss={() => setRecordDialogVisible(false)}
        >
          <Dialog.Title>新增成长记录</Dialog.Title>
          <Dialog.Content>
            <Text>请输入记录备注和记录图片：</Text>
            <View style={{ marginTop: 12 }}>
              <ThemedText>植物封面</ThemedText>
              <Button
                style={{ marginBottom: 12 }}
                mode="outlined"
                onPress={() => setShowImageSelect(true)}
              >
                {recordForm.image ? "已选择图片" : "选择图片"}
              </Button>
              <ThemedText>备注</ThemedText>
              <TextInput
                value={recordForm.remark}
                onChangeText={(text) =>
                  setRecordForm((f) => ({ ...f, remark: text }))
                }
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  marginTop: 6,
                  marginVertical: 6,
                }}
                placeholder="请输入备注"
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRecordDialogVisible(false)}>取消</Button>
            <Button
              loading={recordFormLoading}
              disabled={!recordForm.image}
              onPress={submitRecord}
            >
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* 编辑植物弹窗 */}
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>编辑植物信息</Dialog.Title>
          <Dialog.Content>
            <Text>修改植物名称和封面：</Text>
            <View style={{ marginTop: 12 }}>
              <ThemedText>植物名称</ThemedText>
              <TextInput
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm((f) => ({ ...f, name: text }))
                }
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  marginTop: 6,
                  marginBottom: 12,
                }}
                placeholder="请输入名称"
              />
              <ThemedText>植物封面</ThemedText>
              <Button
                style={{ marginVertical: 6 }}
                mode="outlined"
                onPress={() => {
                  // 选择图片，兼容 web/native
                  if (Platform.OS === "web") {
                    setShowImageSelect(true);
                  } else {
                    setShowImageSelect(true);
                  }
                }}
              >
                {editForm.cover ? "已选择图片" : "重选封面"}
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>取消</Button>
            <Button
              loading={editFormLoading}
              disabled={!editForm.name || !editForm.cover}
              onPress={async () => {
                setEditFormLoading(true);
                try {
                  let coverFile = editForm.cover;
                  if (Platform.OS === "web" && typeof coverFile === "string") {
                    coverFile = getFileObjectWeb(coverFile);
                  } else if (
                    Platform.OS !== "web" &&
                    typeof coverFile === "string"
                  ) {
                    coverFile = getFileObject(coverFile);
                  }

                  console.log('editForm, coverFile-->', editForm, coverFile)
                  await updatePlant(id!, {
                    name: editForm.name,
                    cover: coverFile,
                  });
                  await fetchPlantDetail();
                  setEditDialogVisible(false);
                } catch (err) {
                  Alert.alert("编辑失败");
                } finally {
                  setEditFormLoading(false);
                }
              }}
            >
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <PictureSelector
        isOpen={showImageSelect}
        onClose={() => setShowImageSelect(false)}
        onChange={handlePictureSelect}
      />
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
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
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  coverImage: {
    width: "100%",
    height: 200,
  },
  plantInfo: {
    padding: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  recordCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyRecords: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
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
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
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
    fontWeight: "500",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: width - 40,
    height: "70%",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    zIndex: 10,
  },
});
