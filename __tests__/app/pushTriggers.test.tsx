import MosqueCard from "@/app/components/MosqueCard";
import useNotifications from "@/lib/hooks/useNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { fakeNotifications as os } from "../../test/fakeNotifications";
import { fakeRouter } from "../../test/fakeRouter";
import { fakeSupabase as db } from "../../test/fakeSupabase";
import { MOSQUE_UID, monthRow, mosqueRow, setNow } from "../../test/fixtures";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

let post: jest.Mock;
const settle = () => act(() => new Promise((r) => setTimeout(r, 30)));
const choose = (uid: string) =>
  AsyncStorage.setItem("userData", JSON.stringify({ lastVisitedMosque: uid }));

beforeEach(() => {
  post = jest.fn(async () => ({ ok: true, status: 200 }));
  global.fetch = post as never;
  setNow("2026-03-11T12:00:00");
  db.tables = {
    mosques: [mosqueRow(), mosqueRow({ id: "3", uid: "mosque-2" })],
    announcements: [],
    events: [],
    new_prayer_times: [monthRow("03-26")],
  };
});

it("registers once permission is granted", async () => {
  await choose(MOSQUE_UID);
  os.permission = "undetermined";
  const Home = () => {
    useNotifications();
    return null;
  };
  render(<Home />);
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
});

it("does not register when permission is refused", async () => {
  await choose(MOSQUE_UID);
  os.permission = "undetermined";
  os.requestResult = "denied";
  const Home = () => {
    useNotifications();
    return null;
  };
  render(<Home />);
  await settle();
  expect(post).not.toHaveBeenCalled();
});

it("registers the new mosque when one is chosen", async () => {
  render(
    <MosqueCard
      data={mosqueRow({ uid: "mosque-2" }) as never}
      mapRef={{ current: null }}
    />,
  );
  fireEvent.press(screen.getByText("Test Mosque"));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  expect(JSON.parse(post.mock.calls[0][1].body).mosqueId).toBe("mosque-2");
});

it("shortens long names and shows the mosque's photos", async () => {
  const mapRef = { current: { animateToRegion: jest.fn() } };
  const setUserData = jest.fn();
  render(
    <MosqueCard
      data={
        mosqueRow({
          name: "N".repeat(40),
          address: "A".repeat(50),
          images: ["https://x.org/1.png", "https://x.org/2.png"],
        }) as never
      }
      mapRef={mapRef as never}
      setUserData={setUserData}
    />,
  );
  expect(screen.getByText(`${"A".repeat(45)}...`)).toBeTruthy();
  fireEvent.press(screen.getByText(`${"N".repeat(35)}...`));
  await waitFor(() => expect(setUserData).toHaveBeenCalled());
  expect(mapRef.current.animateToRegion).toHaveBeenCalled();
  expect(fakeRouter.navigations).toEqual([["replace", "/(tabs)"]]);
});

it.each(["announcement", "event", "prayer", "other"])(
  "accepts a tap on a %s notification",
  async (type) => {
    const Home = () => {
      useNotifications();
      return null;
    };
    render(<Home />);
    await settle();
    expect(() =>
      os.responseListener!({
        notification: { request: { content: { data: { type } } } },
      }),
    ).not.toThrow();
  },
);
