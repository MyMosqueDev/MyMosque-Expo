import Index from "@/app/(tabs)";
import { MapContext } from "@/app/_layout";
import { DevModeProvider, useDevMode } from "@/lib/devMode";
import { storage } from "@/lib/mmkv";
import { saveUserData } from "@/lib/userData";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { MOSQUE_UID } from "../../test/fixtures";

jest.mock("@/app/home", () => {
  const { Text } = jest.requireActual("react-native");
  return function Home() {
    return <Text>home screen</Text>;
  };
});
jest.mock("@/app/map", () => {
  const { Text } = jest.requireActual("react-native");
  return function Map({ setUserData }: any) {
    return (
      <Text
        onPress={() =>
          setUserData({ favoriteMosques: [], lastVisitedMosque: "m" })
        }
      >
        mosque picker
      </Text>
    );
  };
});

const setIsMapVisible = jest.fn();
const open = () =>
  render(
    <MapContext.Provider value={{ isMapVisible: false, setIsMapVisible }}>
      <Index />
    </MapContext.Provider>,
  );

it("shows home straight away for a returning user", () => {
  saveUserData({ favoriteMosques: [], lastVisitedMosque: MOSQUE_UID });
  open();
  expect(screen.getByText("home screen")).toBeTruthy();
  expect(setIsMapVisible).toHaveBeenLastCalledWith(false);
});

it("shows the picker to a new user, then home once they choose", () => {
  open();
  expect(setIsMapVisible).toHaveBeenLastCalledWith(true);
  fireEvent.press(screen.getByText("mosque picker"));
  expect(screen.getByText("home screen")).toBeTruthy();
});

describe("dev mode", () => {
  const Probe = () => {
    const { isDevMode, setDevMode } = useDevMode();
    return <Text onPress={() => setDevMode(!isDevMode)}>{`${isDevMode}`}</Text>;
  };
  const show = () =>
    render(
      <DevModeProvider>
        <Probe />
      </DevModeProvider>,
    );

  it("is off by default and remembered when changed", () => {
    show();
    fireEvent.press(screen.getByText("false"));
    screen.unmount();
    show();
    fireEvent.press(screen.getByText("true"));
    expect(storage.getString("devModeEnabled")).toBe("false");
  });
});
