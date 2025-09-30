import React from "react";
import { Modal, Image, TouchableOpacity, Dimensions, View } from "react-native";
import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

interface ChatImageModalViewerProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null;
}

const ChatImageModalViewer = ({
  visible,
  onClose,
  imageUri,
}: ChatImageModalViewerProps) => {
  useEffect(() => {
    if (visible) {
      ScreenCapture.preventScreenCaptureAsync();
      return () => {
        ScreenCapture.allowScreenCaptureAsync();
      };
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-white"
        onPress={onClose}
        activeOpacity={1}
      >
        {imageUri && (
          <View>
            <TouchableOpacity activeOpacity={1}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: Dimensions.get("window").width * 0.9,
                  height: Dimensions.get("window").width * 0.9,
                  borderRadius: 0,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Modal>
  );
};
export default ChatImageModalViewer;
