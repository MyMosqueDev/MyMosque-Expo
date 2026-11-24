import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { Announcement } from "../../lib/types";
import AnnouncementModal from "./AnnouncementModal";
import { COLORS } from "../../lib/constants";

const severityColors = {
  high: COLORS.RED,
  medium: COLORS.YELLOW,
  low: COLORS.GREEN,
} as const;

export default function AnnouncementToken({
  announcement,
}: {
  announcement: Announcement;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const severity =
    (announcement.severity.toLowerCase() as keyof typeof severityColors);
  const dotColor = severityColors[severity];
  const date = format(parseISO(announcement.created_at), "MMM d, yyyy");

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View
          className={`w-[90vw] rounded-2xl p-5 m-1 border border-white/30 shadow-md ${
            Platform.OS === "android"
              ? "bg-[#f5f7fa]"
              : "backdrop-blur-lg bg-white/50"
          }`}
        >
          {/* Date + severity dot */}
          <View className="flex-row items-center gap-2 mb-1">
            <View
              style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColor }}
            />
            <Text className="text-xs font-lato text-[#8896A6] tracking-wide uppercase">
              {date}
            </Text>
          </View>

          {/* Title — single line */}
          <Text
            className="text-xl font-lato-bold text-text mb-3"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {announcement.title}
          </Text>

          {/* Body: description + optional image */}
          <View className="flex-row">
            <View className={announcement.image ? "flex-1 pr-4" : "flex-1"}>
              <Text
                className="text-sm text-[#555] leading-5 font-lato"
                numberOfLines={4}
                ellipsizeMode="tail"
              >
                {announcement.description}
              </Text>
            </View>

            {announcement.image && (
              <Image
                source={{ uri: announcement.image }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
            )}
          </View>

          {/* See More */}
          <View className="mt-3 flex-row justify-end">
            <Text className="text-xs font-lato-semibold text-[#3B5A7A]">
              See More →
            </Text>
          </View>
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
