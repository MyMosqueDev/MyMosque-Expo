import { SafeAreaView, View } from 'react-native';

export default function Container ({ children }: { children: React.ReactNode }) {
    return (
        <View className={'flex flex-1 mx-4 mt-24'}>
                {children}
        </View>
    );
};