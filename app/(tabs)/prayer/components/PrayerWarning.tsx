import { MotiView } from "moti";
import { Text, View } from "react-native";

/**
 * PrayerWarning component
 *
 * Displays a warning message with a yellow background.
 *
 * @param warning - The warning message to display
 */
export default function PrayerWarning({ warning }: { warning: string }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 150 }}
      className="w-full max-w-md mb-4"
    >
      <View className="w-full bg-yellow-100 rounded-3xl p-3">
        <Text className="text-yellow-700 text-sm font-lato-bold text-center">
          ⚠️ {warning}
        </Text>
      </View>
    </MotiView>
  );
}
