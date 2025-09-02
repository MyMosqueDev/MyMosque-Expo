import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export const getPushToken = async () => {
  let token = "";
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    return token;
  } catch (e) {
    token = `${e}`;
  }
};
