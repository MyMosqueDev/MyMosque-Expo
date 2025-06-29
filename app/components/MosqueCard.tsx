import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
type MosqueData = {
    name: string;
    address: string;
    images?: string[];
    coordinates: {
        latitude: number;
        longitude: number;
    }
}

interface MosqueCardProps {
    data: MosqueData;
    mapRef: React.RefObject<MapView | null>;
}

const MosqueCard = ({ data, mapRef } : MosqueCardProps) => {
    const name = data.name.length > 35 ? data.name.slice(0, 35) + "..." : data.name;
    const address = data.address.length > 45 ? data.address.slice(0, 45) + "..." : data.address;
    const images = data.images || [];
    const [isFavorited, setIsFavorited] = useState(false);

    const toggleFavorite = (e: any) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    const onCardPress = () => {
        mapRef.current?.animateToRegion({
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    }

    return (
        <TouchableOpacity 
            className="w-full bg-white/30 rounded-2xl p-4 my-2 backdrop-blur-lg border border-white/30"
            onPress={onCardPress}
            activeOpacity={0.8}
        >
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-xl font-lato-bold text-gray-800">{name}</Text>
                    <Text className="text-base font-lato text-gray-500">{address}</Text>
                </View>
                <TouchableOpacity 
                    onPress={toggleFavorite}
                >
                    <AntDesign 
                        name={isFavorited ? "star" : "staro"} 
                        size={24} 
                        color="#FBBF24" 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
            >
                {images.length > 0 ? (
                    images.map((imageUrl: string, index: number) => (
                        <ImageBackground
                            key={index}
                            source={{ uri: imageUrl }}
                            className={`w-44 h-24 ${index === images.length - 1 ? '' : 'mr-2'}`}
                            imageStyle={{ borderRadius: 6 }}
                            resizeMode="cover"
                        />
                    ))
                ) : (
                    <>
                        <View className="w-32 h-24 bg-white/70 rounded-lg mr-2" />
                        <View className="w-32 h-24 bg-white/70 rounded-lg mr-2" />
                        <View className="w-32 h-24 bg-white/70 rounded-lg" />
                    </>
                )}
            </ScrollView>
        </TouchableOpacity>
    );
};

export default MosqueCard;