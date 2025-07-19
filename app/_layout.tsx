import { ProcessedMosqueData } from "@/lib/types";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useState } from "react";
import { AppState, ImageBackground, View } from "react-native";
import NavBar from "../components/NavBar";
import '../global.css';
import { fetchMosqueInfo, loadFonts } from "../lib/utils";

SplashScreen.preventAutoHideAsync();

// Create context to track if map is being shown
export const MapContext = createContext({
  isMapVisible: false,
  setIsMapVisible: (visible: boolean) => {},
});

export const useMapContext = () => useContext(MapContext);

// Create context for mosque data
export const MosqueDataContext = createContext<{
  mosqueData: ProcessedMosqueData | null;
  setMosqueData: (data: ProcessedMosqueData | null) => void;
}>({
  mosqueData: null,
  setMosqueData: () => {},
});

export const useMosqueData = () => useContext(MosqueDataContext);

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mosqueData, setMosqueData] = useState<ProcessedMosqueData | null>(null);
  
  useEffect(() => {
    async function prepare() {
      await loadFonts();
      const mosqueData = await fetchMosqueInfo();
      if(mosqueData) {
        setMosqueData(mosqueData);
      }
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }

    prepare();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        prepare();
      }
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MosqueDataContext.Provider value={{ mosqueData, setMosqueData }}>
      <MapContext.Provider value={{ isMapVisible, setIsMapVisible }}>
        <ImageBackground 
          source={require('../assets/background.png')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="map" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="announcements" 
                options={{ 
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name="eventDetails" 
                options={{ 
                  animation: 'slide_from_right'
                }}
              />
            </Stack>
            {!isMapVisible && <NavBar />}
          </View>
        </ImageBackground>
      </MapContext.Provider>
    </MosqueDataContext.Provider>
  );
}
