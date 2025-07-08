import ScrollContainer from "@/components/ScrollContainer";
import { Text, View } from "react-native";

export default function Events() {
    return (
        <ScrollContainer name="Events">
            <View className="flex-1 items-center justify-center">
                <Text className="text-text text-[24px] font-lato-bold">event page</Text>
            </View>
        </ScrollContainer>
    );
}
