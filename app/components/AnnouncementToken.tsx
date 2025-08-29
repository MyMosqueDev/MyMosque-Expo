import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Announcement } from "../../lib/types";
import AnnouncementModal from "./AnnouncementModal";
import { getSeverityStyles } from "@/lib/utils";

export default function AnnouncementToken({ announcement }: { announcement: Announcement }) {
    const [modalVisible, setModalVisible] = useState(false);
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

            <AnnouncementModal 
                announcement={announcement}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    )
}