import { ImageBackground, ScrollView } from "react-native";
import Header from "./Header";
export default function ScrollContainer({
  children,
  name,
  type,
}: {
  children: React.ReactNode;
  name: string;
  type?: "default" | "event" | "settings" | "error";
}) {
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Header name={name} type={type || "default"} title={null} />
      <ScrollView
        className={"flex flex-1 px-4 pt-1"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          flexGrow: 1,
        }}
      >
        {children}
      </ScrollView>
    </ImageBackground>
  );
}
