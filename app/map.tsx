import Feather from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Marker, Region } from 'react-native-maps';
import Container from "../components/Container";
import { mosqueData } from '../lib/data';
import { MosqueData } from '../lib/types';
import MosqueCard from "./components/MosqueCard";

export default function Map() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {

    const getLocation = async () => {
      Location.requestForegroundPermissionsAsync();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setInitialRegion({
          latitude: 30.283252,
          longitude: -97.744386,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync();

      setInitialRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    getLocation();

  }, []);

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
            type: 'timing',
            duration: 500,
            delay: 100,
          }}
          className="w-full justify-center items-center"
        >
          <Text className="text-text text-4xl w-5/6 text-center font-lato-bold mb-4">Add Your Go-To Mosques!</Text>
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
            type: 'timing',
            duration: 600,
            delay: 200,
          }}
          className="w-full h-80 rounded-lg overflow-hidden border-2 border-text"
        >
          <MapView
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
            initialRegion={initialRegion || undefined}
            showsUserLocation={true}
            showsMyLocationButton={true}
            userInterfaceStyle="dark"
          >
            {mosqueData.map((mosque: MosqueData, index: number) => (
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
              type: 'timing',
              duration: 400,
              delay: 300,
            }}
          >
            <View className="w-full min-h-12 flex-row items-center justify-center gap-3 backdrop-blur-lg border border-white/30 bg-white/30 rounded-3xl px-4 py-2 mb-3"> 
              <Feather name="search" size={20} color="#4A4A4A" className="mt-1"/>
              <TextInput
                placeholder="Search For a Mosque"
                placeholderTextColor="#4A4A4A"
                className="text-text text-lg font-lato flex-1 h-full mb-1"
                multiline={true}
              />
            </View>
          </MotiView>
          
          <ScrollView 
            className="w-full flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {
              mosqueData.map((mosque : MosqueData, index: number) => (
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
                    type: 'timing',
                    duration: 300,
                    delay: 400 + (index * 100),
                  }}
                >
                  <MosqueCard data={mosque} mapRef={mapRef}/>
                </MotiView>
              ))
            }
          </ScrollView>
        </View>
      </View>
    </Container>
  );
}
