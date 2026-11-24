import { useMapContext } from "@/app/_layout";
import Home from "@/app/home";
import Map from "@/app/map";
import { UserData } from "@/lib/types";
import { loadUserData } from "@/lib/userData";
import { useEffect, useState } from "react";

export default function Index() {
  const [userData, setUserData] = useState<UserData>(loadUserData);
  const { setIsMapVisible } = useMapContext();

  // the mosque picker shows until a mosque has been chosen
  const isMapShowing = !userData.lastVisitedMosque;

  useEffect(() => {
    setIsMapVisible(isMapShowing);
  }, [isMapShowing, setIsMapVisible]);

  return isMapShowing ? <Map setUserData={setUserData} /> : <Home />;
}
