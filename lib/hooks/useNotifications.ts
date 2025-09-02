import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export default function useNotifications() {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }
    };

    requestPermissions();

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received in foreground:", notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
        const data = response.notification.request.content.data;

        if (data?.type === "announcement") {
        } else if (data?.type === "event") {
          // Navigate to events screen
        } else if (data?.type === "prayer") {
          // Navigate to prayer screen
        }
      });

    // Clean up subscriptions
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
