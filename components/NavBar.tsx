import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { TouchableOpacity, View } from "react-native";

type page = 'home' | 'calendar' | 'prayerTimes';
//{setPage}: {setPage: (page: page) => void}
export default function Navbar() {
    const router = useRouter();
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
                    <TouchableOpacity
                        className='px-6'
                        // onPress={() => setPage('home')}
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 400 }}
                        >
                            <Ionicons name="home-outline" size={28} color="#4A4A4A" />
                        </MotiView>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='px-6'
                        // onPress={() => setPage('chat') }
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 500 }}
                        >
                            <Feather name="calendar" size={28} color="#4A4A4A" />
                        </MotiView>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='px-6'
                        // onPress={() => setPage('location')}
                    >
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 600 }}
                        >
                            <Feather name="moon" size={28} color="#4A4A4A" />
                        </MotiView>
                    </TouchableOpacity>
                </BlurView>
            </View>
        </MotiView>
    )
}