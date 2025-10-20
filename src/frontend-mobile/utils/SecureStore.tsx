// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as SecureStore from 'expo-secure-store';
// import { Platform } from 'react-native';

// export async function setItemAsync(key: string, value: string) {
//   if (Platform.OS !== 'web') {
//     await SecureStore.setItemAsync(key, value);
//   } else {
//     AsyncStorage.setItem(key, value);
//   }
// }

// export async function getItemAsync(key: string): Promise<string | null> {
//   if (Platform.OS !== 'web') {
//     return await SecureStore.getItemAsync(key);
//   } else {
//     return AsyncStorage.getItem(key);
//   }
// }

// export async function deleteItemAsync(key: string) {
//   if (Platform.OS !== 'web') {
//     await SecureStore.deleteItemAsync(key);
//   } else {
//     AsyncStorage.removeItem(key);
//   }
// }

import * as SecureStore from 'expo-secure-store';

export const getItemAsync = async (key: string) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

export const setItemAsync = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
};

export const deleteItemAsync = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
};
