import { Text, View } from "react-native";

type EmptyTokenType = "announcement" | "event";

export default function EmptyToken({ type }: { type: EmptyTokenType }) {
  if (type) {
    return (
      <View className="w-[90vw] min-h-[170px] backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-1 bg-white/50 shadow-md items-center justify-center mt-3">
        <Text className="text-xl font-lato-bold text-text">
          No recent {type}
        </Text>
        <Text className="text-lato text-[#444] text-md text-center">
          Enable notifications to never miss a {type}!
        </Text>
      </View>
    );
  }
  return (
    <View
      className={`w-[90vw] min-h-[170px] backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-1 bg-white/50 shadow-md items-center justify-center ${type === "announcements" ? "mt-3" : ""}`}
    >
      <Text className="text-xl font-lato-bold text-text">No {type} found</Text>
      <Text className="text-lato text-[#444] text-md">
        Enable notifications to never miss an update!
      </Text>
    </View>
  );
}
