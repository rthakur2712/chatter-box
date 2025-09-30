import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const NotificationHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { redirectUrl } = response.notification.request.content.data;
        if (redirectUrl) {
          router.push(redirectUrl); 
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationHandler;
