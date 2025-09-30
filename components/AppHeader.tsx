import React from 'react';
import { Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatterBoxHeader = () => {
  return (
    <SafeAreaView>
      <View className="w-full mx-auto flex-row justify-center items-center py-4 px-6 bg-white">
        {/* <Image 
          source={require('../assets/images/icon.png')} 
          style={{ width: 30, height: 30, marginRight: 10 }} 
        /> */}
        <Text className="text-2xl font-poppinssemibold text-indigo-500">ChatterBox</Text>
      </View>
    </SafeAreaView>
  );
};

export default ChatterBoxHeader;