// components/FAB.js
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

// Theme from AddLightModal (emerald green theme)
const theme = {
  // Primary color - Emerald Green from AddLightModal
  primary: "#10B981", // Main brand green (emerald)
  primaryLight: "#34D399", // Lighter variant
  primaryDark: "#059669", // Darker variant

  // Backgrounds
  background: "#FFFFFF",
  surface: "#F9FAFB",

  // Borders
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
};

const FAB = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();

    // Subtle rotation effect on press
    Animated.spring(rotateAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.spring(rotateAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.fabContainer}
    >
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ scale: scaleAnim }, { rotate: rotate }],
          },
        ]}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
    height: 48,
    width: 48,
    borderRadius: 4,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default FAB;
