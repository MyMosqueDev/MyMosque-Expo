import { useEffect, useRef } from "react";
import { Animated, Easing, ImageBackground, View } from "react-native";

export default function LoadingScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <Animated.View
        className="flex-1 justify-center items-center gap-6"
        style={{ opacity: fadeValue }}
      >
        {/* Custom spinner */}
        <Animated.View
          className="w-14 h-14 justify-center items-center"
          style={{ transform: [{ rotate: spin }] }}
        >
          <View
            className="w-14 h-14 rounded-full border-4"
            style={{
              borderColor: "rgba(91, 75, 148, 0.15)",
              borderTopColor: "#5B4B94",
              borderRightColor: "#7B6BB4",
            }}
          />
        </Animated.View>

        {/* Pulsing loading text */}
        <Animated.Text
          className="text-[#5B4B94] text-base uppercase tracking-widest"
          style={{ opacity: pulseValue, fontFamily: "Lato-Regular" }}
        >
          Loading
        </Animated.Text>
      </Animated.View>
    </ImageBackground>
  );
}