import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { parseISO } from "date-fns";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { format } from "../../lib/dateUtils";
import { Event } from "../../lib/types";

interface EventModalProps {
  event: Event;
  visible: boolean;
  onClose: () => void;
}

export default function EventModal({
  event,
  visible,
  onClose,
}: EventModalProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const date = format(parseISO(event.date), "EEEE, MMMM do");
  const time = format(parseISO(event.date), "h:mm a");
  const { width: screenWidth, height: screenHeight } =
    Dimensions.get("window");

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
        <View className="absolute bottom-0 left-0 right-0 min-h-[75vh] max-h-[85vh] rounded-t-3xl bg-white shadow-xl overflow-hidden">
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header bar */}
          <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
            <View className="flex-row items-center gap-1.5">
              <Feather name="calendar" size={11} color="#8896A6" />
              <Text className="text-xs font-lato text-[#8896A6] tracking-wide uppercase">
                {date} · {time}
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
          <Text className="text-2xl font-lato-bold text-text px-6 mb-1">
            {event.title}
          </Text>

          {/* Host + Location */}
          <View className="px-6 mb-4 gap-1.5">
            <View className="flex-row items-center gap-2">
              <Feather name="users" size={13} color="#8896A6" />
              <Text className="text-sm text-[#666] font-lato">
                Hosted by{" "}
                <Text className="font-lato-semibold">{event.host}</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="map-pin" size={13} color="#8896A6" />
              <Text className="text-sm text-[#666] font-lato">
                {event.location}
              </Text>
            </View>
          </View>

          <ScrollView
            className="px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Image */}
            {event.image && (
              <TouchableOpacity
                onPress={handleImagePress}
                activeOpacity={0.9}
                className="mb-4 rounded-xl overflow-hidden bg-gray-100"
                style={{ aspectRatio: 1 }}
              >
                {imageLoading && (
                  <View className="absolute inset-0 items-center justify-center">
                    <MaterialIcons name="image" size={40} color="#d1d5db" />
                  </View>
                )}

                {imageError && (
                  <View className="absolute inset-0 items-center justify-center">
                    <MaterialIcons
                      name="broken-image"
                      size={40}
                      color="#DC2626"
                    />
                    <Text className="text-red-500 mt-1 text-xs font-lato">
                      Failed to load
                    </Text>
                  </View>
                )}

                <Image
                  source={{ uri: event.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onLoadStart={() => {
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />

                {!imageLoading && !imageError && (
                  <View className="absolute bottom-2 right-2 bg-black/40 px-2 py-1 rounded-md">
                    <Text className="text-white text-[10px] font-lato-semibold">
                      Tap to expand
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Description */}
            <Text className="text-base text-[#444] leading-6 font-lato">
              {event.description}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Full-screen image modal */}
      {event.image && (
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
              source={{ uri: event.image }}
              style={{ width: screenWidth, height: screenHeight }}
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
