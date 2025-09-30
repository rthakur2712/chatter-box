import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../../global.css";
import { StatusBar } from "react-native";

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
