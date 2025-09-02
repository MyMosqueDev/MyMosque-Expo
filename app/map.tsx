import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import Container from "../components/Container";
import { supabase } from "../lib/supabase";
import { MosqueInfo, UserData } from "../lib/types";
import MosqueCard from "./components/MosqueCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Map({
  setUserData,
}: {
  setUserData?: (userData: UserData) => void;
}) {
  const [mosques, setMosques] = useState<MosqueInfo[]>([]);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // fetches mosques from supabase
  useEffect(() => {
    const getMosques = async () => {
      try {
        console.log("Fetching mosques from Supabase...");
        const { data, error } = await supabase.from("mosques").select("*");

        if (error) {
          console.error("Error fetching mosques:", error);
          setError("Failed to load mosques");
          return;
        }

        if (data) {
          console.log("Mosques loaded successfully:", data.length);
          const settingsString = await AsyncStorage.getItem("appSettings");
          const settings = JSON.parse(settingsString || "{}");
          if (settings.development && settings.development.enabled) {
            setMosques(data);
          } else {
            setMosques(data.filter((mosque) => mosque.id !== 2));
          }
        }
      } catch (error) {
        console.error("Error in getMosques:", error);
        setError("Failed to load mosques");
      }
    };

    getMosques();

    setInitialRegion({
      latitude: 30.283252,
      longitude: -97.744386,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  }, []);

  if (error) {
    return (
      <Container>
        <View className="flex-1 flex-col items-center justify-center gap-3">
          <Text className="text-red-500 text-lg font-lato-bold text-center mb-4">
            {error}
          </Text>
          <Text className="text-text/70 text-sm font-lato text-center">
            Please check your internet connection and try again
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className=" flex-1 flex-col items-center gap-3">
        <MotiView
          from={{
            opacity: 0,
            translateY: -50,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: "timing",
            duration: 500,
            delay: 100,
          }}
          className="w-full justify-center items-center"
        >
          <Text className="text-text text-4xl w-5/6 text-center font-lato-bold mb-4">
            View Our Mosques!
          </Text>
        </MotiView>

        <MotiView
          from={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "timing",
            duration: 600,
            delay: 200,
          }}
          className="w-full h-80 rounded-lg overflow-hidden border-2 border-text"
        >
          <MapView
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            initialRegion={initialRegion || undefined}
            showsUserLocation={true}
            showsMyLocationButton={true}
            userInterfaceStyle="dark"
          >
            {mosques.map((mosque: MosqueInfo, index: number) => (
              <Marker
                key={`${mosque.name}-${index}`}
                coordinate={{
                  latitude: mosque.coordinates.latitude,
                  longitude: mosque.coordinates.longitude,
                }}
                title={mosque.name}
                description={mosque.address}
                pinColor="#FBBF24"
              />
            ))}
          </MapView>
        </MotiView>

        <View className="w-full flex-1">
          <MotiView
            from={{
              opacity: 0,
              translateX: 100,
            }}
            animate={{
              opacity: 1,
              translateX: 0,
            }}
            transition={{
              type: "timing",
              duration: 400,
              delay: 300,
            }}
          >
            {
              // TODO: add search bar once more mosques are added
              /* <View className="w-full min-h-12 flex-row items-center justify-center gap-3 backdrop-blur-lg border border-white/30 bg-white/30 rounded-3xl px-4 py-2 mb-3"> 
              <Feather name="search" size={20} color="#4A4A4A" className="mt-1"/>
              <TextInput
                placeholder="Search For a Mosque"
                placeholderTextColor="#4A4A4A"
                className="text-text text-lg font-lato flex-1 h-full mb-1"
                multiline={true}
              />
            </View> */
            }
            <Text className="text-text/70 text-sm font-lato text-center mb-3">
              Listed mosques are within our current limited network
            </Text>
          </MotiView>

          <ScrollView
            className="w-full flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {mosques.map((mosque: MosqueInfo, index: number) => (
              <MotiView
                key={mosque.name}
                from={{
                  opacity: 0,
                  translateY: 50,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: "timing",
                  duration: 300,
                  delay: 400 + index * 100,
                }}
              >
                <MosqueCard
                  data={mosque}
                  mapRef={mapRef}
                  setUserData={setUserData}
                />
              </MotiView>
            ))}
          </ScrollView>
        </View>
      </View>
    </Container>
  );
}
