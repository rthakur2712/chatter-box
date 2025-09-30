import React from "react";
import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useUser } from "@clerk/clerk-expo";
import logo from "../../assets/images/icon.png";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      // Warm up the android browser to improve UX
      // https://docs.expo.dev/guides/authentication/#improving-user-experience
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = () => {
  const router = useRouter();

  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL("/(auth)/register", {
            scheme: "chatterbox",
          }),
        });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        // Navigate to the main app after successful authentication
        router.replace("/");
      } else if (signIn || signUp) {
        // Handle the signIn or signUp flow if needed
        if (signUp) {
          router.replace("/(auth)/register");
        }
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, [router]);

  const user = useUser();
  console.log("user:", user);

  return (
    <View className="flex-1 items-center justify-center bg-white p-5">
      <Text
        className="text-3xl font-poppinsbold text-indigo-700 mb-2"
      >
        Welcome to ChatterBox
      </Text>
      <Image source={logo} className=" w-64 h-64" resizeMode="contain" />
      
      <Text className="text-md font-intersemibold text-gray-600 text-center mb-8">
        Connect with friends and chat in real-time!
      </Text>

      <TouchableOpacity
        className="flex flex-row items-center bg-black p-3 rounded-3xl mt-4"
        onPress={onPress}
      >
        <AntDesign name="google" size={24} color="white" />
        <Text className="text-white font-interbold text-lg ml-2">
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
