import React, { useEffect } from "react";
import { useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter, usePathname } from "expo-router";
import {
  View,
  TouchableOpacity,
  Text,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome, Ionicons, Feather } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "@/contexts/UserContext";
import { PushTokenProvider } from "@/contexts/PushTokenContext";
import { RequestsProvider } from "@/contexts/RequestsContext";
import ChatterBoxHeader from "@/components/AppHeader";
import NotificationHandler from "@/components/NotificationHandler";
import { useRequests } from "@/contexts/RequestsContext";
import { SocketProvider } from "@/contexts/SocketContext";

const TabBar = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);
  const pathname = usePathname();
  const { pendingRequests } = useRequests();
  const windowWidth = Dimensions.get("window").width;

  const slideAnimation = React.useRef(new Animated.Value(0)).current;

  const tabs = [
    {
      name: "chat",
      iconComponent: MaterialCommunityIcons,
      icon: "message-outline",
      activeIcon: "message",
      label: "Messages",
    },
    {
      name: "explore",
      iconComponent: Ionicons,
      icon: "compass-outline",
      activeIcon: "compass",
      label: "Explore",
    },
    {
      name: "requests",
      iconComponent: FontAwesome,
      icon: "bell-o",
      activeIcon: "bell",
      label: "Requests",
    },
    {
      name: "profile",
      iconComponent: Feather,
      icon: "user",
      activeIcon: "user",
      label: "Profile",
    },
  ];

  const TAB_WIDTH = (windowWidth - 48) / tabs.length;
  const activeIndex = tabs.findIndex((tab) => pathname === `/${tab.name}`);

  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [activeIndex]);

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-4">
      {/* Main container with consistent border radius */}
      <View className="overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
        <View className="h-20">
          <View className="flex-row justify-between items-center h-full relative">
            {tabs.map((tab) => {
              const isActive = pathname === `/${tab.name}`;
              const Icon = tab.iconComponent;

              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => router.push(`/${tab.name}`)}
                  className="relative items-center justify-center"
                  style={{ width: TAB_WIDTH }}
                >
                  <View className="relative">
                    <View
                      className={`p-2 rounded-xl ${
                        isActive ? "bg-indigo-500" : "bg-transparent"
                      }`}
                    >
                      <Icon
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={24}
                        color={isActive ? "#ffffff" : "#9ca3af"}
                      />
                    </View>

                    {tab.name === "requests" && pendingRequests > 0 && (
                      <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                        <Text className="text-white text-[10px] font-poppinssemibold">
                          {pendingRequests}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    className={`text-[10px] mt-1 ${
                      isActive
                        ? "text-black font-poppinssemibold"
                        : "text-gray-500 font-poppinsregular"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const Layout = () => {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <PushTokenProvider>
        <RequestsProvider>
          <NotificationHandler />
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

            {!pathname.includes("chat/") && <ChatterBoxHeader />}
            <SocketProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="messages"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="explore" options={{ headerShown: false }} />
                <Stack.Screen
                  name="requests"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="friends" options={{ headerShown: false }} />
                <Stack.Screen name="camera" options={{ headerShown: false }} />
                <Stack.Screen
                  name="newConversation"
                  options={{ headerShown: false }}
                />
              </Stack>
            </SocketProvider>
            {!pathname.includes("chat/") && (
              <View className=" bg-white h-20">
                <TabBar />
              </View>
            )}
          </View>
        </RequestsProvider>
      </PushTokenProvider>
    </UserProvider>
  );
};

export default Layout;
