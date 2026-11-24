import { storage } from "./mmkv";
import { UserData } from "./types";

const KEY = "userData";

export const loadUserData = (): UserData => {
  const empty: UserData = { favoriteMosques: [], lastVisitedMosque: null };
  try {
    return { ...empty, ...JSON.parse(storage.getString(KEY) ?? "{}") };
  } catch (error) {
    console.error("Error loading user data:", error);
    return empty;
  }
};

export const saveUserData = (userData: UserData): void =>
  storage.set(KEY, JSON.stringify(userData));
