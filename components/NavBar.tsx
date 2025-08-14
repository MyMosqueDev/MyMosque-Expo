import { useMosqueData } from '@/app/_layout';
import { getNextPrayer } from '@/lib/prayerTimeUtils';
import { Event, PrayerInfo, PrayerTime } from '@/lib/types';
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
    const [mosqueEvents, setMosqueEvents] = useState<Event[] | null>(mosqueData?.events || null);
    const [mosquePrayerTimes, setMosquePrayerTimes] = useState<PrayerInfo | null>(mosqueData?.prayerInfo || null);  
    const pathname = usePathname();

    // fetches mosque data if it doesn't exist
    useEffect(() => {
        if(!mosqueData) {
            const fetchData = async () => {
                const mosqueData = await fetchMosqueInfo();
                if(mosqueData) {
                    setMosqueEvents(mosqueData.events);
                    setMosquePrayerTimes(mosqueData.prayerInfo.prayerTimes);
                }
            }
            fetchData();
        } else {
            setMosqueEvents(mosqueData.events);
            setMosquePrayerTimes(mosqueData.prayerInfo);
        }
    }, [mosqueData]);

    // updates the next prayer time
    const getUpdatedPrayerTimes = () => {
        if(mosquePrayerTimes) {
            // gets the next prayer time (makes sure it hasn't changed)
            const updatedPrayerTimes = getNextPrayer(mosquePrayerTimes.prayerTimes);
            return {
                ...mosquePrayerTimes.prayerTimes,
                nextPrayer: updatedPrayerTimes
            }
        }
        return mosquePrayerTimes;
    }

    // hide nav bar on the following pages
    if (pathname.startsWith('/announcements') || pathname.startsWith('/eventDetails') || pathname.startsWith('/map')) {
        return null;
    }

    const getCurrentPage = (): page => {
        if (pathname === '/') return 'home';
        if (pathname === '/events') return 'events';
        if (pathname === '/prayer') return 'prayers';
        return 'home';
    };
    
    const currentPage = getCurrentPage();
    
    // sets icon color based on the current page
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