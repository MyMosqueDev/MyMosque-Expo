import Feather from "@expo/vector-icons/Feather";
import { BlurView } from "expo-blur";
import { Link, usePathname } from "expo-router";
import { MotiView } from "moti";
import { Platform, View } from "react-native";

type page = "home" | "events" | "prayers" | "notifs" | "settings";
export default function Navbar() {
  const pathname = usePathname();

  // hide nav bar on the following pages
  if (
    pathname.startsWith("/announcements") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/settings")
  ) {
    return null;
  }

  const getCurrentPage = (): page => {
    if (pathname === "/") return "home";
    if (pathname === "/events") return "events";
    if (pathname === "/prayer") return "prayers";
    if (pathname === "/notifs") return "notifs";
    return "home";
  };

  const currentPage = getCurrentPage();

  // sets icon color based on the current page
  const getIconColor = (pageName: page) => {
    if (currentPage === pageName) {
      switch (pageName) {
        case "home":
          return "#88AE79";
        case "events":
          return "#3B5A7A";
        case "prayers":
          return "#5B4B94";
        default:
          return "#1F2937";
      }
    }
    return "#4A4A4A";
  };

  const navLinks = (
    <>
      <Link
        href="/"
        className={`px-6 py-2 rounded-full ${currentPage === "home" ? "bg-white/30" : ""}`}
      >
        <MotiView
          from={{ scale: 0.8 }}
          animate={{
            scale: currentPage === "home" ? 1.1 : 1,
            opacity: currentPage === "home" ? 1 : 0.7,
          }}
          transition={{
            type: "timing",
            duration: 150,
          }}
        >
          <Feather name="home" size={28} color={getIconColor("home")} />
        </MotiView>
      </Link>

      <Link
        href="/events"
        className={`px-6 py-2 rounded-full ${currentPage === "events" ? "bg-white/30" : ""}`}
      >
        <MotiView
          from={{ scale: 0.8 }}
          animate={{
            scale: currentPage === "events" ? 1.1 : 1,
            opacity: currentPage === "events" ? 1 : 0.7,
          }}
          transition={{
            type: "timing",
            duration: 150,
          }}
        >
          <Feather name="calendar" size={28} color={getIconColor("events")} />
        </MotiView>
      </Link>

      <Link
        href="/prayer"
        className={`px-6 py-2 rounded-full ${currentPage === "prayers" ? "bg-white/30" : ""}`}
      >
        <MotiView
          from={{ scale: 0.8 }}
          animate={{
            scale: currentPage === "prayers" ? 1.1 : 1,
            opacity: currentPage === "prayers" ? 1 : 0.7,
          }}
          transition={{
            type: "timing",
            duration: 150,
          }}
        >
          <Feather name="clock" size={28} color={getIconColor("prayers")} />
        </MotiView>
      </Link>
    </>
  );

  return (
    <MotiView
      className={`w-full absolute bottom-0 flex justify-center items-center z-10 ${Platform.OS === "android" ? "mb-6" : ""}`}
      from={{ translateY: 100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      transition={{ type: "timing", duration: 500 }}
    >
      <View
        className={`w-10/12 mb-[2rem] rounded-full border border-white/40 overflow-hidden ${
          Platform.OS === "android" ? "bg-white" : ""
        }`}
        style={Platform.OS === "android" ? { elevation: 8 } : undefined}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={25}
            tint="light"
            className="w-full flex-row items-center justify-between px-6 py-3"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            {navLinks}
          </BlurView>
        ) : (
          <View className="w-full flex-row items-center justify-between px-6 py-3">
            {navLinks}
          </View>
        )}
      </View>
    </MotiView>
  );
}
