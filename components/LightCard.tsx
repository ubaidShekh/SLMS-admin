// components/LightCard.js
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

// Theme from AddLightModal (emerald green theme)
const theme = {
  primary: "#10B981",
  primaryLight: "#34D399",
  primaryDark: "#059669",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceHighlight: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    neutral: "#6B7280",
  },
};

const LightCard = ({ item, onPress, isDesktop }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
    
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    if (onPress) onPress(item);
  };

  const statusConfig = {
    Working: {
      color: theme.status.success,
      bg: theme.status.success + "10",
      label: "Working",
      icon: "checkmark-circle",
    },
    Fault: {
      color: theme.status.error,
      bg: theme.status.error + "10",
      label: "Faulty",
      icon: "alert-circle",
    },
    "In Progress": {
      color: "#3B82F6",
      bg: "#3B82F6" + "20",
      label: "In Progress",
      icon: "sync",
    },
    Offline: {
      color: theme.status.warning,
      bg: theme.status.warning + "10",
      label: "Offline",
      icon: "cloud-offline",
    },
  };

  const priorityConfig = {
    High: {
      color: theme.status.error,
      bg: theme.status.error + "10",
      label: "High",
      icon: "alert-circle",
    },
    Medium: {
      color: theme.status.warning,
      bg: theme.status.warning + "10",
      label: "Medium",
      icon: "time-outline",
    },
    Low: {
      color: theme.status.success,
      bg: theme.status.success + "10",
      label: "Low",
      icon: "checkmark-circle",
    },
  };

  const status = statusConfig[item.status] || statusConfig.Offline;
  const priority = priorityConfig[item.priority] || priorityConfig.Medium;
  const lastUpdated = item.lastUpdated || new Date().toLocaleTimeString();

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.row,
          isDesktop && styles.rowDesktop,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Light ID Column */}
        <View style={[styles.cell, styles.idCell]}>
          <View style={styles.idWrapper}>
      
            <Text style={styles.idText} numberOfLines={1}>
              {item.id}
            </Text>
          </View>
        </View>

        {/* Status Column */}
        <View style={[styles.cell, styles.statusCell]}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={10} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Location Column */}
        <View style={[styles.cell, styles.locationCell]}>
          <View style={styles.locationWrapper}>
            <Ionicons name="location-outline" size={10} color={theme.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location || "—"}
            </Text>
          </View>
        </View>

        {/* Metrics Column (Voltage/Current) */}
        <View style={[styles.cell, styles.metricsCell]}>
          <View style={styles.metricsWrapper}>
            <View style={styles.metricItem}>
              <Ionicons name="flash-outline" size={10} color={theme.primary} />
              <Text style={styles.metricValue}>{item.voltage || "—"}</Text>
              <Text style={styles.metricUnit}>V</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="battery-charging-outline" size={10} color={theme.primary} />
              <Text style={styles.metricValue}>{item.current || "—"}</Text>
              <Text style={styles.metricUnit}>A</Text>
            </View>
          </View>
        </View>

        {/* Priority Column */}
        <View style={[styles.cell, styles.priorityCell]}>
          <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
            <Ionicons name={priority.icon} size={8} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>
        </View>

        {/* Description Column */}
        <View style={[styles.cell, styles.descriptionCell]}>
          <View style={styles.descriptionWrapper}>
            <Ionicons name="document-text-outline" size={10} color={theme.textMuted} />
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.description || "—"}
            </Text>
          </View>
        </View>

        {/* Last Updated Column */}
        <View style={[styles.cell, styles.updateCell]}>
          <View style={styles.updateWrapper}>
            <Ionicons name="time-outline" size={9} color={theme.textMuted} />
            <Text style={styles.updateText} numberOfLines={1}>
              {lastUpdated}
            </Text>
          </View>
        </View>

        {/* Action Indicator */}
        <View style={styles.actionCell}>
          <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surfaceHighlight,
   
    marginVertical: 3,
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowDesktop: {
    marginHorizontal: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
  },
  idCell: {
    width: 50,
    minWidth: 70,
  },
  idWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  idText: {
    fontSize: 9,
    fontWeight: "600",
    color: theme.text,
  },
  statusCell: {
    width: 95,
    minWidth: 95,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 7,
    fontWeight: "600",
  },
  locationCell: {
    width: 150,
    minWidth:150,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 9,
    color: theme.textSecondary,
    flex: 1,
  },
  metricsCell: {
    width: 120,
    minWidth: 120,
  },
  metricsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metricValue: {
    fontSize: 9,
    fontWeight: "700",
    color: theme.text,
  },
  metricUnit: {
    fontSize: 8,
    color: theme.textMuted,
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.border,
  },
  priorityCell: {
    width: 85,
    minWidth: 85,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: "600",
  },
  descriptionCell: {
    flex: 2,
    minWidth: 150,
  },
  descriptionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  descriptionText: {
    fontSize: 9,
    color: theme.textSecondary,
    flex: 1,
  },
  updateCell: {
    width: 90,
    minWidth: 90,
  },
  updateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  updateText: {
    fontSize: 9,
    color: theme.textMuted,
  },
  actionCell: {
    width: 30,
    alignItems: "flex-end",
  },
});

export default LightCard;