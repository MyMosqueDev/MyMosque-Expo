import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { syncStorage } from "./syncStorage";
import { ProcessedMosqueData } from "./types";

// loads in all the fonts
export const loadFonts = async () => {
  try {
    console.log("Loading font files...");
    await Font.loadAsync({
      "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
      "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
      "Lato-Light": require("../assets/fonts/Lato-Light.ttf"),
      "Lato-Black": require("../assets/fonts/Lato-Black.ttf"),
      "Lato-Thin": require("../assets/fonts/Lato-Thin.ttf"),
      "Lato-Italic": require("../assets/fonts/Lato-Italic.ttf"),
      "Lato-BoldItalic": require("../assets/fonts/Lato-BoldItalic.ttf"),
      "Lato-BlackItalic": require("../assets/fonts/Lato-BlackItalic.ttf"),
      "Lato-LightItalic": require("../assets/fonts/Lato-LightItalic.ttf"),
      "Lato-ThinItalic": require("../assets/fonts/Lato-ThinItalic.ttf"),
    });
    console.log("All fonts loaded successfully");
  } catch (error) {
    console.error("Error loading fonts:", error);
    throw new Error(
      `Failed to load fonts: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// converts 24 hour format to 12 hour format
export const to12HourFormat = (time24: string) => {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  hour = hour % 12 || 12;
  return `${hour}:${minute}`;
};

// converts 12 hour format (with AM/PM) to 24 hour format
// also handles times already in 24 hour format
export const to24HourFormat = (time: string): string => {
  if (!time || time === "N/A") return "00:00";
  
  const trimmed = time.trim().toUpperCase();
  
  // Check if it already looks like 24-hour format (no AM/PM)
  if (!trimmed.includes("AM") && !trimmed.includes("PM")) {
    // Already in 24-hour format, just return as-is
    return time;
  }
  
  // Parse 12-hour format with AM/PM
  const [timePart, modifier] = trimmed.split(/\s+/);
  let [hours, minutes] = timePart.split(":").map(Number);
  
  if (modifier === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }
  
  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  
  return `${hoursStr}:${minutesStr}`;
};

/**
 * fetches the mosque info from the local storage
 * @returns the mosque info
 */
export const fetchMosqueInfo = async () => {
  const userDataString = await AsyncStorage.getItem("userData");
  if (userDataString) {
    const lastVisitedMosqueId = JSON.parse(userDataString).lastVisitedMosque;
    const mosqueData = await syncStorage(lastVisitedMosqueId);
    const filteredMosqueData = filterMosqueData(mosqueData);

    return filteredMosqueData
  }

  return null;
};

const filterMosqueData = (mosqueData: ProcessedMosqueData) => {
  const announcements =
    mosqueData.announcements
      .filter(
        (announcement) =>
          announcement.status !== "deleted" && announcement.status !== "draft",
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ) || [];

  const events =
    mosqueData.events
      .filter((event) => event.status !== "deleted" && event.status !== "draft")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ) || [];
  return {
    ...mosqueData,
    announcements: announcements,
    events: events,
  };
}

export const getSeverityStyles = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "high":
      return {
        bg: "bg-red-200",
        text: "text-red-700",
      };
    case "medium":
      return {
        bg: "bg-yellow-200",
        text: "text-yellow-700",
      };
    case "low":
      return {
        bg: "bg-green-200",
        text: "text-green-700",
      };
    default:
      return {
        bg: "bg-gray-200",
        text: "text-gray-700",
      };
  }
};
