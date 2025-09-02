import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ContactInfo as ContactInfoType } from "@/lib/types";

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
      {/* Phone Contact */}
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
          <Text className="text-sm font-lato text-[#6B7280 underline">
            {contactInfo.phoneNumber}
          </Text>
        </TouchableOpacity>
      )}
      {/* Email Contact */}
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
}

export default function ContactInfoModal({
  isVisible,
  setShowContactModal,
  contactInfo,
}: ContactInfoModalProps) {
  const handleCallPress = (phoneNumber: string) => {
    setShowContactModal(false);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (email: string) => {
    setShowContactModal(false);
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setShowContactModal(false)}
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/30"
        activeOpacity={1}
        onPress={() => setShowContactModal(false)}
      >
        <View className="w-[85vw] max-h-[80vh] bg-white backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-lato-bold text-[#4A4A4A]">
              Contact Info
            </Text>
            <TouchableOpacity
              onPress={() => setShowContactModal(false)}
              className="w-8 h-8 rounded-full justify-center items-center bg-gray-200/70 backdrop-blur-sm border border-white/30"
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 font-bold text-lg">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            style={{ maxHeight: 400 }}
          >
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
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
