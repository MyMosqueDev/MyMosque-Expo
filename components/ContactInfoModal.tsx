import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ActionSheetIOS,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ContactInfo as ContactInfoType, MosqueInfo } from "@/lib/types";

const DisplayContactInfo = ({
  contactInfo,
  onCallPress,
  onEmailPress,
}: {
  contactInfo: ContactInfoType;
  onCallPress: (phoneNumber: string) => void;
  onEmailPress: (email: string) => void;
}) => {
  return (
    <View className="space-y-4">
      <Text className="text-sm font-lato-bold text-[#4A4A4A] px-3">
        {contactInfo.name}
      </Text>
      {contactInfo.phoneNumber && (
        <TouchableOpacity
          onPress={() =>
            contactInfo.phoneNumber && onCallPress(contactInfo.phoneNumber)
          }
          className="flex-row items-center p-3"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="phone"
            size={16}
            color="#5B4B94"
            style={{ marginRight: 12 }}
          />
          <Text className="text-sm font-lato text-[#6B7280] underline">
            {contactInfo.phoneNumber}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => onEmailPress(contactInfo.email)}
        className="flex-row items-center p-3"
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="email"
          size={16}
          color="#5B4B94"
          style={{ marginRight: 12 }}
        />
        <Text className="text-sm font-lato text-[#6B7280] underline">
          {contactInfo.email}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface ContactInfoModalProps {
  isVisible: boolean;
  setShowContactModal: (show: boolean) => void;
  contactInfo: ContactInfoType[];
  address?: MosqueInfo["address"];
  hours?: MosqueInfo["hours"];
}

export default function ContactInfoModal({
  isVisible,
  setShowContactModal,
  contactInfo,
  address,
  hours,
}: ContactInfoModalProps) {
  const handleCallPress = (phoneNumber: string) => {
    setShowContactModal(false);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (email: string) => {
    setShowContactModal(false);
    Linking.openURL(`mailto:${email}`);
  };

  const todayKey = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date().getDay()] as keyof MosqueInfo["hours"];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setShowContactModal(false)}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={() => setShowContactModal(false)}
      />
      <View className="absolute bottom-0 left-0 right-0 min-h-[50vh] max-h-[85vh] rounded-t-3xl bg-white shadow-xl overflow-hidden">
        {/* Drag handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-gray-300" />
        </View>

        <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
          <Text className="text-2xl font-lato-bold text-[#4A4A4A]">
            Mosque Info
          </Text>
          <TouchableOpacity
            onPress={() => setShowContactModal(false)}
            className="w-7 h-7 rounded-full justify-center items-center bg-gray-100"
            activeOpacity={0.7}
          >
            <Text className="text-gray-400 font-bold text-base leading-none">
              ×
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Address */}
          {address && (
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="map-pin" size={15} color="#3B5A7A" />
                <Text className="text-sm font-lato-semibold text-[#3B5A7A] uppercase tracking-wide">
                  Address
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const encoded = encodeURIComponent(address);
                  if (Platform.OS === "ios") {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ["Apple Maps", "Google Maps", "Cancel"],
                        cancelButtonIndex: 2,
                      },
                      (index) => {
                        if (index === 0) {
                          Linking.openURL(`https://maps.apple.com/?q=${encoded}`);
                        } else if (index === 1) {
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${encoded}`,
                          );
                        }
                      },
                    );
                  } else {
                    Linking.openURL(`geo:0,0?q=${encoded}`);
                  }
                }}
                activeOpacity={0.7}
                className="pl-6"
              >
                <Text className="text-base font-lato text-[#3B5A7A] leading-6 underline">
                  {address}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hours */}
          {hours && (
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="clock" size={15} color="#4B944B" />
                <Text className="text-sm font-lato-semibold text-[#4B944B] uppercase tracking-wide">
                  Hours
                </Text>
              </View>
              {(
                [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ] as const
              ).map((day) => (
                <View
                  key={day}
                  className={`flex-row justify-between py-1.5 pl-6 pr-2 rounded-lg ${
                    day === todayKey ? "bg-green-50" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-lato capitalize ${
                      day === todayKey
                        ? "font-lato-bold text-[#4B944B]"
                        : "text-[#555]"
                    }`}
                  >
                    {day}
                  </Text>
                  <Text
                    className={`text-sm font-lato ${
                      day === todayKey
                        ? "font-lato-bold text-[#4B944B]"
                        : "text-[#555]"
                    }`}
                  >
                    {hours[day]}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          {(address || hours) && contactInfo.length > 0 && (
            <View className="h-px bg-gray-200 mb-5" />
          )}

          {/* Contact Info */}
          {contactInfo.length > 0 && (
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <Feather name="phone" size={15} color="#5B4B94" />
                <Text className="text-sm font-lato-semibold text-[#5B4B94] uppercase tracking-wide">
                  Contact
                </Text>
              </View>
              {contactInfo.map((info, index) => (
                <View key={index}>
                  <DisplayContactInfo
                    contactInfo={info}
                    onCallPress={handleCallPress}
                    onEmailPress={handleEmailPress}
                  />
                  {index < contactInfo.length - 1 && <View className="h-4" />}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
