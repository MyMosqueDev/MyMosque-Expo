import { useMapContext } from "@/app/_layout";
import Home from "@/app/home";
import Map from "@/app/map";
import { UserData } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";

export default function Index() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { setIsMapVisible } = useMapContext();

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

    // Update map visibility based on user data
    useEffect(() => {
        const isMapShowing = !userData?.lastVisitedMosque;
        setIsMapVisible(isMapShowing);
    }, [userData, setIsMapVisible]);

    if (isLoading) {
        return (
            <ImageBackground 
                source={require('../../assets/background.png')}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <View className="flex-1 items-center justify-center">
                    <Text className="text-text text-lg font-lato">Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    // if no last visited mosque, show the map
    // if (!userData?.lastVisitedMosque) {
    //     return <Map />;
    // }

    // if there is a last visited mosque, show the welcome page
    return (
       !userData?.lastVisitedMosque ? <Map setUserData={setUserData}/> : <Home />
    );
}