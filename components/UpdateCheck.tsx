// components/UpdateCheck.tsx
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export default function UpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  };

  const downloadUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.log('Error downloading update:', error);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  if (!updateAvailable) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={updateAvailable}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-4 rounded-2xl w-[80%]">
          <Text className="text-xl font-inter text-center mb-4">
            New Update Available!
          </Text>
          <Text className="text-gray-600 font-inter text-center mb-6">
            A new version of ChatterBox is available. Update now to get the latest features.
          </Text>
          <TouchableOpacity 
            onPress={downloadUpdate}
            className="bg-indigo-500 py-3 px-6 rounded-full"
          >
            <Text className="text-white font-inter text-center">
              Update Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}