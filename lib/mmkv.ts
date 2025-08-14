// https://github.com/mrousavy/react-native-mmkv
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const resetStorage = () => {
  storage.clearAll()
}

export const getAllStorageKeys = () => {
  return storage.getAllKeys()
}