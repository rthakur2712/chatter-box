import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const CustomButton = ({
  title,
  onPress,
  className = "",
  textClassName = "",
}: {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-indigo-500 p-4 rounded-3xl items-center justify-center ${className}`}
  >
    <Text
      className={`text-white font-interbold text-lg ${textClassName}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const onboarding = [
  {
    id: 1,
    title: "Connect with Friends",
    description:
      "Easily connect and chat with friends in real-time using ChatterBox",
    image: require("../../assets/images/welcome/friends.png"),
  },
  {
    id: 2,
    title: "Real-Time Messaging",
    description:
      "Send instant messages, emojis, and stay connected anywhere, anytime",
    image: require("../../assets/images/welcome/chat.png"),
  },
  {
    id: 3,
    title: "Share Moments",
    description:
      "Share images, create memories, and express yourself with easy media sharing",
    image: require("../../assets/images/welcome/media.png"),
  },
];

export default function Welcome() {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <View className="flex-row justify-end w-full p-5">
        <TouchableOpacity
          onPress={() => {
            router.replace("/(auth)/sign-in");
          }}
          className="bg-stone-300 rounded-3xl px-4 py-2"
        >
          <Text className="text-black text-md font-interbold">Skip</Text>
        </TouchableOpacity>
      </View>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-indigo-400 rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center p-5">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text className="text-black text-3xl mx-10 text-center font-poppinssemibold">
                {item.title}
              </Text>
            </View>
            <Text className="text-md text-center text-gray-500/90 mx-10 mt-3 font-intersemibold">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-in")
            : swiperRef.current?.scrollBy(1)
        }
        className="w-11/12 mt-10 mb-5"
      />
    </SafeAreaView>
  );
}
