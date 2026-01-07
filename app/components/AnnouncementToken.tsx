import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Announcement } from "../../lib/types";
import AnnouncementModal from "./AnnouncementModal";

// Severity styles must use complete class names for Tailwind to detect them
const severityConfig = {
  high: { bg: "bg-red-200", text: "text-red-700" },
  medium: { bg: "bg-yellow-200", text: "text-yellow-700" },
  low: { bg: "bg-green-200", text: "text-green-700" },
  default: { bg: "bg-gray-200", text: "text-gray-700" },
} as const;

/**
 * AnnouncementToken component
 *
 * Displays an announcement token with a modal for more details.
 *
 * @param announcement - The announcement to display
 */
export default function AnnouncementToken({
  announcement,
}: {
  announcement: Announcement;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const severity =
    announcement.severity.toLowerCase() as keyof typeof severityConfig;
  const severityStyles = severityConfig[severity] || severityConfig.default;
  const date = format(parseISO(announcement.created_at), "EEEE, MMMM d");

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View
          className={`w-[90vw] min-h-[170px] border border-white/30 rounded-2xl p-5 m-1 shadow-md ${
            Platform.OS === "android"
              ? "bg-[#f5f7fa]"
              : "backdrop-blur-lg bg-white/50"
          }`}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-lato-bold text-text">
              {announcement.title}
            </Text>
            <View className={`${severityStyles.bg} px-3 py-1 rounded-full`}>
              <Text
                className={`${severityStyles.text} font-lato-semibold text-sm`}
              >
                {announcement.severity}
              </Text>
            </View>
          </View>
          <Text className="text-base text-[#5A6B7A] mb-2">{date}</Text>
          <Text className="text-base text-[#444]">
            {announcement.description.length > 80
              ? `${announcement.description.substring(0, 80) + "..."} `
              : announcement.description}
            {announcement.description.length > 85 && (
              <Text className="font-bold">See More</Text>
            )}
          </Text>
          {announcement.image && (
            <View className="absolute bottom-5 left-5 flex-row items-center">
              <MaterialCommunityIcons name="image" size={16} color="#5A6B7A" />
              <Text className="text-sm text-[#5A6B7A] ml-2 font-lato-semibold">
                Tap to view image
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <AnnouncementModal
        announcement={announcement}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
