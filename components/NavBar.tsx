import { useMosqueData } from '@/app/_layout';
import { getNextPrayer } from '@/lib/getPrayerTimes';
import { Event, PrayerTime } from '@/lib/types';
import { fetchMosqueInfo } from "@/lib/utils";
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import { Link, usePathname } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { View } from "react-native";

type page = 'home' | 'events' | 'prayers';
export default function Navbar() {
    const { mosqueData } = useMosqueData();
    const [page, setPage] = useState<page>('home');
    const [mosqueEvents, setMosqueEvents] = useState<Event[] | null>(mosqueData?.events || null);
    const [mosquePrayerTimes, setMosquePrayerTimes] = useState<PrayerTime | null>(mosqueData?.prayerTimes || null);  
    const pathname = usePathname();

    useEffect(() => {
        if(!mosqueData) {
            const fetchData = async () => {
                const mosqueData = await fetchMosqueInfo();
                if(mosqueData) {
                    setMosqueEvents(mosqueData.events);
                    setMosquePrayerTimes(mosqueData.prayerTimes);
                }
            }
            fetchData();
        } else {
            setMosqueEvents(mosqueData.events);
            setMosquePrayerTimes(mosqueData.prayerTimes);
        }
    }, [mosqueData]);

    const getUpdatedPrayerTimes = () => {
        if(mosquePrayerTimes) {
            const updatedPrayerTimes = getNextPrayer(mosquePrayerTimes);
            return {
                ...mosquePrayerTimes,
                nextPrayer: updatedPrayerTimes
            }
        }
        return mosquePrayerTimes;
    }

    if (pathname.startsWith('/announcements') || pathname.startsWith('/eventDetails')) {
        return null;
    }

    const getCurrentPage = (): page => {
        if (pathname === '/') return 'home';
        if (pathname === '/events') return 'events';
        if (pathname === '/prayer') return 'prayers';
        return 'home';
    };
    
    const currentPage = getCurrentPage();
    
    const handlePagePress = (newPage: page) => {
        setPage(newPage);
    };
    
    const getIconColor = (pageName: page) => {
        if (currentPage === pageName) {
            switch (pageName) {
                case 'home':
                    return '#88AE79';
                case 'events':
                    return '#3B5A7A';
                case 'prayers':
                    return '#5B4B94';
                default:
                    return '#1F2937';
            }
        }
        return '#4A4A4A';
    };
    
    return (
        <MotiView 
            className='w-full absolute bottom-0 flex justify-center items-center z-10 '
            from={{ translateY: 100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 500 }}
        >
            <View className='w-10/12 mb-[2rem] rounded-full border border-white/40 overflow-hidden'>
                <BlurView 
                    intensity={25}
                    tint="light"
                    className='w-full flex-row items-center justify-between px-6 py-3'
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                    <Link 
                        href="/" 
                        onPress={() => handlePagePress('home')}
                        className={`px-6 py-2 rounded-full ${currentPage === 'home' ? 'bg-white/30' : ''}`}
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ 
                                scale: currentPage === 'home' ? 1.1 : 1,
                                opacity: currentPage === 'home' ? 1 : 0.7
                            }}
                            transition={{ 
                                type: 'timing', 
                                duration: 150
                            }}
                        >
                            <Feather name="home" size={28} color={getIconColor('home')} />
                        </MotiView>
                    </Link>
                    
                    <Link 
                        href={{
                            pathname: "/events",
                            params: {
                                events: mosqueEvents ? JSON.stringify(mosqueEvents) : '[]'
                            }
                        }}
                        onPress={() => handlePagePress('events')}
                        className={`px-6 py-2 rounded-full ${currentPage === 'events' ? 'bg-white/30' : ''}`}
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ 
                                scale: currentPage === 'events' ? 1.1 : 1,
                                opacity: currentPage === 'events' ? 1 : 0.7
                            }}
                            transition={{ 
                                type: 'timing', 
                                duration: 150
                            }}
                        >
                            <Feather name="calendar" size={28} color={getIconColor('events')} />
                        </MotiView>
                    </Link>
                    
                    <Link 
                        href={{
                            pathname: "/prayer",
                            params: {
                                prayerTimes: mosquePrayerTimes ? JSON.stringify(getUpdatedPrayerTimes()) : '{}'
                            }
                        }}
                        onPress={() => handlePagePress('prayers')}
                        className={`px-6 py-2 rounded-full ${currentPage === 'prayers' ? 'bg-white/30' : ''}`}
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ 
                                scale: currentPage === 'prayers' ? 1.1 : 1,
                                opacity: currentPage === 'prayers' ? 1 : 0.7
                            }}
                            transition={{ 
                                type: 'timing', 
                                duration: 150
                            }}
                        >
                            <Feather name="moon" size={28} color={getIconColor('prayers')} />
                        </MotiView>
                    </Link>
                </BlurView>
            </View>
        </MotiView>
    )
}