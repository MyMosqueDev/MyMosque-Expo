import { DevModeProvider } from "@/lib/devMode";
import { loadPrayerNotificationSettings, schedulePrayerNotifications } from "@/lib/prayerNotifications";
import { getTodaysPrayerTimes } from "@/lib/prayerTimeUtils";
import { ProcessedMosqueData } from "@/lib/types";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, ImageBackground, View } from "react-native";
import ErrorBoundary from "../components/ErrorBoundary";
import FloatingDebugButton from "../components/FloatingDebugButton";
import NavBar from "../components/NavBar";
import "../global.css";
import { fetchMosqueInfo, loadFonts } from "../lib/utils";
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
  const [appPreparing, setAppPreparing] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
  const [mosqueData, setMosqueData] = useState<ProcessedMosqueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mosqueDataRef = useRef<ProcessedMosqueData | null>(null);

  useEffect(() => {
    mosqueDataRef.current = mosqueData;
  }, [mosqueData]);

  // TODO: there's a lot going on here, needs to be refactored
  useEffect(() => {
    async function prepare() {
      try {
        console.log("Starting app preparation...");

        console.log("Loading fonts...");
        await loadFonts();
        console.log("Fonts loaded successfully");

        console.log("Fetching mosque info...");
        const fetchedMosqueData = await fetchMosqueInfo();
        console.log("Mosque data fetched:", fetchedMosqueData ? "success" : "null");

        if (fetchedMosqueData) {
          setMosqueData(fetchedMosqueData);

          const prayerNotificationSettings = loadPrayerNotificationSettings();
          if (prayerNotificationSettings.enabled && fetchedMosqueData.info.uid && fetchedMosqueData.info.name) {
            schedulePrayerNotifications(
              fetchedMosqueData.info.uid,
              fetchedMosqueData.info.name
            ).catch((error) =>
              console.error("Error scheduling prayer notifications on startup:", error)
            );
          }
        }

        console.log("App preparation completed successfully");
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error during app preparation:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
        await SplashScreen.hideAsync();;
      }
      setAppPreparing(false);
    }


    function refreshPrayerTimesLocally() {
      const currentData = mosqueDataRef.current;
      if (currentData?.monthlyPrayerSchedule && currentData?.jummahTimes) {
        const freshPrayerTimes = getTodaysPrayerTimes(
          currentData.monthlyPrayerSchedule,
          currentData.jummahTimes,
        );
        if (freshPrayerTimes) {
          setMosqueData({
            ...currentData,
            prayerTimes: freshPrayerTimes,
          });
          console.log("Prayer times refreshed locally from stored monthly schedule");
        }
      }
    }
    setAppPreparing(true);
    prepare();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("App became active...");
        refreshPrayerTimesLocally();
        prepare();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (appPreparing) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen error={error || "Unknown error occurred"} />
    );
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
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen
                    name="eventDetails"
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
