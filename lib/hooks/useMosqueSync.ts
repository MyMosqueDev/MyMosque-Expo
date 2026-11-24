import {
  loadPrayerNotificationSettings,
  schedulePrayerNotifications,
} from "@/lib/prayerNotifications";
import { getTodaysPrayerTimes } from "@/lib/prayerTimeUtils";
import { syncPushRegistration } from "@/lib/pushRegistration";
import { migrateAsyncStorage } from "@/lib/storageMigration";
import { ProcessedMosqueData } from "@/lib/types";
import { fetchMosqueInfo, loadFonts } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const TICK_MS = 60 * 1000;
const REFRESH_MS = 15 * 60 * 1000;

/**
 * Loads the chosen mosque and keeps it current while the app is open:
 * - on start, and whenever the app returns to the foreground
 * - every 15 minutes, or every minute after a sync that did not fully succeed
 * - prayer times are recomputed every minute without needing the network
 *
 * A failed refresh never replaces data that is already showing.
 */
export function useMosqueSync() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mosqueData, setMosqueData] = useState<ProcessedMosqueData | null>(
    null,
  );

  const dataRef = useRef<ProcessedMosqueData | null>(null);
  useEffect(() => {
    dataRef.current = mosqueData;
  }, [mosqueData]);

  const inFlight = useRef<Promise<ProcessedMosqueData | null> | null>(null);
  const lastAttempt = useRef(0);
  const needsRetry = useRef(false);
  const fontsLoaded = useRef(false);

  const load = useCallback(() => {
    const run = async (): Promise<ProcessedMosqueData | null> => {
      let loaded: ProcessedMosqueData | null = null;
      lastAttempt.current = Date.now();
      try {
        await migrateAsyncStorage();
        if (!fontsLoaded.current) await loadFonts();
        fontsLoaded.current = true;
        const startedWith = dataRef.current?.info.uid;
        const fetched = await fetchMosqueInfo();
        loaded = fetched;
        needsRetry.current = !!fetched && fetched.syncStatus !== "fresh";
        if (fetched) {
          // If another mosque was chosen meanwhile, keep that choice.
          setMosqueData((current) =>
            current && current.info.uid !== startedWith ? current : fetched,
          );
        }
        setError(null);
      } catch (e) {
        console.error("Error loading mosque data:", e);
        needsRetry.current = true;
        if (!dataRef.current) {
          setError(e instanceof Error ? e.message : "Unknown error occurred");
        }
      }
      setIsLoading(false);
      return loaded;
    };

    inFlight.current ??= run().finally(() => {
      inFlight.current = null;
    });
    return inFlight.current;
  }, []);

  const refreshPrayerTimes = useCallback(() => {
    setMosqueData((current) => {
      const prayerTimes =
        current &&
        getTodaysPrayerTimes(
          current.monthlyPrayerSchedule,
          current.jummahTimes,
        );
      return prayerTimes ? { ...current, prayerTimes } : current;
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    const open = async () => {
      const loaded = await load();
      syncPushRegistration();

      // Extends reminders, which iOS caps at about six days' worth.
      const info = (loaded ?? dataRef.current)?.info;
      if (info?.uid && info.name && loadPrayerNotificationSettings().enabled) {
        schedulePrayerNotifications(info.uid, info.name);
      }
    };

    open();

    const subscription = AppState.addEventListener("change", (state) => {
      isActive = state === "active";
      if (!isActive) return;
      refreshPrayerTimes();
      open();
    });

    const timer = setInterval(() => {
      if (!isActive) return;
      refreshPrayerTimes();
      const age = Date.now() - lastAttempt.current;
      if (needsRetry.current || age >= REFRESH_MS) load();
    }, TICK_MS);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [load, refreshPrayerTimes]);

  return { isLoading, error, retry: load, mosqueData, setMosqueData };
}
