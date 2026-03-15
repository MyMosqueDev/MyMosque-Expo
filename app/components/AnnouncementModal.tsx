import { format, parseISO } from "date-fns";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Announcement } from "../../lib/types";
import { COLORS } from "../../lib/constants";

interface AnnouncementModalProps {
  announcement: Announcement;
  visible: boolean;
  onClose: () => void;
}

const severityColors = {
  high: COLORS.RED,
  medium: COLORS.YELLOW,
  low: COLORS.GREEN,
} as const;

const severityLabels = {
  high: "Urgent",
  medium: "Notice",
  low: "Info",
} as const;

export default function AnnouncementModal({
  announcement,
  visible,
  onClose,
}: AnnouncementModalProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const severity =
    (announcement.severity?.toLowerCase() as keyof typeof severityColors);
  const dotColor = severityColors[severity];
  const label = severityLabels[severity];
  const date = format(parseISO(announcement.created_at), "MMM d, yyyy");

  const handleImagePress = () => {
    setImageModalVisible(true);
    onClose();
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="absolute bottom-0 left-0 right-0 min-h-[50vh] max-h-[85vh] rounded-t-3xl bg-white shadow-xl overflow-hidden">
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header bar */}
          <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                }}
              />
              <Text className="text-xs font-lato text-[#8896A6] tracking-wide uppercase">
                {label} · {date}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-7 h-7 rounded-full justify-center items-center bg-gray-100"
              activeOpacity={0.7}
            >
              <Text className="text-gray-400 font-bold text-base leading-none">
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text className="text-2xl font-lato-bold text-text px-6 mb-4">
            {announcement.title}
          </Text>

          <ScrollView
            className="px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Image */}
            {announcement.image && (
              <TouchableOpacity
                onPress={handleImagePress}
                activeOpacity={0.9}
                className="mb-4"
              >
                <Image
                  source={{ uri: announcement.image }}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: 1 }}
                  resizeMode="contain"
                />
                <View className="absolute bottom-2 right-2 bg-black/40 px-2 py-1 rounded-md">
                  <Text className="text-white text-[10px] font-lato-semibold">
                    Tap to expand
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Description */}
            <Text className="text-base text-[#444] leading-6 font-lato">
              {announcement.description}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Full-screen image modal */}
      {announcement.image && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={closeImageModal}
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/90"
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <Image
              source={{ uri: announcement.image }}
              className="w-screen h-screen"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={closeImageModal}
              className="absolute top-12 right-4 w-10 h-10 rounded-full justify-center items-center bg-black/50 backdrop-blur-sm border border-white/30"
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-xl">×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}
