import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { isAuthenticated } from "@/lib/auth";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function Index() {
  const {expoPushToken} = usePushNotifications();
  const [hasToken, setHasToken] = useState<boolean | null>(null); // Start with `null` to represent the loading state

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated(); 
        setHasToken(isAuth); // Set the boolean result
      } catch (error) {
        console.error("Error checking authentication:", error);
        setHasToken(false); // Set `false` in case of an error
      }
    };

    checkAuth();
  }, [hasToken]);

  
  if (hasToken === null) {
    return null; // Optionally replace with a spinner or other loading UI
  }
  return hasToken ? (
    <Redirect href={"/(root)/profile"} />
  ) : (
    <Redirect href={"/(auth)/welcome"} />
  );
}
