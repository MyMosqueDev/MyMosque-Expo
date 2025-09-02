import { ImageBackground, View } from "react-native";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className={"flex flex-1 mx-4 mt-24"}>{children}</View>
    </ImageBackground>
  );
}
