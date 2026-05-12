// screens/LightsScreen.js
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { getStatusStyle } from "../utils/helpers";

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

const API_URL = "https://attendanceapp-rcqk.onrender.com/iot/alllights";

const LightsScreen = ({ onLightPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = isDesktop ? (width >= 1200 ? 3 : 2) : 1;

  const [lightData, setLightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((task) => ({
      id: task.lightId || "Unknown",
      location: task.location || "Unknown",
      status: mapStatus(task.status),
      voltage: task.voltage ?? "—",
      current: task.current ?? "—",
      lastUpdated: task.assignedAt
        ? new Date(task.assignedAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
      raw: task,
    }));
  };

  const mapStatus = (status) => {
    switch (status) {
      case "Working": return "Working";
      case "Fault": return "Fault";
      case "Offline": return "Offline";
      default: return "Offline";
    }
  };

  const fetchLights = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const transformed = transformApiData(json);
      setLightData(transformed);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      Alert.alert("Error", "Failed to load lights data. Please pull to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLights();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLights();
  };

  const locationStats = useMemo(() => {
    const locationMap = new Map();
    lightData.forEach(device => {
      const loc = device.location;
      if (!locationMap.has(loc)) locationMap.set(loc, 0);
      locationMap.set(loc, locationMap.get(loc) + 1);
    });
    const stats = Array.from(locationMap.entries()).map(([location, count]) => ({ location, count }));
    stats.sort((a, b) => a.location.localeCompare(b.location));
    return stats;
  }, [lightData]);

  const filteredDevices = useMemo(() => {
    if (!selectedLocation) return lightData;
    return lightData.filter(device => device.location === selectedLocation);
  }, [lightData, selectedLocation]);

  const totalLights = filteredDevices.length;
  const workingLights = filteredDevices.filter(l => l.status === "Working").length;

  const getStatusPillStyle = (status) => {
    switch (status) {
      case "Working":
        return { bg: theme.status.success + "10", border: theme.status.success, textColor: theme.status.success };
      case "Fault":
        return { bg: theme.status.error + "10", border: theme.status.error, textColor: theme.status.error };
      default:
        return { bg: theme.status.warning + "10", border: theme.status.warning, textColor: theme.status.warning };
    }
  };

  const renderSimplifiedLight = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const pillStyle = getStatusPillStyle(item.status);
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={() => onLightPress(item)}>
        <View style={[styles.simplifiedLightCard, isDesktop && styles.simplifiedLightCardDesktop]}>
          <Text style={styles.simplifiedLightId}>{item.id}</Text>
          <View style={[styles.simplifiedStatusContainer, { backgroundColor: pillStyle.bg, borderColor: pillStyle.border }]}>
            <View style={[styles.glowingDot, { backgroundColor: pillStyle.textColor }]} />
            <Text style={[styles.simplifiedStatusText, { color: pillStyle.textColor }]}>{statusStyle.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Location Tab Bar – fixed for long names
  const LocationTabs = () => {
    if (locationStats.length === 0) return null;
    return (
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, selectedLocation === null && styles.tabActive]}
            onPress={() => setSelectedLocation(null)}
          >
            <Text style={[styles.tabText, selectedLocation === null && styles.tabTextActive]}>
              All ({lightData.length})
            </Text>
          </TouchableOpacity>
          {locationStats.map(({ location, count }) => (
            <TouchableOpacity
              key={location}
              style={[styles.tab, selectedLocation === location && styles.tabActive]}
              onPress={() => setSelectedLocation(location)}
            >
              <Text
                style={[styles.tabText, selectedLocation === location && styles.tabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {location} ({count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading lights data...</Text>
      </View>
    );
  }

  if (error && !loading && lightData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.status.error} />
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLights}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.lightsHeader, isDesktop && styles.lightsHeaderDesktop]}>
        <View style={styles.headerLeft}>
    
          <Text style={styles.lightsHeaderTitle}>Street Lights</Text>
        </View>
        <View style={styles.lightsStats}>
          <View style={styles.lightsStatItem}>
            <Ionicons name="bulb-outline" size={14} color={theme.status.info} />
            <Text style={styles.lightsStatLabel}>Total:</Text>
            <Text style={styles.lightsStatValue}>{totalLights}</Text>
          </View>
          <View style={styles.lightsStatItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={theme.status.success} />
            <Text style={styles.lightsStatLabel}>Working:</Text>
            <Text style={styles.lightsStatValue}>{workingLights}</Text>
          </View>
        </View>
      </View>

      <LocationTabs />

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View style={[styles.gridItem, { width: `${100 / numColumns}%` }]}>
            {renderSimplifiedLight({ item })}
          </View>
        )}
        contentContainerStyle={[
          styles.simplifiedListContainer,
          isDesktop && styles.simplifiedListContainerDesktop,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.surface}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices in this location</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: theme.background },
  lightsHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 4,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lightsHeaderDesktop: { paddingHorizontal: 16, paddingTop: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  lightsHeaderTitle: { fontSize: 14, fontWeight: "700", color: theme.text, letterSpacing: -0.3, marginLeft: 4 },
  lightsStats: { flexDirection: "row", gap: 8 },
  lightsStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lightsStatLabel: { fontSize: 9, fontWeight: "400", color: theme.textSecondary },
  lightsStatValue: { fontSize: 9, fontWeight: "600", color: theme.text },

  tabsContainer: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
    maxWidth: 180,           // Prevents overly wide tabs
    flexShrink: 1,          // Allows shrinking
  },
  tabActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  tabText: {
    fontSize: 9,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  simplifiedLightCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  simplifiedLightCardDesktop: { marginHorizontal: 0, marginBottom: 0 },
  simplifiedLightId: { fontSize: 10, fontWeight: "600", color: theme.text },
  simplifiedStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  simplifiedStatusText: { fontSize: 9, fontWeight: "600", marginLeft: 6 },
  glowingDot: { width: 4, height: 4, borderRadius: 2 },
  simplifiedListContainer: { paddingBottom: 20, paddingTop: 10 },
  simplifiedListContainerDesktop: { paddingBottom: 20, paddingHorizontal: 10 },
  gridItem: { padding: 4 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  loadingText: { marginTop: 12, fontSize: 10, color: theme.textSecondary },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background, padding: 24 },
  errorText: { marginTop: 12, fontSize: 12, color: theme.text, textAlign: "center" },
  retryButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.primary, borderRadius: 4 },
  retryButtonText: { color: theme.background, fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 12, color: theme.textSecondary },
});

export default LightsScreen;