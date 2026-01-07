// Debug Panel Modal
// Displays dev stats: notifications, storage, app info, sync status, cache

import { useDevMode } from "@/lib/devMode";
import { getPushToken } from "@/lib/getPushToken";
import { getAllStorageKeys, storage } from "@/lib/mmkv";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DebugStats = {
  // Notifications
  pushToken: string;
  nextNotification: string;
  totalScheduledNotifications: number;
  notificationsList: Array<{ id: string; title: string; time: string }>;

  // Storage
  mmkvKeyCount: number;
  mmkvKeys: string[];
  asyncStorageKeyCount: number;
  asyncStorageKeys: string[];

  // App Info
  appVersion: string;
  sdkVersion: string;
  platform: string;

  // Sync
  lastSyncTime: string;
  currentMosqueId: string;
  currentMosqueName: string;
  monthlyScheduleMonth: string;

  // Cache
  mosqueDataSize: string;
};

const DEFAULT_STATS: DebugStats = {
  pushToken: "Unknown",
  nextNotification: "Loading...",
  totalScheduledNotifications: 0,
  notificationsList: [],
  mmkvKeyCount: 0,
  mmkvKeys: [],
  asyncStorageKeyCount: 0,
  asyncStorageKeys: [],
  appVersion: "Unknown",
  sdkVersion: "Unknown",
  platform: "Unknown",
  lastSyncTime: "Never",
  currentMosqueId: "None",
  currentMosqueName: "None",
  monthlyScheduleMonth: "None",
  mosqueDataSize: "0 KB",
};

type DebugPanelProps = {
  visible: boolean;
  onClose: () => void;
};

export default function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const { isDevMode, setDevMode } = useDevMode();
  const [stats, setStats] = useState<DebugStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Load all stats in parallel
      const [pushToken, notificationStats, storageStats, appInfo, syncStats] =
        await Promise.all([
          getPushToken(),
          loadNotificationStats(),
          loadStorageStats(),
          loadAppInfo(),
          loadSyncStats(),
        ]);

      setStats({
        ...DEFAULT_STATS,
        pushToken: pushToken || "Unknown",
        ...notificationStats,
        ...storageStats,
        ...appInfo,
        ...syncStats,
      });
    } catch (error) {
      console.error("Error loading debug stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract date from various trigger formats
  const getTriggerDate = (trigger: any): Date | null => {
    if (!trigger) return null;

    // Handle DateTrigger (type: 'date' with value property)
    if (trigger.type === "date" && trigger.value) {
      return new Date(trigger.value);
    }

    // Handle direct date property (older format or different trigger type)
    if ("date" in trigger) {
      return new Date(trigger.date);
    }

    // Handle timestamp property
    if ("timestamp" in trigger) {
      return new Date(trigger.timestamp);
    }

    // Handle seconds property (calendar triggers)
    if ("seconds" in trigger) {
      return new Date(Date.now() + trigger.seconds * 1000);
    }

    return null;
  };

  const loadNotificationStats = async (): Promise<Partial<DebugStats>> => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      // Map notifications with their trigger dates
      const withDates = scheduled
        .map((n) => ({
          notification: n,
          triggerDate: getTriggerDate(n.trigger),
        }))
        .filter((item) => item.triggerDate !== null)
        .sort((a, b) => {
          return (
            (a.triggerDate?.getTime() || 0) - (b.triggerDate?.getTime() || 0)
          );
        });

      const nextNotif = withDates[0];
      let nextNotificationStr = "None scheduled";

      if (nextNotif && nextNotif.triggerDate) {
        const title = nextNotif.notification.content.title || "Notification";
        nextNotificationStr = `${title}\n${nextNotif.triggerDate.toLocaleString()}`;
      }

      const notificationsList = withDates.map((item) => ({
        id: item.notification.identifier,
        title: item.notification.content.title || "Notification",
        time: item.triggerDate?.toLocaleString() || "Unknown",
      }));

      // If we couldn't parse any dates but have notifications, show raw count
      if (scheduled.length > 0 && withDates.length === 0) {
        // Log first notification trigger for debugging
        console.log(
          "Trigger format:",
          JSON.stringify(scheduled[0]?.trigger, null, 2),
        );
        nextNotificationStr = `${scheduled.length} scheduled (trigger format unknown)`;
      }

      return {
        nextNotification: nextNotificationStr,
        totalScheduledNotifications: scheduled.length,
        notificationsList,
      };
    } catch (error) {
      console.error("Error loading notification stats:", error);
      return {
        nextNotification: "Error loading",
        totalScheduledNotifications: 0,
        notificationsList: [],
      };
    }
  };

  const loadStorageStats = async (): Promise<Partial<DebugStats>> => {
    try {
      // MMKV stats
      const mmkvKeys = getAllStorageKeys();

      // AsyncStorage stats
      const asyncKeys = await AsyncStorage.getAllKeys();

      // Calculate mosque data size
      let mosqueDataSize = 0;
      for (const key of mmkvKeys) {
        if (key.startsWith("mosqueData-")) {
          const data = storage.getString(key);
          if (data) {
            mosqueDataSize += data.length;
          }
        }
      }

      return {
        mmkvKeyCount: mmkvKeys.length,
        mmkvKeys,
        asyncStorageKeyCount: asyncKeys.length,
        asyncStorageKeys: asyncKeys as string[],
        mosqueDataSize: formatBytes(mosqueDataSize),
      };
    } catch (error) {
      console.error("Error loading storage stats:", error);
      return {
        mmkvKeyCount: 0,
        mmkvKeys: [],
        asyncStorageKeyCount: 0,
        asyncStorageKeys: [],
        mosqueDataSize: "Error",
      };
    }
  };

  const loadAppInfo = async (): Promise<Partial<DebugStats>> => {
    return {
      appVersion: Constants.expoConfig?.version || "Unknown",
      sdkVersion: Constants.expoConfig?.sdkVersion || "Unknown",
      platform: Constants.platform?.ios
        ? "iOS"
        : Constants.platform?.android
          ? "Android"
          : "Unknown",
    };
  };

  const loadSyncStats = async (): Promise<Partial<DebugStats>> => {
    try {
      // Get user data for mosque ID
      const userDataStr = await AsyncStorage.getItem("userData");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const mosqueId = userData?.lastVisitedMosque || "None";

      // Get mosque data from MMKV
      let lastSyncTime = "Never";
      let mosqueName = "None";
      let monthlyScheduleMonth = "None";

      if (mosqueId !== "None") {
        const mosqueDataStr = storage.getString(`mosqueData-${mosqueId}`);
        if (mosqueDataStr) {
          const mosqueData = JSON.parse(mosqueDataStr);
          mosqueName = mosqueData.info?.name || "Unknown";
          lastSyncTime = mosqueData.info?.last_prayer
            ? new Date(mosqueData.info.last_prayer).toLocaleString()
            : "Never";
          monthlyScheduleMonth =
            mosqueData.monthlyPrayerSchedule?.["mm-yy"] || "None";
        }
      }

      return {
        lastSyncTime,
        currentMosqueId: mosqueId,
        currentMosqueName: mosqueName,
        monthlyScheduleMonth,
      };
    } catch (error) {
      console.error("Error loading sync stats:", error);
      return {
        lastSyncTime: "Error",
        currentMosqueId: "Error",
        currentMosqueName: "Error",
        monthlyScheduleMonth: "Error",
      };
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const StatRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="flex-row justify-between py-1.5 border-b border-gray-100">
      <Text className="text-xs font-lato text-gray-500">{label}</Text>
      <Text
        className="text-xs font-lato-bold text-gray-700 flex-1 text-right ml-2"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );

  const SectionHeader = ({
    title,
    icon,
    expanded,
    onPress,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    expanded: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3 border-b border-gray-200"
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={18} color="#5B4B94" />
        <Text className="text-sm font-lato-bold text-gray-700 ml-2">
          {title}
        </Text>
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={18}
        color="#5B4B94"
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="bug" size={24} color="#5B4B94" />
              <Text className="text-lg font-lato-bold text-gray-800 ml-2">
                Debug Panel
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={loadStats} className="mr-4 p-2">
                <Ionicons name="refresh" size={20} color="#5B4B94" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#5B4B94" />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View className="p-8 items-center">
              <Text className="text-gray-500 font-lato">Loading stats...</Text>
            </View>
          ) : (
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              {/* App Info Section */}
              <SectionHeader
                title="App Info"
                icon="information-circle"
                expanded={expandedSection === "app"}
                onPress={() => toggleSection("app")}
              />
              {expandedSection === "app" && (
                <View className="py-2">
                  <StatRow label="Version" value={stats.appVersion} />
                  <StatRow label="SDK Version" value={stats.sdkVersion} />
                  <StatRow label="Platform" value={stats.platform} />
                  <View className="flex-row justify-between items-center py-1.5 border-b border-gray-100">
                    <Text className="text-xs font-lato text-gray-500">
                      Dev Mode
                    </Text>
                    <Switch
                      value={isDevMode}
                      onValueChange={setDevMode}
                      trackColor={{ false: "#D1D5DB", true: "#5B4B94" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              )}

              {/* Notifications Section */}
              <SectionHeader
                title={`Notifications (${stats.totalScheduledNotifications})`}
                icon="notifications"
                expanded={expandedSection === "notifications"}
                onPress={() => toggleSection("notifications")}
              />
              {expandedSection === "notifications" && (
                <View className="py-2">
                  <StatRow label="Push Token" value={stats.pushToken} />
                  <StatRow
                    label="Total Scheduled"
                    value={stats.totalScheduledNotifications}
                  />
                  <View className="py-1.5">
                    <Text className="text-xs font-lato text-gray-500 mb-1">
                      Next Notification
                    </Text>
                    <Text className="text-xs font-lato-bold text-gray-700">
                      {stats.nextNotification}
                    </Text>
                  </View>
                  {stats.notificationsList.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-xs font-lato text-gray-500 mb-1">
                        Upcoming (max 10):
                      </Text>
                      {stats.notificationsList.map((n, i) => (
                        <View
                          key={n.id}
                          className="py-1 border-b border-gray-50"
                        >
                          <Text className="text-xs font-lato-bold text-gray-700">
                            {i + 1}. {n.title}
                          </Text>
                          <Text className="text-xs font-lato text-gray-400">
                            {n.time}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Sync/API Section */}
              <SectionHeader
                title="Sync Status"
                icon="sync"
                expanded={expandedSection === "sync"}
                onPress={() => toggleSection("sync")}
              />
              {expandedSection === "sync" && (
                <View className="py-2">
                  <StatRow
                    label="Current Mosque"
                    value={stats.currentMosqueName}
                  />
                  <StatRow label="Mosque ID" value={stats.currentMosqueId} />
                  <StatRow label="Last Sync" value={stats.lastSyncTime} />
                  <StatRow
                    label="Schedule Month"
                    value={stats.monthlyScheduleMonth}
                  />
                </View>
              )}

              {/* Storage Section */}
              <SectionHeader
                title="Storage"
                icon="server"
                expanded={expandedSection === "storage"}
                onPress={() => toggleSection("storage")}
              />
              {expandedSection === "storage" && (
                <View className="py-2">
                  <StatRow label="MMKV Keys" value={stats.mmkvKeyCount} />
                  <StatRow
                    label="AsyncStorage Keys"
                    value={stats.asyncStorageKeyCount}
                  />
                  <StatRow
                    label="Mosque Data Size"
                    value={stats.mosqueDataSize}
                  />
                  {stats.mmkvKeys.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-xs font-lato text-gray-500 mb-1">
                        MMKV Keys:
                      </Text>
                      {stats.mmkvKeys.map((key) => (
                        <Text
                          key={key}
                          className="text-xs font-lato text-gray-600 py-0.5"
                        >
                          • {key}
                        </Text>
                      ))}
                    </View>
                  )}
                  {stats.asyncStorageKeys.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-xs font-lato text-gray-500 mb-1">
                        AsyncStorage Keys:
                      </Text>
                      {stats.asyncStorageKeys.map((key) => (
                        <Text
                          key={key}
                          className="text-xs font-lato text-gray-600 py-0.5"
                        >
                          • {key}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Bottom padding for scroll */}
              <View className="h-8" />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
