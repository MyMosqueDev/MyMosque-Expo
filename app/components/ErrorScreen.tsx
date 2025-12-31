import ScrollContainer from "@/components/ScrollContainer";
import { Text, View } from "react-native";

export default function ErrorScreen({ error }: { error: string }) {
  return (
    <ScrollContainer name="Error" type="error">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
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
    </ScrollContainer>
  );
}
