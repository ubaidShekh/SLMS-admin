// components/CustomTabBar.js
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

// Theme from AddLightModal (emerald green theme)
const theme = {
  // Primary color - Emerald Green from AddLightModal
  primary: "#10B981", // Main brand green (emerald)
  primaryLight: "#34D399", // Lighter variant for hover states
  primaryDark: "#059669", // Darker variant for active states

  // Tab Bar specific colors
  background: "#10B981", // Tab bar background (emerald green)
  surface: "#FFFFFF", // For cards/modals
  text: "#FFFFFF", // White text on green
  textMuted: "#D1FAE5", // Very light emerald green / off-white for inactive

  // Border and shadow
  border: "#059669", // Darker emerald green border
  shadow: "rgba(0,0,0,0.15)",

  // Status colors (for consistency)
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    neutral: "#6B7280",
  },
};

const CustomTabBar = ({ activeTab, onTabPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [hoveredTab, setHoveredTab] = useState(null);

  const handlePress = (tab) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onTabPress(tab);
  };

  // Mobile Tab Bar (Floating with rounded corners)
  if (!isDesktop) {
    return (
      <View style={styles.mobileContainer}>
        <Animated.View
          style={[styles.mobileTabBar, { transform: [{ scale: scaleAnim }] }]}
        >
          {[
            {
              key: "dashboard",
              label: "Dashboard",
              icon: "grid",
              iconOutline: "grid-outline",
            },
            {
              key: "lights",
              label: "Lights",
              icon: "bulb",
              iconOutline: "bulb-outline",
            },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.mobileTabItem,
                  isActive && styles.activeMobileTabItem,
                ]}
                onPress={() => handlePress(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isActive ? tab.icon : tab.iconOutline}
                  size={22}
                  color={isActive ? theme.text : theme.textMuted}
                />
                <Text
                  style={[
                    styles.mobileTabLabel,
                    isActive && styles.activeMobileTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    );
  }

  // Desktop Sidebar (Full green background)
  return (
    <View style={styles.desktopSidebar}>
      <View style={styles.sidebarGradientBase} />
      <View style={styles.sidebarGradientTop} />
      <View style={styles.sidebarGradientBottom} />
      <View style={styles.sidebarHeader}>
        {/* Logo with better visibility on green background */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.sidebarTitle}>SLMS</Text>
          <Text style={styles.sidebarSub}>Street Light Monitoring System</Text>
        </View>
      </View>
      <View style={styles.sidebarDivider} />

      <View style={styles.sidebarNav}>
        {[
          {
            key: "dashboard",
            label: "Dashboard",
            icon: "grid",
            iconOutline: "grid-outline",
          },
          {
            key: "lights",
            label: "Lights",
            icon: "bulb",
            iconOutline: "bulb-outline",
          },
            {
            key: "tasks",
            label: "Tasks",
            icon: "list",
            iconOutline: "list-outline",
          },
           {
            key: "supervisor",
            label: "Supervisor",
            icon: "person",
            iconOutline: "person-outline",
          },
          {
  key: "notifications",
  label: "Notifications",
  icon: "notifications",
  iconOutline: "notifications-outline",
}
 


        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const isHovered = hoveredTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.sidebarItem,
                isActive && styles.activeSidebarItem,
                !isActive && isHovered && styles.sidebarItemHover,
              ]}
              onPress={() => handlePress(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              activeOpacity={0.9}
            >
              <Ionicons
                name={isActive ? tab.icon : tab.iconOutline}
                size={14}
                color={isActive ? theme.text : theme.textMuted}
              />
              <Text
                style={[
                  styles.sidebarLabel,
                  isActive && styles.activeSidebarLabel,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ==================== MOBILE STYLES ====================
  mobileContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  mobileTabBar: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    backgroundColor: theme.background,
    borderRadius: 4,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    width: "100%",
  },
  mobileTabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  activeMobileTabItem: {
    backgroundColor: theme.primaryDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.textMuted,
    marginTop: 4,
  },
  activeMobileTabLabel: {
    color: theme.text,
    fontWeight: "700",
  },

  // ==================== DESKTOP SIDEBAR STYLES ====================
  desktopSidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#065F46",
    paddingVertical: 20,
    paddingHorizontal: 16,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  sidebarGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#065F46",
  },
  sidebarGradientTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(52, 211, 153, 0.22)",
    opacity:0.5
  },
  sidebarGradientBottom: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    opacity:0.5
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    paddingBottom: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: 70,
    height: 60,
    position: "absolute",
    top: -6.5,
    left: -13,
  },
  headerTextContainer: {
    flex: 1,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: 0.4,
  },
  sidebarSub: {
    fontSize: 9,
    color: "#ECFDF5",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "rgba(236, 253, 245, 0.24)",
    marginBottom: 14,
  },
  sidebarNav: {
    flex: 1,
    gap: 8,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 2,
    gap: 12,
    cursor: "pointer",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeSidebarItem: {
    backgroundColor: "rgba(6, 95, 70, 0.95)",
    borderColor: "rgba(236, 253, 245, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sidebarItemHover: {
    backgroundColor: "rgba(16, 185, 129, 0.28)",
    borderColor: "rgba(236, 253, 245, 0.2)",
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.textMuted,
    flex: 1,
    letterSpacing: 0.2,
  },
  activeSidebarLabel: {
    color: theme.text,
    fontWeight: "600",
  },
  activeBar: {
    width: 3,
    height: 20,
    backgroundColor: "#ECFDF5",
    borderRadius: 2,
  },
});

export default CustomTabBar;
