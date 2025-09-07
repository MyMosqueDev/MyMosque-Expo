import Header from "@/components/Header";
import ScrollContainer from "@/components/ScrollContainer";
import { MosqueInfo } from "@/lib/types";
import { fetchMosqueInfo } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    View,
} from "react-native";

// Types for settings
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
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<string>("unknown");
  const [devPassword, setDevPassword] = useState("");
  const [showDevInput, setShowDevInput] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check notification permissions
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

  // Load settings and mosque info
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const settingsString = await AsyncStorage.getItem("appSettings");
        if (settingsString) {
          setSettings(JSON.parse(settingsString));
        }

        // Load mosque info
        const mosqueData = await fetchMosqueInfo();
        if (mosqueData) {
          setMosqueInfo(mosqueData.info);
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
    if (devPassword === "dev2025") {
      updateSetting("development", true);
      setShowDevInput(false);
      setDevPassword("");
      Alert.alert("Success", "Development mode enabled!");
    } else {
      Alert.alert("Incorrect Password", "Please try again.");
      setDevPassword("");
    }
  };

  // Toggle development mode
  const toggleDevMode = () => {
    if (settings.development.enabled) {
      updateSetting("development", false);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
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
                        <Ionicons name="code" size={20} color="#5B4B94" />
                      </View>
                      <Text className="text-base font-lato-bold text-[#4A4A4A]">
                        Development Mode
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={toggleDevMode}
                      className={`px-4 py-2 rounded-lg ${settings.development.enabled ? "bg-red-500" : "bg-[#5B4B94]"}`}
                    >
                      <Text className="text-white font-lato-bold text-sm">
                        {settings.development.enabled ? "Disable" : "Enable"}
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
