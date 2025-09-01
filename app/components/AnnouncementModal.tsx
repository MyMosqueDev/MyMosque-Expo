import { format, parseISO } from 'date-fns';
import { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Announcement } from "../../lib/types";
import { getSeverityStyles } from "@/lib/utils";

interface AnnouncementModalProps {
    announcement: Announcement;
    visible: boolean;
    onClose: () => void;
}

/**
 * AnnouncementModal component
 * 
 * Displays a modal with full announcement details and image viewing capability.
 * 
 * @param announcement - The announcement data to display
 * @param visible - Whether the modal is visible
 * @param onClose - Callback to close the modal
 */
export default function AnnouncementModal({ announcement, visible, onClose }: AnnouncementModalProps) {
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const severityStyles = getSeverityStyles(announcement.severity);
    const date = format(parseISO(announcement.created_at), 'EEEE, MMMM d');

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
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <TouchableOpacity 
                    className="flex-1 justify-center items-center bg-black/30"
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity 
                        className="w-[90vw] backdrop-blur-lg border border-white/30 rounded-2xl p-6 bg-white shadow-lg"
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <Text className="text-2xl font-lato-bold text-text flex-1 mr-3">
                                {announcement.title}
                            </Text>
                            <TouchableOpacity 
                                onPress={onClose}
                                className="w-8 h-8 rounded-full justify-center items-center bg-gray-200/70 backdrop-blur-sm border border-white/30"
                                activeOpacity={0.7}
                            >
                                <Text className="text-gray-600 font-bold text-lg">×</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-base text-[#5A6B7A]">{date}</Text>
                            <View className={`${severityStyles.bg} px-3 py-1 rounded-full`}>
                                <Text className={`${severityStyles.text} font-lato-semibold text-sm`}>
                                    {announcement.severity}
                                </Text>
                            </View>
                        </View>
                        
                        {announcement.image && (
                            <View className="mb-4">
                                <TouchableOpacity 
                                    onPress={handleImagePress}
                                    activeOpacity={0.8}
                                >
                                    <Image 
                                        source={{ uri: announcement.image }}
                                        className="w-full h-48 rounded-lg"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <Text className="text-base text-[#444] leading-6">
                            {announcement.description}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
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