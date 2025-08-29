import ScrollContainer from "@/components/ScrollContainer";
import { View, Text } from "react-native";

export default function Loading({ name }: { name: string }) {
    return (
        <ScrollContainer name={name}>
            <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
            </View>
        </ScrollContainer>
    );
}