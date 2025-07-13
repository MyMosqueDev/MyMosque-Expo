import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { View } from "react-native";

type page = 'home' | 'events' | 'prayers';
//{setPage}: {setPage: (page: page) => void}
export default function Navbar() {
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
                    <Link href="/" className='px-6'>
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 400 }}
                        >
                            <Ionicons name="home-outline" size={28} color="#4A4A4A" />
                        </MotiView>
                    </Link>
                    <Link href="/events" className='px-6'>
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 500 }}
                        >
                            <Feather name="calendar" size={28} color="#4A4A4A" />
                        </MotiView>
                    </Link>
                    <Link href="/prayers" className='px-6'>
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 600 }}
                        >
                            <Feather name="moon" size={28} color="#4A4A4A" />
                        </MotiView>
                    </Link>
                </BlurView>
            </View>
        </MotiView>
    )
}