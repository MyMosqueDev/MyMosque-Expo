import { loadAppSettings } from "@/lib/appSettings";
import { storage } from "@/lib/mmkv";
import { migrateAsyncStorage } from "@/lib/storageMigration";
import { loadUserData, saveUserData } from "@/lib/userData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const userData = { favoriteMosques: [], lastVisitedMosque: "mosque-1" };
const settings = {
  events: { enabled: false },
  announcements: { enabled: true },
  development: { enabled: false },
};

const seed = async () => {
  await AsyncStorage.setItem("userData", JSON.stringify(userData));
  await AsyncStorage.setItem("appSettings", JSON.stringify(settings));
  await AsyncStorage.setItem("devModeEnabled", "true");
};

it("moves everything an existing user has", async () => {
  await seed();
  await migrateAsyncStorage();
  expect(loadUserData()).toEqual(userData);
  expect(loadAppSettings()).toEqual(settings);
  expect(storage.getString("devModeEnabled")).toBe("true");
});

it("cleans up AsyncStorage afterwards, leaving other keys alone", async () => {
  await seed();
  await AsyncStorage.setItem("someone-elses-key", "keep");
  await migrateAsyncStorage();
  expect(await AsyncStorage.getAllKeys()).toEqual(["someone-elses-key"]);
});

it("does nothing for a new user", async () => {
  await migrateAsyncStorage();
  expect(loadUserData().lastVisitedMosque).toBeNull();
});

it("never overwrites newer data", async () => {
  await seed();
  saveUserData({ favoriteMosques: [], lastVisitedMosque: "mosque-2" });
  await migrateAsyncStorage();
  expect(loadUserData().lastVisitedMosque).toBe("mosque-2");
});

it("runs only once", async () => {
  await migrateAsyncStorage();
  await AsyncStorage.setItem("userData", JSON.stringify(userData));
  await migrateAsyncStorage();
  expect(loadUserData().lastVisitedMosque).toBeNull();
});

it("tries again next time if reading fails, keeping the old data", async () => {
  await seed();
  jest.spyOn(AsyncStorage, "multiGet").mockRejectedValueOnce(new Error("disk"));
  await expect(migrateAsyncStorage()).resolves.toBeUndefined();
  expect(loadUserData().lastVisitedMosque).toBeNull();
  await migrateAsyncStorage();
  expect(loadUserData()).toEqual(userData);
});

it("keeps the moved data if cleaning up fails", async () => {
  await seed();
  jest
    .spyOn(AsyncStorage, "multiRemove")
    .mockRejectedValueOnce(new Error("disk"));
  await migrateAsyncStorage();
  expect(loadUserData()).toEqual(userData);
  saveUserData({ favoriteMosques: [], lastVisitedMosque: "mosque-2" });
  await migrateAsyncStorage();
  expect(loadUserData().lastVisitedMosque).toBe("mosque-2");
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});

describe("user data", () => {
  it("is empty by default and when unreadable", () => {
    expect(loadUserData()).toEqual({
      favoriteMosques: [],
      lastVisitedMosque: null,
    });
    storage.set("userData", "{");
    expect(loadUserData().lastVisitedMosque).toBeNull();
  });
});
