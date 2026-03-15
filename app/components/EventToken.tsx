import Feather from "@expo/vector-icons/Feather";
import { parseISO } from "date-fns";
import { useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { format } from "../../lib/dateUtils";
import { COLORS } from "../../lib/constants";
import { Event } from "../../lib/types";
import EventModal from "./EventModal";

export default function EventToken({ event }: { event: Event }) {
  const date = format(parseISO(event.date), "EEEE, MMMM d");
  const [modalVisible, setModalVisible] = useState(false);
  const time = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
        className="w-full"
      >
        <View
          className={`w-[90vw] rounded-2xl p-5 m-1 border border-white/30 shadow-md ${
            Platform.OS === "android"
              ? "bg-[#f5f7fa]"
              : "backdrop-blur-lg bg-white/50"
          }`}
        >
          {/* Date + time */}
          <View className="flex-row items-center gap-1.5 mb-1">
            <Feather name="calendar" size={11} color="#8896A6" />
            <Text className="text-xs font-lato text-[#8896A6] tracking-wide uppercase">
              {date} · {time}
            </Text>
          </View>

          {/* Title — single line */}
          <Text
            className="text-xl font-lato-bold text-text mb-3"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.title}
          </Text>

          {/* Body: details + optional image */}
          <View className="flex-row">
            <View className={event.image ? "flex-1 pr-6" : "flex-1 pr-6"}>
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <Feather name="users" size={12} color="#555" />
                <Text
                  className="text-sm text-[#555] font-lato"
                  numberOfLines={1}
                >
                  {event.host}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 mb-2">
                <Feather name="map-pin" size={12} color="#555" />
                <Text
                  className="text-sm text-[#555] font-lato"
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
              <Text
                className="text-sm text-[#444] leading-5 font-lato"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {event.description}
              </Text>
            </View>

            {event.image && (
              <Image
                source={{ uri: event.image }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
            )}
          </View>

          {/* See More */}
          <View className="mt-3 flex-row justify-end">
            <Text
              className="text-xs font-lato-semibold"
              style={{ color: COLORS.PRIMARY }}
            >
              See More →
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <EventModal
        event={event}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
