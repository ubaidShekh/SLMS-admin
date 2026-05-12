// utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const setItem = async (key, value) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

export const getItem = async (key) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

export const removeItem = async (key) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};
