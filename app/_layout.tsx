// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium

} from "@expo-google-fonts/inter";
import {Poppins_400Regular, Poppins_700Bold, Poppins_800ExtraBold, Poppins_600SemiBold} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import UpdateCheck from '@/components/UpdateCheck';
import "../global.css";

SplashScreen.preventAutoHideAsync();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_600SemiBold
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      console.log("Fonts loaded");
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
      <UpdateCheck />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
