import React from "react";
import { Modal, Image, TouchableOpacity, Dimensions, View } from "react-native";
import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

interface ImageModalViewerProps {
  visible: boolean;
  onClose: () => void;
  imageUri?: string;
}

const ImageModalViewer = ({
  visible,
  onClose,
  imageUri,
}: ImageModalViewerProps) => {
  useEffect(() => {
    if (visible) {
      ScreenCapture.preventScreenCaptureAsync();
      return () => {
        ScreenCapture.allowScreenCaptureAsync();
      };
    }
  }, [visible]);
  return (
    <Modal visible={visible} animationType="fade">
      <TouchableOpacity
        className="flex-1 justify-center items-center"
        onPress={onClose}
        activeOpacity={1}
      >
      
        {imageUri && (
          <View>
            <TouchableOpacity activeOpacity={1}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: Dimensions.get("window").width * 0.8,
                  height: Dimensions.get("window").width * 0.8,
                  borderRadius: 200,
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

export default ImageModalViewer;
