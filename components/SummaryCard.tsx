// components/SummaryCard.js
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

// Theme from AddLightModal (emerald green theme)
const theme = {
  // Primary color - Emerald Green from AddLightModal
  primary: "#10B981", // Main brand green (emerald)
  primaryLight: "#34D399", // Lighter variant
  primaryDark: "#059669", // Darker variant

  // Backgrounds
  background: "#FFFFFF", // Main background
  surface: "#F9FAFB", // Card/surface background (from AddLightModal)
  surfaceHighlight: "#FFFFFF", // Highlighted surfaces

  // Text colors (from AddLightModal)
  text: "#111827", // Primary text (dark gray)
  textSecondary: "#6B7280", // Secondary text
  textMuted: "#9CA3AF", // Muted text/placeholder

  // Borders (from AddLightModal)
  border: "#E5E7EB", // Light borders
  borderDark: "#D1D5DB", // Darker borders
};

const SummaryCard = ({
  title,
  count,
  iconName,
  iconColor,
  bgAccent,
  accentBorder,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: count,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [count]);

  // Pulse animation for important cards (like total lights)
  useEffect(() => {
    if (title === "Total Lights" && count > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [count, title]);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const animatedCount = countAnim.interpolate({
    inputRange: [0, count || 1],
    outputRange: ["0", (count || 0).toString()],
    extrapolate: "clamp",
  });

  // Get gradient-like effect based on title
  const getCardBorderColor = () => {
    if (accentBorder) return accentBorder;
    switch (title) {
      case "Total Lights":
        return theme.primary;
      case "Working":
        return theme.status.success;
      case "Faulty":
        return theme.status.error;
      case "Offline":
        return theme.status.warning;
      default:
        return theme.border;
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            borderLeftWidth: 4,
            borderLeftColor: getCardBorderColor(),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: bgAccent || theme.surface,
              borderColor: accentBorder || theme.border,
              transform: title === "Total Lights" ? [{ scale: pulseAnim }] : [],
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={iconColor || theme.primary}
          />
        </Animated.View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Animated.Text style={styles.count}>{animatedCount}</Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  count: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.text,
    lineHeight: 18,
    letterSpacing: -0.5,
  },
});

export default SummaryCard;
