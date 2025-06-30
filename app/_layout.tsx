import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { ImageBackground } from "react-native";
import '../global.css';
import { loadFonts } from "../lib/utils";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      await loadFonts();
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground 
      source={require('../assets/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      />
    </ImageBackground>
  );
}
