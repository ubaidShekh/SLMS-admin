// components/EmptyState.js
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Theme from AddLightModal (emerald green theme)
const theme = {
  // Primary color - Emerald Green from AddLightModal
  primary: "#10B981", // Main brand green (emerald)
  primaryLight: "#34D399", // Lighter variant
  primaryDark: "#059669", // Darker variant
  primaryTint: "#D1FAE5", // Very light emerald green for subtle backgrounds

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

const EmptyState = ({ onClear, hasActiveFilters = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="search-outline" size={36} color={theme.primary} />
      </View>
      <Text style={styles.title}>No lights found</Text>
      <Text style={styles.subtitle}>
        {hasActiveFilters
          ? "Try adjusting your filters or search term"
          : "All street lights are currently offline or no data available"}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity style={styles.resetButton} onPress={onClear}>
          <Ionicons name="refresh-outline" size={16} color={theme.background} />
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 44,
    paddingHorizontal: 24,
    backgroundColor: theme.background,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40, // Made circular to match modern design
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 16,
    maxWidth: "80%",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: theme.background,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.3,
  },
});

export default EmptyState;
