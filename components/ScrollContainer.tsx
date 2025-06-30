import { ImageBackground, ScrollView } from 'react-native';
import Header from './Header';
import NavBar from './NavBar';
export default function ScrollContainer ({ children, name }: { children: React.ReactNode, name: string }) {
    return (
        <ImageBackground 
            source={require('../assets/background.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <Header name={name} />
            <ScrollView 
                className={'flex flex-1 px-4 pt-1 '}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 90 }}
            >
                {children}
            </ScrollView>
            <NavBar />
        </ImageBackground>
    );
};