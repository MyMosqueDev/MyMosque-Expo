import { DevModeProvider } from "@/lib/devMode";
import { loadPrayerNotificationSettings, schedulePrayerNotifications } from "@/lib/prayerNotifications";
import { getTodaysPrayerTimes } from "@/lib/prayerTimeUtils";
import { ProcessedMosqueData } from "@/lib/types";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, ImageBackground, Text, View } from "react-native";
import ErrorBoundary from "../components/ErrorBoundary";
import FloatingDebugButton from "../components/FloatingDebugButton";
import NavBar from "../components/NavBar";
import "../global.css";
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
  const [mosqueData, setMosqueData] = useState<ProcessedMosqueData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const mosqueDataRef = useRef<ProcessedMosqueData | null>(null);

  // Keep ref in sync with state for use in AppState listener
  useEffect(() => {
    mosqueDataRef.current = mosqueData;
  }, [mosqueData]);

  useEffect(() => {
    async function prepare() {
      // resetStorage();
      try {
        console.log("Starting app preparation...");

        // Load fonts first
        console.log("Loading fonts...");
        await loadFonts();
        console.log("Fonts loaded successfully");

        // Fetch mosque info (this handles sync logic internally)
        console.log("Fetching mosque info...");
        const fetchedMosqueData = await fetchMosqueInfo();
        console.log("Mosque data fetched:", fetchedMosqueData ? "success" : "null");

        if (fetchedMosqueData) {
          setMosqueData(fetchedMosqueData);

          // Schedule prayer notifications on app startup if enabled
          const prayerNotificationSettings = loadPrayerNotificationSettings();
          if (prayerNotificationSettings.enabled && fetchedMosqueData.info?.uid && fetchedMosqueData.info?.name) {
            schedulePrayerNotifications(
              fetchedMosqueData.info.uid,
              fetchedMosqueData.info.name
            ).catch((error) =>
              console.error("Error scheduling prayer notifications on startup:", error)
            );
          }
        }

        setFontsLoaded(true);
        console.log("App preparation completed successfully");
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error during app preparation:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
        // Still set fonts loaded to prevent infinite loading
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    // Recomputes today's prayer times from stored monthly schedule (no network call)
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

    prepare();

    // Refreshes data when app is brought back to life
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("App became active...");
        // First, quickly refresh prayer times locally from stored monthly data
        refreshPrayerTimesLocally();
        // Then do a full sync in background to check for any updates
        prepare();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // loading screen
  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require("../assets/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: "#5B4B94",
              fontSize: 18,
              fontFamily: "Lato-Regular",
            }}
          >
            Loading...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // error screen
  if (error) {
    return (
      <ImageBackground
        source={require("../assets/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
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
            Please try restarting the app
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // main layout
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
                {/* nav bar shows if map is not visible */}
                {!isMapVisible && <NavBar />}
                {/* floating debug button shows when dev mode is enabled */}
                <FloatingDebugButton />
              </View>
            </ImageBackground>
          </MapContext.Provider>
        </MosqueDataContext.Provider>
      </DevModeProvider>
    </ErrorBoundary>
  );
}
