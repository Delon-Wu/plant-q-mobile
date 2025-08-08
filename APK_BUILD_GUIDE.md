# APK 打包指南

## 配置说明

已配置了三种构建类型：

### 1. 开发版本 (development)
```bash
eas build --profile development --platform android
```
- 用于开发测试
- 包含开发客户端

### 2. 预览版本 (preview)
```bash
eas build --profile preview --platform android
```
- 生成 APK 文件
- 用于内部测试和分发

### 3. 生产版本 (production)
```bash
eas build --profile production --platform android
```
- 生成 APK 文件
- 自动递增版本号
- 用于正式发布

### 4. 专用 APK 构建 (apk)
```bash
eas build --profile apk --platform android
```
- 专门用于生成 APK 文件
- 使用 Gradle 的 assembleRelease 任务

## 使用步骤

1. **安装 EAS CLI**（如果还没有安装）：
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **登录 Expo 账号**：
   ```bash
   eas login
   ```

3. **构建 APK**：
   ```bash
   # 推荐使用 preview 配置构建 APK
   eas build --profile preview --platform android
   
   # 或者使用专用的 apk 配置
   eas build --profile apk --platform android
   ```

4. **下载 APK**：
   构建完成后，EAS 会提供下载链接，您可以直接下载 APK 文件到本地。

## 注意事项

- 首次构建可能需要较长时间（20-30分钟）
- 确保网络连接稳定
- APK 文件可以直接安装到 Android 设备上进行测试
- 如果需要上传到 Google Play Store，建议使用 AAB 格式（移除 `"buildType": "apk"` 配置）

## 本地构建（可选）

如果需要本地构建，可以使用：
```bash
eas build --profile preview --platform android --local
```

需要先安装 Android SDK 和相关构建工具。
