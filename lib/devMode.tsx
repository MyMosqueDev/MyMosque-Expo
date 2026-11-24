// Dev Mode Context
// Global state management for developer mode across the app

import { createContext, ReactNode, useContext, useState } from "react";
import { storage } from "./mmkv";

const DEV_MODE_STORAGE_KEY = "devModeEnabled";
const DEV_PASSWORD = "dev2025";

type DevModeContextType = {
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;
  toggleDevMode: (password?: string) => boolean;
};

const DevModeContext = createContext<DevModeContextType>({
  isDevMode: false,
  setDevMode: () => {},
  toggleDevMode: () => false,
});

export const useDevMode = () => useContext(DevModeContext);

export const DevModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDevMode, setIsDevMode] = useState(
    () => storage.getString(DEV_MODE_STORAGE_KEY) === "true",
  );

  const setDevMode = (enabled: boolean) => {
    storage.set(DEV_MODE_STORAGE_KEY, enabled ? "true" : "false");
    setIsDevMode(enabled);
  };

  const toggleDevMode = (password?: string): boolean => {
    if (isDevMode) {
      setDevMode(false);
      return true;
    } else if (password === DEV_PASSWORD) {
      setDevMode(true);
      return true;
    }
    return false;
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, setDevMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};
