import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { UserData } from "../lib/types";
import MosqueMap from './MosqueMap';

export default function Index() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    const parsedUserData = JSON.parse(userDataString);
                    setUserData(parsedUserData);
                } else {
                    const defaultUserData = {
                        favoriteMosques: [],
                        lastVisitedMosque: null,
                    };
                    setUserData(defaultUserData);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                const defaultUserData = {
                    favoriteMosques: [],
                    lastVisitedMosque: null,
                };
                setUserData(defaultUserData);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    if (isLoading) {
        return (
            <ImageBackground 
                source={require('../assets/background.png')}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <View className="flex-1 items-center justify-center">
                    <Text className="text-text text-lg font-lato">Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    // If no last visited mosque, show the map
    if (!userData?.lastVisitedMosque) {
        return <MosqueMap />;
    }

    // If there is a last visited mosque, show the welcome page
    return (
        <ImageBackground 
            source={require('../assets/background.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <View className="flex-1 items-center justify-center">
                <Text className="text-text text-4xl font-lato-bold">Welcome Back!</Text>
                <Text className="text-text text-lg font-lato mt-4">This is the Home page</Text>
            </View>
        </ImageBackground>
    );
}