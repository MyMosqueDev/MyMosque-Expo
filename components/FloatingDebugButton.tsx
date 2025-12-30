// Floating Debug Button
// A draggable button that opens the debug panel when dev mode is enabled

import { useDevMode } from "@/lib/devMode";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import DebugPanel from "./DebugPanel";

const BUTTON_SIZE = 50;
const SCREEN_PADDING = 16;

export default function FloatingDebugButton() {
  const { isDevMode } = useDevMode();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  
  // Position state - start at bottom right
  const translateX = useSharedValue(screenWidth - BUTTON_SIZE - SCREEN_PADDING);
  const translateY = useSharedValue(screenHeight - BUTTON_SIZE - 120); // Above nav bar
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const openPanel = () => {
    setIsPanelVisible(true);
  };

  // Store the starting position when drag begins
  const startX = useSharedValue(screenWidth - BUTTON_SIZE - SCREEN_PADDING);
  const startY = useSharedValue(screenHeight - BUTTON_SIZE - 120);

  const pan = Gesture.Pan()
    .onStart(() => {
      isPressed.value = true;
      scale.value = withSpring(1.1);
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.max(
        SCREEN_PADDING,
        Math.min(
          screenWidth - BUTTON_SIZE - SCREEN_PADDING,
          startX.value + event.translationX
        )
      );
      translateY.value = Math.max(
        SCREEN_PADDING + 60, // Below status bar
        Math.min(
          screenHeight - BUTTON_SIZE - 120, // Above nav bar
          startY.value + event.translationY
        )
      );
    })
    .onEnd(() => {
      isPressed.value = false;
      scale.value = withSpring(1);
      
      // Snap to nearest edge (left or right)
      const centerX = translateX.value + BUTTON_SIZE / 2;
      if (centerX < screenWidth / 2) {
        translateX.value = withSpring(SCREEN_PADDING);
      } else {
        translateX.value = withSpring(screenWidth - BUTTON_SIZE - SCREEN_PADDING);
      }
    });

  const tap = Gesture.Tap()
    .onEnd(() => {
      runOnJS(openPanel)();
    });

  const composed = Gesture.Simultaneous(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Don't render if dev mode is not enabled
  if (!isDevMode) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "box-none" }}>
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              {
                position: "absolute",
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                borderRadius: BUTTON_SIZE / 2,
                backgroundColor: "#5B4B94",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              },
              animatedStyle,
            ]}
          >
            <Ionicons name="bug" size={24} color="white" />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      <DebugPanel 
        visible={isPanelVisible} 
        onClose={() => setIsPanelVisible(false)} 
      />
    </>
  );
}

