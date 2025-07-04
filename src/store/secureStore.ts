import * as SecureStore from 'expo-secure-store';

export const SecureStoreStorage = {
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(normalizeKey(key), value);
  },
  async getItem(key: string) {
    return await SecureStore.getItemAsync(normalizeKey(key));
  },
  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(normalizeKey(key));
  },
};

function normalizeKey(key: string): string {
  // Replace invalid characters with underscore
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}
