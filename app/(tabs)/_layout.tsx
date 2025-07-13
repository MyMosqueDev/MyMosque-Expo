import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ href: "/" }} />
      <Tabs.Screen name="events" options={{ href: "/events" }} />
      <Tabs.Screen name="prayer" options={{ href: "/prayer" }} />
    </Tabs>
  );
} 