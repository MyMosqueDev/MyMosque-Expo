/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories cannot import */
import { fakeNotifications } from "./fakeNotifications";
import { storage } from "@/lib/mmkv";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-notifications", () =>
  require("./fakeNotifications").notificationsModule(),
);

jest.mock("@/lib/supabase", () => ({
  supabase: require("./fakeSupabase").fakeSupabase.client,
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: "0.0.0",
      extra: { eas: { projectId: "test-project" } },
    },
  },
}));

jest.mock("expo-router", () => require("./fakeRouter").routerModule());

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-blur", () => ({
  BlurView: jest.requireActual("react-native").View,
}));

jest.mock("@/components/FloatingDebugButton", () => () => null);

jest.mock("moti", () => {
  const { View } = jest.requireActual("react-native");
  return { MotiView: View, View };
});

jest.mock("expo-font", () => ({
  ...jest.requireActual("expo-font"),
  loadAsync: jest.fn(async () => undefined),
  isLoaded: () => true,
}));

jest.mock("@expo/vector-icons", () => {
  const Icon = () => null;
  return { Feather: Icon, Ionicons: Icon, MaterialCommunityIcons: Icon };
});
jest.mock("@expo/vector-icons/Feather", () => () => null);
jest.mock("@expo/vector-icons/MaterialIcons", () => () => null);
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => () => null);

beforeEach(async () => {
  // The app logs expected failures; keep test output readable.
  jest.spyOn(console, "log").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  // Tests must never reach a real server. Suites that need fetch replace this.
  global.fetch = jest.fn(async () => {
    throw new Error("Network access is blocked in tests");
  }) as never;
  storage.clearAll();
  fakeNotifications.reset();
  require("./fakeRouter").fakeRouter.reset();
  require("./fakeSupabase").fakeSupabase.reset();
  await require("@react-native-async-storage/async-storage").clear();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
