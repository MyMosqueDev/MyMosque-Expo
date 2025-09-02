import Header from "@/components/Header";
import { Stack, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import "../../global.css";
import { Event } from "../../lib/types";
import { loadFonts } from "../../lib/utils";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const params = useLocalSearchParams();
  const eventData: Event | undefined = params.eventData
    ? JSON.parse(params.eventData as string)
    : undefined;

  useEffect(() => {
    async function prepare() {
      await loadFonts();
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  if (!fontsLoaded || !eventData?.mosqueName) {
    return null;
  }

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        {eventData ? (
          <>
            <Header
              name={eventData.mosqueName}
              type="event"
              title={eventData.title}
            />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Text>Error Fetching Event Data. Please Try Again Later.</Text>
        )}
      </View>
    </ImageBackground>
  );
}
