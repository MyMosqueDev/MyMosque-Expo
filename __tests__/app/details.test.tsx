import AnnouncementsCarousel from "@/app/components/AnnouncementsCarousel";
import AnnouncementToken from "@/app/components/AnnouncementToken";
import EventToken from "@/app/components/EventToken";
import { COLORS } from "@/lib/constants";
import { Announcement, Event } from "@/lib/types";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Image, Modal, StyleSheet, View } from "react-native";
import { announcementRow, eventRow, setNow } from "../../test/fixtures";

const IMAGE = "https://x.org/flyer.png";
const event = (overrides = {}) => eventRow(overrides) as unknown as Event;
const announcement = (overrides = {}) =>
  announcementRow(overrides) as unknown as Announcement;

const openModals = () =>
  screen.UNSAFE_getAllByType(Modal).filter((m) => m.props.visible);
const requestClose = () => act(() => openModals()[0].props.onRequestClose());

beforeEach(() => setNow("2026-03-11T12:00:00"));

describe("#25: event details", () => {
  it("slide up over the screen when an event is tapped", () => {
    render(<EventToken event={event()} />);
    expect(openModals()).toHaveLength(0);
    fireEvent.press(screen.getByText("Halaqa"));
    expect(openModals()).toHaveLength(1);
    expect(openModals()[0].props.animationType).toBe("slide");
    expect(screen.getByText("Friday, March 20th · 7:00 PM")).toBeTruthy();
    expect(screen.getAllByText("Main hall")).toHaveLength(2);
  });

  it.each([
    ["the close button", () => fireEvent.press(screen.getByText("×"))],
    ["the system back action", requestClose],
  ])("close with %s", (_label, close) => {
    render(<EventToken event={event()} />);
    fireEvent.press(screen.getByText("Halaqa"));
    close();
    expect(openModals()).toHaveLength(0);
  });

  it("show the flyer, full screen when tapped", () => {
    render(<EventToken event={event({ image: IMAGE })} />);
    fireEvent.press(screen.getByText("Halaqa"));
    const flyer = screen
      .UNSAFE_getAllByType(Image)
      .find((i) => i.props.onLoad !== undefined)!;
    act(() => {
      flyer.props.onLoadStart();
      flyer.props.onLoad();
    });
    fireEvent.press(screen.getByText("Tap to expand"));
    expect(openModals()).toHaveLength(1);
    expect(openModals()[0].props.animationType).toBe("fade");
    requestClose();
    expect(openModals()).toHaveLength(0);
  });

  it("explain when the flyer cannot load", () => {
    render(<EventToken event={event({ image: IMAGE })} />);
    fireEvent.press(screen.getByText("Halaqa"));
    const flyer = screen
      .UNSAFE_getAllByType(Image)
      .find((i) => i.props.onError !== undefined)!;
    act(() => flyer.props.onError());
    expect(screen.getByText("Failed to load")).toBeTruthy();
    expect(screen.queryByText("Tap to expand")).toBeNull();
  });
});

describe("#40: announcement card", () => {
  const dotColors = () =>
    screen
      .UNSAFE_getAllByType(View)
      .map((v) => StyleSheet.flatten(v.props.style))
      .filter((style) => style?.width === 7)
      .map((style) => style.backgroundColor);

  it.each([
    ["high", COLORS.RED],
    ["medium", COLORS.YELLOW],
    ["low", COLORS.GREEN],
    ["HIGH", COLORS.RED],
  ])("shows %s priority as a dot, not a word", (severity, color) => {
    render(<AnnouncementToken announcement={announcement({ severity })} />);
    expect(dotColors()).toEqual([color]);
    expect(screen.queryByText(new RegExp(`^${severity}$`, "i"))).toBeNull();
  });

  it("keeps long text inside the card", () => {
    const title = "Nueces Weekly (2/24 - 2/28) and more besides";
    const description = "Take a look at what is happening. ".repeat(20);
    render(
      <AnnouncementToken
        announcement={announcement({ title, description, image: IMAGE })}
      />,
    );
    expect(screen.getByText(title).props.numberOfLines).toBe(1);
    expect(screen.getByText(description).props.numberOfLines).toBe(4);
    expect(screen.queryByText("Tap to view image")).toBeNull();
  });

  it.each([
    ["high", "Urgent"],
    ["medium", "Notice"],
    ["low", "Info"],
  ])("opens details labelled for %s priority", (severity, label) => {
    render(<AnnouncementToken announcement={announcement({ severity })} />);
    fireEvent.press(screen.getByText("Parking update"));
    expect(openModals()).toHaveLength(1);
    expect(screen.getByText(new RegExp(`^${label} · `))).toBeTruthy();
    fireEvent.press(screen.getByText("×"));
    expect(openModals()).toHaveLength(0);
  });

  it("opens the image full screen", () => {
    render(<AnnouncementToken announcement={announcement({ image: IMAGE })} />);
    fireEvent.press(screen.getByText("Parking update"));
    fireEvent.press(screen.getByText("Tap to expand"));
    expect(openModals()[0].props.animationType).toBe("fade");
    requestClose();
    expect(openModals()).toHaveLength(0);
  });
});

describe("announcements carousel", () => {
  const dots = () =>
    screen
      .UNSAFE_getAllByType(View)
      .filter((v) => /w-2 h-2/.test(v.props.className ?? ""));
  const scroll = (x: number) =>
    fireEvent.scroll(screen.UNSAFE_getByProps({ horizontal: true }), {
      nativeEvent: { contentOffset: { x } },
    });

  it("tracks the current card", () => {
    render(
      <AnnouncementsCarousel
        announcements={[announcement(), announcement({ id: "a2" })]}
      />,
    );
    const current = () =>
      dots().findIndex((d) => /white\/90/.test(d.props.className));
    expect(current()).toBe(0);
    scroll(757);
    expect(current()).toBe(1);
  });

  it("stays put with a single announcement", () => {
    render(<AnnouncementsCarousel announcements={[announcement()]} />);
    expect(() => scroll(400)).not.toThrow();
  });
});
