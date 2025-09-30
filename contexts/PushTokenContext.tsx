import React, { createContext, useState, useContext, useEffect } from "react";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { useUser } from "./UserContext";

// Create the context
const PushTokenContext = createContext({
  expoPushToken: null,
  registerPushToken: async () => {},
  updatePushTokenOnServer: async () => {},
});

// Context Provider Component
export const PushTokenProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const { user } = useUser();

  // Register for push notifications
  const registerPushToken = async () => {
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
        return null;
      }

      // Get the token
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        })
      ).data;

      setExpoPushToken(token);
      return token;
    } catch (error) {
      console.error("Error registering push token:", error);
      return null;
    }
  };

  // Update push token on server
  const updatePushTokenOnServer = async (token) => {
    if (!user || !token) return;

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/saveToken`,
        {
          userId: user.id,
          pushToken: token,
        }
      );
      console.log("Push token updated on server:", response.data.message);
    } catch (error) {
      console.error("Error updating push token on server:", error);
    }
  };

  const clearPushToken = async () => {
    try {
      if (user && user.id) {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/removeToken`,
          {
            userId: user.id,
          }
        );
        setExpoPushToken(null);
        console.log("Push token removed on server:", response.data.message);
      }
    } catch (error) {
      console.error("Error clearing push token:", error);
    }
  };

  // Effect to register token and update on server when user changes
  useEffect(() => {
    const setupPushToken = async () => {
      const token = await registerPushToken();
      if (token) {
        await updatePushTokenOnServer(token);
      }
    };

    if (user) {
      setupPushToken();
    }
  }, [user]);

  // Setup notification listeners
  useEffect(() => {
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

        // You can add navigation logic here
        // For example:
        // if (type === 'friendRequest') {
        //   router.push(`/profile/${senderId}`);
        // }
      });

    // Cleanup listeners
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <PushTokenContext.Provider
      value={{
        expoPushToken,
        registerPushToken,
        updatePushTokenOnServer,
        clearPushToken,
      }}
    >
      {children}
    </PushTokenContext.Provider>
  );
};

// Custom hook to use the PushToken context
export const usePushToken = () => {
  const context = useContext(PushTokenContext);
  if (!context) {
    throw new Error("usePushToken must be used within a PushTokenProvider");
  }
  return context;
};
