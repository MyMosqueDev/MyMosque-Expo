import { DevModeProvider } from "@/lib/devMode";
import { useMosqueSync } from "@/lib/hooks/useMosqueSync";
import { ProcessedMosqueData } from "@/lib/types";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useContext, useEffect, useState } from "react";
import { ImageBackground, View } from "react-native";
import ErrorBoundary from "../components/ErrorBoundary";
import FloatingDebugButton from "../components/FloatingDebugButton";
import NavBar from "../components/NavBar";
import "../global.css";
import ErrorScreen from "./components/ErrorScreen";
import LoadingScreen from "./components/LoadingScreen";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export const MapContext = createContext({
  isMapVisible: false,
  setIsMapVisible: (visible: boolean) => {},
});

export const useMapContext = () => useContext(MapContext);

export const MosqueDataContext = createContext<{
  mosqueData: ProcessedMosqueData | null;
  setMosqueData: (data: ProcessedMosqueData | null) => void;
}>({
  mosqueData: null,
  setMosqueData: () => {},
});

export const useMosqueData = () => useContext(MosqueDataContext);

export default function RootLayout() {
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
  const { isLoading, error, retry, mosqueData, setMosqueData } =
    useMosqueSync();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={retry} />;
  }

  return (
    <ErrorBoundary>
      <DevModeProvider>
        <MosqueDataContext.Provider value={{ mosqueData, setMosqueData }}>
          <MapContext.Provider value={{ isMapVisible, setIsMapVisible }}>
            <ImageBackground
              source={require("../assets/background.png")}
              style={{ flex: 1 }}
              resizeMode="cover"
            >
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
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
                      animation: "slide_from_right",
                    }}
                  />
                </Stack>

                {!isMapVisible && <NavBar />}

                <FloatingDebugButton />
              </View>
            </ImageBackground>
          </MapContext.Provider>
        </MosqueDataContext.Provider>
      </DevModeProvider>
    </ErrorBoundary>
  );
}
