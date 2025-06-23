import Feather from '@expo/vector-icons/Feather';
import { Image } from "expo-image";
import { ScrollView, Text, TextInput, View } from "react-native";
import Container from "../components/Container";
import { mosqueData } from '../lib/data';
import MosqueCard from "./components/MosqueCard";

type MosqueData = {
  name: string;
  address: string;
  images?: string[];
}

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Image
        source={require('../assets/background.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        contentFit="cover"
      />
      
      <Container>
        <View className=" flex-1 flex-col items-center gap-3">
          <Text className="text-text text-4xl w-5/6 text-center font-lato-bold mb-4">Add Your Go-To Mosques!</Text>
          <View className="w-full h-80 bg-text rounded-lg"/>
          <View className="w-full flex-1">
            <View className="w-full min-h-12 flex-row items-center justify-center gap-3 backdrop-blur-lg border border-white/30 bg-white/30 rounded-3xl px-4 py-2 mb-3"> 
              <Feather name="search" size={20} color="#4A4A4A" className="mt-1"/>
              <TextInput
                placeholder="Search For a Mosque"
                placeholderTextColor="#4A4A4A"
                className="text-text text-lg font-lato flex-1 h-full mb-1"
                multiline={true}
              />
            </View>
            <ScrollView 
              className="w-full flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {
                mosqueData.map((mosque : MosqueData) => (
                  <MosqueCard data={mosque} key={mosque.name}/>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Container>
    </View>
  );
}
