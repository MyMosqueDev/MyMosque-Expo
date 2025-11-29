import { ANIMATION_CONFIG } from "@/lib/constants";
import { Event } from "@/lib/types";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { parseISO } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { Dimensions, Image, ImageBackground, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { format } from "../../lib/dateUtils";

export default function EventDetails() {
  const params = useLocalSearchParams();
  const eventData: Event = JSON.parse(params.eventData as string);
  const date = format(parseISO(eventData.date), "EEEE, MMMM do");
  const time = format(parseISO(eventData.date), "h:mm a");
  
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        className={"flex flex-1 px-6 pt-1"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
          flexGrow: 1,
        }}
      >
        {/* Event Image with entrance animation and loading state */}
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
          delay={50}
        >
          <TouchableOpacity 
            className="w-full mb-4 rounded-lg overflow-hidden bg-gray-100" 
            style={{ aspectRatio: 1 }}
            onPress={() => setImageModalVisible(true)}
            activeOpacity={0.8}
          >
            {/* Loading gradient placeholder */}
            {imageLoading && (
              <View className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
                <View className="flex-1 items-center justify-center">
                  <MaterialIcons name="image" size={48} color="#6B7280" />
                </View>
              </View>
            )}
            
            {/* Error state */}
            {imageError && (
              <View className="absolute inset-0 bg-gradient-to-br from-red-100 via-red-200 to-red-300">
                <View className="flex-1 items-center justify-center">
                  <MaterialIcons name="broken-image" size={48} color="#DC2626" />
                  <Text className="text-red-600 mt-2 font-lato text-center px-4">
                    Failed to load image
                  </Text>
                </View>
              </View>
            )}
            
            {/* Actual image */}
            <Image
              source={{ uri: eventData.image }}
              className="w-full h-full"
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            
            {/* Pressable icon indicator */}
            {!imageLoading && !imageError && (
              <View className="absolute bottom-3 left-3">
                <View className="bg-black/50 rounded-full p-2">
                  <MaterialIcons name="zoom-in" size={20} color="white" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </MotiView>

        <View className="flex w-full px-1 gap-6">
          {/* Header Section with staggered animations */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
            delay={150}
            className="flex-col"
          >
            <View className="flex-row justify-between items-center gap-2">
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{
                  type: "spring",
                  ...ANIMATION_CONFIG.SPRING_STIFF,
                }}
                delay={200}
              >
                <Text className="text-text text-2xl font-lato-bold">
                  {date}
                </Text>
              </MotiView>
            </View>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
              delay={300}
            >
              <Text className="text-[#666666] text-lg font-lato-bold">
                {time}
              </Text>
            </MotiView>
          </MotiView>

          {/* Mosque Info Section with staggered animations */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
            delay={350}
            className="flex-col gap-2"
          >
            <MotiView
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
              delay={400}
            >
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="people-alt" size={18} color="#4A4A4A" />
                <Text className="text-text text-xl font-lato">
                  Hosted by{" "}
                  <Text className="font-lato-bold">{eventData.host}</Text>
                </Text>
              </View>
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
              delay={450}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="map-pin" size={18} color="#4A4A4A" />
                <Text className="text-text text-xl font-lato">
                  Located @{" "}
                  <Text className="font-lato-bold">{eventData.location}</Text>
                </Text>
              </View>
            </MotiView>
          </MotiView>

          {/* Description with entrance animation */}
          <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING_STIFF }}
            delay={500}
          >
            <Text className="text-text text-xl font-lato-bold">
              {eventData.description}
            </Text>
          </MotiView>
        </View>
      </ScrollView>
      
      {/* Full-screen image modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="flex-1 items-center justify-center"
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: eventData.image }}
              style={{
                width: screenWidth,
                height: screenHeight,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          {/* Close button */}
          <TouchableOpacity
            className="absolute top-12 right-6 bg-black/50 rounded-full p-3"
            onPress={() => setImageModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
}
