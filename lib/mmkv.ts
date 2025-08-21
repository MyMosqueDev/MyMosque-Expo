// https://github.com/mrousavy/react-native-mmkv
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const resetStorage = async () => {
  storage.clearAll()
  await AsyncStorage.clear()
}

export const getAllStorageKeys = () => {
  return storage.getAllKeys()
}