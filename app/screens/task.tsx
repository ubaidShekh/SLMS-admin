// screens/TaskLogScreen.js – Professional UI matching LightsScreen design
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

const theme = {
  primary: "#10B981",
  primaryLight: "#34D399",
  primaryDark: "#059669",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceHighlight: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderDark: "#CBD5E1",
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    neutral: "#64748B",
  },
};

const API_URL = "https://attendanceapp-rcqk.onrender.com/iot/alllights";

const TaskLogScreen = ({ onItemPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = isDesktop ? (width >= 1200 ? 2 : 2) : 1;

  const [lightData, setLightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, pending, resolved

  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((task) => ({
      id: task.lightId || "Unknown",
      location: task.location || "Unknown",
      status: task.status || "Offline",
      lastUpdated: task.assignedAt ? new Date(task.assignedAt) : new Date(),
      lastUpdatedStr: task.assignedAt
        ? new Date(task.assignedAt).toLocaleString()
        : new Date().toLocaleString(),
      lastUpdatedTime: task.assignedAt
        ? new Date(task.assignedAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
    }));
  };

  const fetchLights = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setLightData(transformApiData(json));
    } catch (err) {
      console.error(err);
      setError(err.message);
      Alert.alert("Error", "Failed to load activity log.");
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

  const getStatusConfig = (status) => {
    switch (status) {
      case "Working":
        return { 
          icon: "checkmark-circle", 
          color: theme.status.success, 
          bgColor: `${theme.status.success}10`,
          label: "Operational",
          type: "resolved"
        };
      case "Fault":
        return { 
          icon: "warning", 
          color: theme.status.error, 
          bgColor: `${theme.status.error}10`,
          label: "Fault",
          type: "pending"
        };
      case "Offline":
        return { 
          icon: "cloud-offline", 
          color: theme.status.warning, 
          bgColor: `${theme.status.warning}10`,
          label: "Offline",
          type: "pending"
        };
      default:
        return { 
          icon: "help-circle", 
          color: theme.textMuted, 
          bgColor: theme.border,
          label: "Unknown",
          type: "pending"
        };
    }
  };

  const pendingTasks = useMemo(() => {
    return lightData.filter(device => 
      device.status === "Fault" || device.status === "Offline"
    );
  }, [lightData]);

  const resolvedTasks = useMemo(() => {
    return lightData.filter(device => device.status === "Working");
  }, [lightData]);

  const filteredData = useMemo(() => {
    if (filterType === "pending") return pendingTasks;
    if (filterType === "resolved") return resolvedTasks;
    return lightData;
  }, [lightData, filterType, pendingTasks, resolvedTasks]);

  const stats = useMemo(() => ({
    total: lightData.length,
    pending: pendingTasks.length,
    resolved: resolvedTasks.length,
  }), [lightData, pendingTasks, resolvedTasks]);

  const FilterTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
        <TouchableOpacity
          style={[styles.tab, filterType === "all" && styles.tabActive]}
          onPress={() => setFilterType("all")}
        >
          <Text style={[styles.tabText, filterType === "all" && styles.tabTextActive]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, filterType === "pending" && styles.tabActive]}
          onPress={() => setFilterType("pending")}
        >
          <View style={styles.tabContent}>
            <Ionicons name="alert-circle" size={10} color={filterType === "pending" ? "#FFF" : theme.status.error} />
            <Text style={[styles.tabText, filterType === "pending" && styles.tabTextActive]}>
              Pending ({stats.pending})
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, filterType === "resolved" && styles.tabActive]}
          onPress={() => setFilterType("resolved")}
        >
          <View style={styles.tabContent}>
            <Ionicons name="checkmark-circle" size={10} color={filterType === "resolved" ? "#FFF" : theme.status.success} />
            <Text style={[styles.tabText, filterType === "resolved" && styles.tabTextActive]}>
              Resolved ({stats.resolved})
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderPendingCard = ({ item }) => {
    const { icon, color, bgColor, label } = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor: color }]}>
            <Ionicons name={icon} size={10} color={color} />
            <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
          </View>
          <Text style={styles.deviceId}>ID: {item.id}</Text>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={12} color={theme.textMuted} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            <Text style={styles.time}>{item.lastUpdatedStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLogEntry = ({ item }) => {
    const { icon, color, bgColor, label } = getStatusConfig(item.status);
    return (
      <View style={styles.logEntry}>
        <View style={[styles.logIconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={12} color={color} />
        </View>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logDevice}>Device {item.id}</Text>
            <Text style={[styles.logStatus, { color }]}>{label}</Text>
          </View>
          <Text style={styles.logLocation}>{item.location}</Text>
          <Text style={styles.logTime}>{item.lastUpdatedStr}</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading activity log...</Text>
      </View>
    );
  }

  if (error && !loading && lightData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.status.error} />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLights}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      {/* Header - Matching LightsScreen style */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Task Log</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Ionicons name="alert-circle" size={10} color={theme.status.error} />
            <Text style={styles.statLabel}>Pending:</Text>
            <Text style={styles.statValue}>{stats.pending}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="checkmark-circle" size={10} color={theme.status.success} />
            <Text style={styles.statLabel}>Resolved:</Text>
            <Text style={styles.statValue}>{stats.resolved}</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Task List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => `${filterType}-${item.id}`}
        numColumns={filterType === "pending" ? numColumns : 1}
        renderItem={({ item }) => 
          filterType === "pending" ? renderPendingCard({ item }) : renderLogEntry({ item })
        }
        contentContainerStyle={[
          styles.listContainer,
          filterType === "pending" && isDesktop && styles.gridContainer,
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
            <Ionicons 
              name={filterType === "pending" ? "checkmark-circle" : "document-text-outline"} 
              size={48} 
              color={theme.textMuted} 
            />
            <Text style={styles.emptyTitle}>
              {filterType === "pending" ? "No Pending Issues" : "No Activity Records"}
            </Text>
            <Text style={styles.emptyText}>
              {filterType === "pending" 
                ? "All devices are operating normally" 
                : "No activity logs available at this time"}
            </Text>
          </View>
        }
        key={filterType === "pending" ? `grid-${numColumns}` : "list"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  // Header styles - matching LightsScreen
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerDesktop: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: -0.3,
  },
  headerStats: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
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
  statLabel: {
    fontSize: 9,
    fontWeight: "400",
    color: theme.textSecondary,
  },
  statValue: {
    fontSize: 9,
    fontWeight: "600",
    color: theme.text,
  },
  
  // Tabs styles - matching LightsScreen
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
  },
  tabActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 9,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  
  // Card styles - matching LightsScreen card design
  taskCard: {
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  deviceId: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.textSecondary,
  },
  cardBody: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 11,
    color: theme.text,
    flex: 1,
  },
  time: {
    fontSize: 9,
    color: theme.textMuted,
    flex: 1,
  },
  
  // Log entry styles
  logEntry: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  logIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logDevice: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.text,
  },
  logStatus: {
    fontSize: 9,
    fontWeight: "500",
  },
  logLocation: {
    fontSize: 10,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 9,
    color: theme.textMuted,
  },
  
  // Layout containers
  listContainer: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.background,
  },
  
  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: "center",
  },
});

export default TaskLogScreen;