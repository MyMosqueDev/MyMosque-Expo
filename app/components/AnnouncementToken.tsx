import { Text, View } from "react-native";
import { MosqueData } from "../../lib/types";

export default function AnnouncementToken({ announcement }: { announcement: MosqueData["announcements"][0] }) {
    const severityStyles = getSeverityStyles(announcement.severity);
    
    return (
        <View className="w-full backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-1 bg-white/50 shadow-md">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-2xl font-lato-bold text-text">{announcement.title}</Text>
                <View className={`${severityStyles.bg} px-3 py-1 rounded-full`}>
                    <Text className={`${severityStyles.text} font-lato-semibold text-sm`}>{announcement.severity}</Text>
                </View>
            </View>
            <Text className="text-base text-[#5A6B7A] mb-2">{announcement.date}</Text>
            <Text className="text-base text-[#444]">{announcement.description.length > 100 ? `${announcement.description.substring(0, 100) + "..."} ` : announcement.description}{announcement.description.length > 100 && <Text className="font-bold">See More</Text>}</Text>
        </View>
    )
}

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