import ScrollContainer from "@/components/ScrollContainer";
import { Text, View } from "react-native";

export default function Prayers() {
    return (
        <ScrollContainer name="Events">
            <View className="flex-1 items-center justify-center">
                <Text className="text-text text-[24px] font-lato-bold">prayers page</Text>
            </View>
        </ScrollContainer>
    );
}
