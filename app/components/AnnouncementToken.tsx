import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Announcement } from "../../lib/types";

export default function AnnouncementToken({ announcement }: { announcement: Announcement }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const severityStyles = getSeverityStyles(announcement.severity);
    const date = format(parseISO(announcement.created_at), 'EEEE, MMMM d')
    
    return (
        <>
            <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View className="w-[90vw] min-h-[170px] backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-1 bg-white/50 shadow-md">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-2xl font-lato-bold text-text">{announcement.title}</Text>
                        <View className={`${severityStyles.bg} px-3 py-1 rounded-full`}>
                            <Text className={`${severityStyles.text} font-lato-semibold text-sm`}>{announcement.severity}</Text>
                        </View>
                    </View>
                    <Text className="text-base text-[#5A6B7A] mb-2">{date}</Text>
                    <Text className="text-base text-[#444]">{announcement.description.length > 80 ? `${announcement.description.substring(0, 80) + "..."} ` : announcement.description}{announcement.description.length > 85 && <Text className="font-bold">See More</Text>}</Text>
                    {announcement.image && (
                        <View className="absolute bottom-5 left-5 flex-row items-center">
                            <MaterialCommunityIcons name="image" size={16} color="#5A6B7A" />
                            <Text className="text-sm text-[#5A6B7A] ml-2 font-lato-semibold">Tap to view image</Text>
                        </View>
                    )}
                </View>

            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    className="flex-1 justify-center items-center bg-black/30"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity 
                        className="w-[90vw] backdrop-blur-lg border border-white/30 rounded-2xl p-6 bg-white shadow-lg"
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <Text className="text-2xl font-lato-bold text-text flex-1 mr-3">{announcement.title}</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                className="w-8 h-8 rounded-full justify-center items-center bg-gray-200/70 backdrop-blur-sm border border-white/30"
                                activeOpacity={0.7}
                            >
                                <Text className="text-gray-600 font-bold text-lg">×</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-base text-[#5A6B7A]">{date}</Text>
                            <View className={`${severityStyles.bg} px-3 py-1 rounded-full`}>
                                <Text className={`${severityStyles.text} font-lato-semibold text-sm`}>{announcement.severity}</Text>
                            </View>
                        </View>
                        
                        {announcement.image && (
                            <View className="mb-4">
                                <TouchableOpacity 
                                    onPress={() => {
                                        setImageModalVisible(true);
                                        setModalVisible(false);
                                    }}
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
                        
                        <Text className="text-base text-[#444] leading-6">{announcement.description}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Full-screen image modal */}
            {announcement.image && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={imageModalVisible}
                    onRequestClose={() => setImageModalVisible(false)}
                >
                    <TouchableOpacity 
                        className="flex-1 justify-center items-center bg-black/90"
                        activeOpacity={1}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Image 
                            source={{ uri: announcement.image }}
                            className="w-screen h-screen"
                            resizeMode="contain"
                        />
                        <TouchableOpacity 
                            onPress={() => setImageModalVisible(false)}
                            className="absolute top-12 right-4 w-10 h-10 rounded-full justify-center items-center bg-black/50 backdrop-blur-sm border border-white/30"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white font-bold text-xl">×</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}
        </>
    )
}

// function that sets styles based on severity
const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'high':
            return {
                bg: 'bg-red-200',
                text: 'text-red-700'
            };
        case 'medium':
            return {
                bg: 'bg-yellow-200',
                text: 'text-yellow-700'
            };
        case 'low':
            return {
                bg: 'bg-green-200',
                text: 'text-green-700'
            };
        default:
            return {
                bg: 'bg-gray-200',
                text: 'text-gray-700'
            };
    }
};