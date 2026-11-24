type Scheduled = {
  identifier: string;
  content: { title: string; body: string; data: Record<string, unknown> };
  trigger: { type: string; date: Date };
};

/** In-memory stand-in for the OS notification scheduler. */
class FakeNotifications {
  scheduled: Scheduled[] = [];
  permission = "granted";
  requestResult = "granted";
  pushToken: string | Error = "ExponentPushToken[test]";
  responseListener: ((r: unknown) => void) | null = null;

  reset() {
    this.scheduled = [];
    this.permission = "granted";
    this.requestResult = "granted";
    this.pushToken = "ExponentPushToken[test]";
    this.responseListener = null;
  }
}

export const fakeNotifications = new FakeNotifications();

export const notificationsModule = () => ({
  SchedulableTriggerInputTypes: { DATE: "date" },
  setNotificationHandler: () => undefined,
  getAllScheduledNotificationsAsync: async () => [
    ...fakeNotifications.scheduled,
  ],
  cancelScheduledNotificationAsync: async (id: string) => {
    fakeNotifications.scheduled = fakeNotifications.scheduled.filter(
      (n) => n.identifier !== id,
    );
  },
  scheduleNotificationAsync: async (n: Scheduled) => {
    fakeNotifications.scheduled = [
      ...fakeNotifications.scheduled.filter(
        (s) => s.identifier !== n.identifier,
      ),
      n,
    ];
    return n.identifier;
  },
  getPermissionsAsync: async () => ({ status: fakeNotifications.permission }),
  requestPermissionsAsync: async () => {
    fakeNotifications.permission = fakeNotifications.requestResult;
    return { status: fakeNotifications.permission };
  },
  getExpoPushTokenAsync: async () => {
    if (fakeNotifications.pushToken instanceof Error) {
      throw fakeNotifications.pushToken;
    }
    return { data: fakeNotifications.pushToken };
  },
  addNotificationReceivedListener: () => ({ remove: () => undefined }),
  addNotificationResponseReceivedListener: (cb: (r: unknown) => void) => {
    fakeNotifications.responseListener = cb;
    return { remove: () => undefined };
  },
});
