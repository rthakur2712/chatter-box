import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";

export const usePushNotifications = () => {
  const { user } = useUser();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState("");

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      try {
        // Request permissions
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

        // Get the token
        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PROJECT_ID,
          })
        ).data;
        setExpoPushToken(token);

        // Send token to backend if user is logged in
        if (user && user.id) {
          await axios.post(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/updatePushToken`,
            {
              userId: user.id,
              pushToken: token,
            }
          );
        }
      } catch (error) {
        console.error("Error registering push notifications:", error);
      }
    };

    // Handle incoming notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Handle notification taps
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const { type, senderId } = response.notification.request.content.data;

        // Navigate based on notification type
        if (type === "friendRequest") {
          // Navigate to friend request or user profile
          router.push("/profile/" + senderId as any);
        }
      });

    // Initial registration
    registerForPushNotificationsAsync();

    // Cleanup listeners
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, [user]);

  return { expoPushToken };
};
