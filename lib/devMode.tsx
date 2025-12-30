// Dev Mode Context
// Global state management for developer mode across the app

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const DEV_MODE_STORAGE_KEY = "devModeEnabled";
const DEV_PASSWORD = "dev2025";

type DevModeContextType = {
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;
  toggleDevMode: (password?: string) => boolean;
  isLoading: boolean;
};

const DevModeContext = createContext<DevModeContextType>({
  isDevMode: false,
  setDevMode: () => {},
  toggleDevMode: () => false,
  isLoading: true,
});

export const useDevMode = () => useContext(DevModeContext);

export const DevModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load dev mode state on mount
  useEffect(() => {
    const loadDevMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(DEV_MODE_STORAGE_KEY);
        if (stored === "true") {
          setIsDevMode(true);
        }
      } catch (error) {
        console.error("Error loading dev mode state:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDevMode();
  }, []);

  // Save dev mode state when it changes
  const setDevMode = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(DEV_MODE_STORAGE_KEY, enabled ? "true" : "false");
      setIsDevMode(enabled);
    } catch (error) {
      console.error("Error saving dev mode state:", error);
    }
  };

  // Toggle dev mode with password validation
  const toggleDevMode = (password?: string): boolean => {
    if (isDevMode) {
      // Disable without password
      setDevMode(false);
      return true;
    } else if (password === DEV_PASSWORD) {
      // Enable with correct password
      setDevMode(true);
      return true;
    }
    return false;
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, setDevMode, toggleDevMode, isLoading }}>
      {children}
    </DevModeContext.Provider>
  );
};

