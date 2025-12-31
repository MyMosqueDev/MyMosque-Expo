import Header from "@/components/Header";
import ScrollContainer from "@/components/ScrollContainer";
import { useDevMode } from "@/lib/devMode";
import { getPushToken } from "@/lib/getPushToken";
import {
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  getJummahCount,
  loadPrayerNotificationSettings,
  PrayerNotificationSettings,
  savePrayerNotificationSettings,
  schedulePrayerNotifications,
} from "@/lib/prayerNotifications";
import { JummahTime, MosqueInfo } from "@/lib/types";
import { fetchMosqueInfo } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { MotiView } from "moti";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type SettingsType = {
  events: {
    enabled: boolean;
  };
  announcements: {
    enabled: boolean;
  };
  development: {
    enabled: boolean;
  };
};

const DEFAULT_SETTINGS: SettingsType = {
  events: { enabled: true },
  announcements: { enabled: true },
  development: { enabled: false },
};

// sorry for how awfully this is written
export default function Settings() {
  const { isDevMode, toggleDevMode } = useDevMode();
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);
  const [mosqueId, setMosqueId] = useState<string | null>(null);
  const [jummahTimes, setJummahTimes] = useState<JummahTime | null>(null);
  const [prayerNotificationSettings, setPrayerNotificationSettings] =
    useState<PrayerNotificationSettings>(DEFAULT_PRAYER_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<string>("unknown");
  const [devPassword, setDevPassword] = useState("");
  const [showDevInput, setShowDevInput] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prayerNotificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkNotificationPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationPermission(status);
      } catch (error) {
        console.error("Error checking notification permissions:", error);
        setNotificationPermission("unknown");
      }
    };

    checkNotificationPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return async () => {
        const token = await getPushToken();
        const url = "https://www.mymosque.app/api/pushToken";

        async function updatePushToken() {
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                pushToken: token,
                mosqueId: mosqueId,
                settings: settings,
              }),
            });

            const text = await response.text();
            if (text) {
              const data = JSON.parse(text);
              console.log("Response with options:", data);
              return data;
            }
            console.log("Push token updated (empty response)");
            return null;
          } catch (error) {
            console.error("Error updating push token:", error);
          }
        }
        await updatePushToken();
      };
    }, [])
  );

  // Load settings and mosque info
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const settingsString = await AsyncStorage.getItem("appSettings");
        if (settingsString) {
          setSettings(JSON.parse(settingsString));
        }

        // Load prayer notification settings from MMKV
        const prayerSettings = loadPrayerNotificationSettings();
        setPrayerNotificationSettings(prayerSettings);

        // Load mosque info
        const mosqueData = await fetchMosqueInfo();
        if (mosqueData) {
          setMosqueInfo(mosqueData.info);
          setMosqueId(mosqueData.info.uid);
          setJummahTimes(mosqueData.jummahTimes || null);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Debounced save settings to AsyncStorage
  const debouncedSaveSettings = useCallback(async (newSettings: SettingsType) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings));
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    }, 300);
  }, []);

  // Update individual setting
  const updateSetting = useCallback(
    (key: keyof SettingsType, value: any) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings };
        if (
          key === "events" ||
          key === "announcements" ||
          key === "development"
        ) {
          (newSettings[key] as any).enabled = value;
        } else {
          (newSettings as any)[key] = value;
        }

        // Debounced save
        debouncedSaveSettings(newSettings);
        return newSettings;
      });
    },
    [debouncedSaveSettings],
  );

  // Handle opening device settings
  const openDeviceSettings = () => {
    Alert.alert(
      "Notification Permissions",
      "Would you like to open device settings to manage notification permissions?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
      ],
    );
  };

  // Handle development mode password
  const handleDevPassword = () => {
    const success = toggleDevMode(devPassword);
    if (success) {
      setShowDevInput(false);
      setDevPassword("");
      Alert.alert("Success", "Development mode enabled!");
    } else {
      Alert.alert("Incorrect Password", "Please try again.");
      setDevPassword("");
    }
  };

  // Toggle development mode UI
  const handleToggleDevMode = () => {
    if (isDevMode) {
      toggleDevMode();
      Alert.alert(
        "Development Mode Disabled",
        "Development mode has been turned off.",
      );
    } else {
      setShowDevInput(true);
    }
  };

  // Get permission status text and color
  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case "granted":
        return { text: "Enabled", color: "#88AE79" };
      case "denied":
        return { text: "Disabled", color: "#EF4444" };
      case "undetermined":
        return { text: "Not Set", color: "#F59E0B" };
      default:
        return { text: "Unknown", color: "#6B7280" };
    }
  };

  // Update prayer notification settings with debounced scheduling
  const updatePrayerNotificationSettings = useCallback(
    (newSettings: PrayerNotificationSettings) => {
      setPrayerNotificationSettings(newSettings);
      savePrayerNotificationSettings(newSettings);

      // Debounce the scheduling to avoid too many API calls
      if (prayerNotificationTimeoutRef.current) {
        clearTimeout(prayerNotificationTimeoutRef.current);
      }

      prayerNotificationTimeoutRef.current = setTimeout(async () => {
        if (mosqueId && mosqueInfo?.name) {
          await schedulePrayerNotifications(mosqueId, mosqueInfo.name);
        }
      }, 500);
    },
    [mosqueId, mosqueInfo?.name]
  );

  // Toggle main prayer notifications switch
  const togglePrayerNotifications = useCallback(
    (enabled: boolean) => {
      const newSettings = { ...prayerNotificationSettings, enabled };
      updatePrayerNotificationSettings(newSettings);
    },
    [prayerNotificationSettings, updatePrayerNotificationSettings]
  );

  // Toggle individual prayer notification
  const togglePrayerNotification = useCallback(
    (prayer: keyof PrayerNotificationSettings["prayers"], enabled: boolean) => {
      const newSettings = {
        ...prayerNotificationSettings,
        prayers: { ...prayerNotificationSettings.prayers, [prayer]: enabled },
      };
      updatePrayerNotificationSettings(newSettings);
    },
    [prayerNotificationSettings, updatePrayerNotificationSettings]
  );

  // Toggle jummah notification
  const toggleJummahNotification = useCallback(
    (jummah: keyof PrayerNotificationSettings["jummah"], enabled: boolean) => {
      const newSettings = {
        ...prayerNotificationSettings,
        jummah: { ...prayerNotificationSettings.jummah, [jummah]: enabled },
      };
      updatePrayerNotificationSettings(newSettings);
    },
    [prayerNotificationSettings, updatePrayerNotificationSettings]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (prayerNotificationTimeoutRef.current) {
        clearTimeout(prayerNotificationTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <ScrollContainer name="Settings">
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="flex-1 items-center justify-center"
        >
          <Text className="text-text text-[24px] font-lato-bold">
            Loading...
          </Text>
        </MotiView>
      </ScrollContainer>
    );
  }

  const permissionStatus = getPermissionStatus();

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Header
        name={mosqueInfo?.name || ""}
        type="settings"
        title={"Settings"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className={"flex flex-1 pt-1"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 90,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 w-full px-4 pt-6">
            {/* Mosque Section */}
            <MotiView
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              className="w-full mb-6"
            >
              <Text className="text-[#4A4A4A] text-lg font-lato-bold mb-4 uppercase tracking-wide">
                {mosqueInfo?.name}
              </Text>

              {/* Event Notifications */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={100}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="calendar" size={20} color="#5B4B94" />
                      </View>
                      <Text className="text-base font-lato-bold text-[#4A4A4A]">
                        Event Notifications
                      </Text>
                    </View>
                    <Switch
                      value={settings.events.enabled}
                      onValueChange={(value) => updateSetting("events", value)}
                      trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>
                </View>
              </MotiView>

              {/* Announcement Notifications */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={150}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="megaphone" size={20} color="#5B4B94" />
                      </View>
                      <Text className="text-base font-lato-bold text-[#4A4A4A]">
                        Announcement Notifications
                      </Text>
                    </View>
                    <Switch
                      value={settings.announcements.enabled}
                      onValueChange={(value) =>
                        updateSetting("announcements", value)
                      }
                      trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>
                </View>
              </MotiView>

              {/* Prayer Time Notifications */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={200}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  {/* Main toggle */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="time" size={20} color="#5B4B94" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-lato-bold text-[#4A4A4A]">
                          Prayer Time Notifications
                        </Text>
                        <Text className="text-xs font-lato text-[#6B7280] mt-0.5">
                          Get notified 15 min before and at iqama
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={prayerNotificationSettings.enabled}
                      onValueChange={togglePrayerNotifications}
                      trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>

                  {/* Expandable prayer toggles */}
                  {prayerNotificationSettings.enabled && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ type: "timing", duration: 200 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      {/* Daily Prayers */}
                      <Text className="text-xs font-lato-bold text-[#6B7280] uppercase tracking-wide mb-3">
                        Daily Prayers
                      </Text>

                      {/* Fajr */}
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-lato text-[#4A4A4A]">
                          Fajr
                        </Text>
                        <Switch
                          value={prayerNotificationSettings.prayers.fajr}
                          onValueChange={(value) =>
                            togglePrayerNotification("fajr", value)
                          }
                          trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#E5E7EB"
                        />
                      </View>

                      {/* Dhuhr */}
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-lato text-[#4A4A4A]">
                          Dhuhr
                        </Text>
                        <Switch
                          value={prayerNotificationSettings.prayers.dhuhr}
                          onValueChange={(value) =>
                            togglePrayerNotification("dhuhr", value)
                          }
                          trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#E5E7EB"
                        />
                      </View>

                      {/* Asr */}
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-lato text-[#4A4A4A]">
                          Asr
                        </Text>
                        <Switch
                          value={prayerNotificationSettings.prayers.asr}
                          onValueChange={(value) =>
                            togglePrayerNotification("asr", value)
                          }
                          trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#E5E7EB"
                        />
                      </View>

                      {/* Maghrib */}
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-lato text-[#4A4A4A]">
                          Maghrib
                        </Text>
                        <Switch
                          value={prayerNotificationSettings.prayers.maghrib}
                          onValueChange={(value) =>
                            togglePrayerNotification("maghrib", value)
                          }
                          trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#E5E7EB"
                        />
                      </View>

                      {/* Isha */}
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-sm font-lato text-[#4A4A4A]">
                          Isha
                        </Text>
                        <Switch
                          value={prayerNotificationSettings.prayers.isha}
                          onValueChange={(value) =>
                            togglePrayerNotification("isha", value)
                          }
                          trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor="#E5E7EB"
                        />
                      </View>

                      {/* Jummah section - only show if mosque has jummah times */}
                      {jummahTimes && getJummahCount(jummahTimes) > 0 && (
                        <>
                          <Text className="text-xs font-lato-bold text-[#6B7280] uppercase tracking-wide mt-4 mb-3">
                            Friday Prayers
                          </Text>

                          {/* Jummah 1 */}
                          {jummahTimes.jummah1 && (
                            <View className="flex-row items-center justify-between py-2">
                              <Text className="text-sm font-lato text-[#4A4A4A]">
                                {getJummahCount(jummahTimes) === 1
                                  ? "Jummah"
                                  : "Jummah 1"}
                              </Text>
                              <Switch
                                value={prayerNotificationSettings.jummah.jummah1}
                                onValueChange={(value) =>
                                  toggleJummahNotification("jummah1", value)
                                }
                                trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#E5E7EB"
                              />
                            </View>
                          )}

                          {/* Jummah 2 */}
                          {jummahTimes.jummah2 && (
                            <View className="flex-row items-center justify-between py-2">
                              <Text className="text-sm font-lato text-[#4A4A4A]">
                                Jummah 2
                              </Text>
                              <Switch
                                value={prayerNotificationSettings.jummah.jummah2}
                                onValueChange={(value) =>
                                  toggleJummahNotification("jummah2", value)
                                }
                                trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#E5E7EB"
                              />
                            </View>
                          )}

                          {/* Jummah 3 */}
                          {jummahTimes.jummah3 && (
                            <View className="flex-row items-center justify-between py-2">
                              <Text className="text-sm font-lato text-[#4A4A4A]">
                                Jummah 3
                              </Text>
                              <Switch
                                value={prayerNotificationSettings.jummah.jummah3}
                                onValueChange={(value) =>
                                  toggleJummahNotification("jummah3", value)
                                }
                                trackColor={{ false: "#E5E7EB", true: "#5B4B94" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#E5E7EB"
                              />
                            </View>
                          )}
                        </>
                      )}
                    </MotiView>
                  )}
                </View>
              </MotiView>
            </MotiView>

            {/* App Permissions Section */}
            <MotiView
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              delay={200}
              className="w-full mb-6"
            >
              <Text className="text-[#4A4A4A] text-lg font-lato-bold mb-4 uppercase tracking-wide">
                App Permissions
              </Text>

              {/* Notification Permissions */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={250}
                className="w-full"
              >
                <TouchableOpacity
                  onPress={openDeviceSettings}
                  activeOpacity={0.7}
                >
                  <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name="notifications"
                            size={20}
                            color="#5B4B94"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-lato-bold text-[#4A4A4A]">
                            Notifications
                          </Text>
                          <Text className="text-sm font-lato text-[#6B7280] mt-1">
                            Device notification permissions
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className="mr-3">
                          <Text
                            className="text-sm font-lato-bold"
                            style={{ color: permissionStatus.color }}
                          >
                            {permissionStatus.text}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#5B4B94"
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            </MotiView>

            {/* Information Section */}
            <MotiView
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              delay={300}
              className="w-full mb-6"
            >
              <Text className="text-[#4A4A4A] text-lg font-lato-bold mb-4 uppercase tracking-wide">
                Information
              </Text>

              {/* About MyMosque */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={350}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <Text className="text-base font-lato-bold text-[#4A4A4A] mb-2">
                    About MyMosque
                  </Text>
                  <Text className="text-sm font-lato text-[#6B7280] leading-5">
                    MyMosque is your go-to app for staying connected with your
                    local mosque. Check prayer times, keep up with
                    announcements, and never miss an event, all in one place.
                  </Text>
                </View>
              </MotiView>

              {/* Credits */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={400}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <Text className="text-base font-lato-bold text-[#4A4A4A] mb-2">
                    Credits
                  </Text>
                  <Text className="text-sm font-lato text-[#4A4A4A] mb-1">
                    Ali Vayani
                  </Text>
                  <Text className="text-xs font-lato text-[#6B7280] mb-3">
                    Lead Developer & Designer
                  </Text>
                  <Text className="text-sm font-lato text-[#4A4A4A] mb-1">
                    Open Source Contributors
                  </Text>
                  <Text className="text-xs font-lato text-[#6B7280] mb-3">
                    Coming Soon...
                  </Text>
                </View>
              </MotiView>

              {/* Help & Support */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={450}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <Text className="text-base font-lato-bold text-[#4A4A4A] mb-3">
                    Help & Support
                  </Text>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:ali@mymosque.app`)}
                    className="flex-row items-center mb-3"
                  >
                    <Ionicons
                      name="mail"
                      size={16}
                      color="#88AE79"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-sm font-lato text-[#88AE79]">
                      Contact Support
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        "https://github.com/MyMosqueDev/MyMosque-Expo",
                      )
                    }
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name="code"
                      size={16}
                      color="#88AE79"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-sm font-lato text-[#88AE79]">
                      Source Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            </MotiView>

            {/* Development Section */}
            <MotiView
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              delay={500}
              className="w-full mb-6"
            >
              <Text className="text-[#4A4A4A] text-lg font-lato-bold mb-4 uppercase tracking-wide">
                Development
              </Text>

              {/* Development Mode */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                delay={550}
                className="w-full mb-3"
              >
                <View className="w-full bg-white/70 rounded-2xl p-4 shadow-md border border-white/30">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="bug" size={20} color="#5B4B94" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-lato-bold text-[#4A4A4A]">
                          Development Mode
                        </Text>
                        {isDevMode && (
                          <Text className="text-xs font-lato text-[#88AE79] mt-0.5">
                            Tap the floating bug icon to view debug info
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handleToggleDevMode}
                      className={`px-4 py-2 rounded-lg ${isDevMode ? "bg-red-500" : "bg-[#5B4B94]"}`}
                    >
                      <Text className="text-white font-lato-bold text-sm">
                        {isDevMode ? "Disable" : "Enable"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showDevInput && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 80 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 150,
                      }}
                      className="mt-4"
                    >
                      <View className="flex-row items-center gap-3">
                        <TextInput
                          value={devPassword}
                          onChangeText={setDevPassword}
                          placeholder="Enter password"
                          secureTextEntry
                          className="flex-1 bg-white/50 rounded-lg px-3 py-2 text-[#4A4A4A] font-lato"
                          placeholderTextColor="#6B7280"
                        />
                        <TouchableOpacity
                          onPress={handleDevPassword}
                          className="bg-[#5B4B94] px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white font-lato-bold text-sm">
                            Submit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </MotiView>
                  )}
                </View>
              </MotiView>
            </MotiView> 
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
