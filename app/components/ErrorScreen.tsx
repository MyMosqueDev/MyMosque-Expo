import ScrollContainer from "@/components/ScrollContainer";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

/**
 * ErrorScreen component
 *
 * @param error - The message to display
 * @param onRetry - Offers a retry instead of the mosque switcher, which needs
 *   navigation and so is unavailable while the app is starting
 */
export default function ErrorScreen({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  if (onRetry) {
    return (
      <ImageBackground
        source={require("../../assets/background.png")}
        style={{ flex: 1, justifyContent: "center" }}
        resizeMode="cover"
      >
        <ErrorMessage error={error} />
        <TouchableOpacity
          onPress={onRetry}
          style={{
            alignSelf: "center",
            backgroundColor: "#5B4B94",
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "white", fontFamily: "Lato-Bold" }}>
            Try again
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  return (
    <ScrollContainer name="Error" type="error">
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ErrorMessage error={error} />
      </View>
    </ScrollContainer>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          color: "#FF6B6B",
          fontSize: 18,
          fontFamily: "Lato-Bold",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          color: "#5B4B94",
          fontSize: 14,
          fontFamily: "Lato-Regular",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {error}
      </Text>
      <Text
        style={{
          color: "#5B4B94",
          fontSize: 12,
          fontFamily: "Lato-Regular",
          textAlign: "center",
        }}
      >
        Please try restarting the app or check your internet connection
      </Text>
    </View>
  );
}
