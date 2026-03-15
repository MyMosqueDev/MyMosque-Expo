import { Platform, Text, View } from "react-native";

type EmptyTokenType = "announcement" | "event";

export default function EmptyToken({ type }: { type: EmptyTokenType }) {
  if (type) {
    return (
      <View
        className={`w-[90vw] min-h-[170px] border border-white/30 rounded-2xl p-5 m-1 shadow-md items-center justify-center mt-3 ${
          Platform.OS === "android"
            ? "bg-[#f5f7fa]"
            : "backdrop-blur-lg bg-white/50"
        }`}
      >
        <Text className="text-xl font-lato-bold text-text">
          No recent {type}
        </Text>
        <Text className="text-lato text-[#444] text-md text-center">
<<<<<<< HEAD
          Enable notifications to never miss a {type}!
=======
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
>>>>>>> ad78250b8af43d3107ef679730c5f110ab657514
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
