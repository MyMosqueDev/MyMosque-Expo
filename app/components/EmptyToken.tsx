import { Platform, Text, View } from "react-native";

// token that shows when there is no data for specific field
export default function EmptyToken({
  type,
}: {
  type: "announcements" | "events" | string;
}) {
  if (type === "announcements") {
    return (
      <View
        className={`w-[90vw] min-h-[170px] border border-white/30 rounded-2xl p-5 m-1 shadow-md items-center justify-center mt-3 ${
          Platform.OS === "android"
            ? "bg-[#f5f7fa]"
            : "backdrop-blur-lg bg-white/50"
        }`}
      >
        <Text className="text-xl font-lato-bold text-text">
          No recent announcements
        </Text>
        <Text className="text-lato text-[#444] text-md text-center">
          Enable notifications to never miss an announcement!
        </Text>
      </View>
    );
  }
  if (type === "events") {
    return (
      <View
        className={`w-[90vw] min-h-[170px] border border-white/30 rounded-2xl p-5 m-1 shadow-md items-center justify-center mt-3 ${
          Platform.OS === "android"
            ? "bg-[#f5f7fa]"
            : "backdrop-blur-lg bg-white/50"
        }`}
      >
        <Text className="text-xl font-lato-bold text-text">
          No upcoming events
        </Text>
        <Text className="text-lato text-[#444] text-md">
          Enable notifications to never miss an event!
        </Text>
      </View>
    );
  }
  return (
    <View
      className={`w-[90vw] min-h-[170px] border border-white/30 rounded-2xl p-5 m-1 shadow-md items-center justify-center ${
        type === "announcements" ? "mt-3" : ""
      } ${
        Platform.OS === "android"
          ? "bg-[#f5f7fa]"
          : "backdrop-blur-lg bg-white/50"
      }`}
    >
      <Text className="text-xl font-lato-bold text-text">No {type} found</Text>
      <Text className="text-lato text-[#444] text-md">
        Enable notifications to never miss an update!
      </Text>
    </View>
  );
}
