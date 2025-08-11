import * as SecureStore from 'expo-secure-store';

export const SecureStoreStorage = {
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(normalizeKey(key), value);
    } catch (error) {
      console.warn('SecureStore setItem failed:', error);
      // 降级到普通存储或忽略错误
    }
  },
  async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(normalizeKey(key));
    } catch (error) {
      console.warn('SecureStore getItem failed:', error);
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(normalizeKey(key));
    } catch (error) {
      console.warn('SecureStore removeItem failed:', error);
    }
  },
};

function normalizeKey(key: string): string {
  // Replace invalid characters with underscore
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}
