// screens/NotificationsScreen.js – Professional UI matching design system
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

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Light Malfunction Detected",
    message: "Light #LT-1024 in North Zone is showing abnormal voltage fluctuations. Immediate attention required.",
    type: "alert",
    status: "unread",
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    relatedId: "LT-1024",
    priority: "high",
  },
  {
    id: "2",
    title: "Maintenance Schedule",
    message: "Scheduled maintenance for South Zone lights on March 25th, 2024 from 9:00 AM to 2:00 PM.",
    type: "info",
    status: "unread",
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    relatedId: null,
    priority: "medium",
  },
  {
    id: "3",
    title: "New Supervisor Assigned",
    message: "Mr. Rajesh Kumar has been assigned as supervisor for East Zone effective from tomorrow.",
    type: "success",
    status: "read",
    timestamp: new Date(Date.now() - 1 * 86400000), // 1 day ago
    relatedId: "SUP-001",
    priority: "low",
  },
  {
    id: "4",
    title: "Power Consumption Alert",
    message: "Energy consumption exceeded threshold by 15% in Industrial Area. Please review usage patterns.",
    type: "warning",
    status: "unread",
    timestamp: new Date(Date.now() - 3 * 3600000), // 3 hours ago
    relatedId: "ZN-007",
    priority: "high",
  },
  {
    id: "5",
    title: "System Update Complete",
    message: "Firmware v2.3.0 has been successfully installed on all connected devices.",
    type: "success",
    status: "read",
    timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
    relatedId: null,
    priority: "low",
  },
  {
    id: "6",
    title: "Connectivity Issue",
    message: "3 lights in West Zone are currently offline. Checking network connectivity.",
    type: "alert",
    status: "unread",
    timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    relatedId: "WZ-089",
    priority: "high",
  },
  {
    id: "7",
    title: "Report Generated",
    message: "Weekly performance report for all zones is now available for download.",
    type: "info",
    status: "read",
    timestamp: new Date(Date.now() - 3 * 86400000), // 3 days ago
    relatedId: null,
    priority: "low",
  },
  {
    id: "8",
    title: "Battery Low Warning",
    message: "Backup battery for Light #LT-2091 is critically low. Replace soon.",
    type: "warning",
    status: "unread",
    timestamp: new Date(Date.now() - 12 * 3600000), // 12 hours ago
    relatedId: "LT-2091",
    priority: "medium",
  },
];

const NotificationsScreen = ({ onNotificationPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, unread, read
  const [selectedPriority, setSelectedPriority] = useState(null); // high, medium, low

  const fetchNotifications = async () => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      setNotifications(MOCK_NOTIFICATIONS);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, status: "read" } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, status: "read" }))
    );
    Alert.alert("Success", "All notifications marked as read");
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "alert":
        return { icon: "alert-circle", color: theme.status.error, bgColor: `${theme.status.error}10`, label: "Alert" };
      case "warning":
        return { icon: "warning", color: theme.status.warning, bgColor: `${theme.status.warning}10`, label: "Warning" };
      case "success":
        return { icon: "checkmark-circle", color: theme.status.success, bgColor: `${theme.status.success}10`, label: "Success" };
      default:
        return { icon: "information-circle", color: theme.status.info, bgColor: `${theme.status.info}10`, label: "Info" };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return { color: theme.status.error, label: "High" };
      case "medium":
        return { color: theme.status.warning, label: "Medium" };
      default:
        return { color: theme.textMuted, label: "Low" };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (filterType === "unread") {
      filtered = filtered.filter(n => n.status === "unread");
    } else if (filterType === "read") {
      filtered = filtered.filter(n => n.status === "read");
    }
    
    if (selectedPriority) {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, filterType, selectedPriority]);

  const unreadCount = notifications.filter(n => n.status === "unread").length;
  const readCount = notifications.filter(n => n.status === "read").length;
  const highPriorityCount = notifications.filter(n => n.priority === "high" && n.status === "unread").length;

  const renderNotificationCard = ({ item }) => {
    const typeConfig = getTypeConfig(item.type);
    const priorityConfig = getPriorityConfig(item.priority);
    const isUnread = item.status === "unread";

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          if (isUnread) markAsRead(item.id);
          onNotificationPress?.(item);
        }}
        style={styles.cardWrapper}
      >
        <View style={[styles.card, isUnread && styles.cardUnread]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
              <Ionicons name={typeConfig.icon} size={14} color={typeConfig.color} />
            </View>
            <View style={styles.cardTitleArea}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, isUnread && styles.titleBold]}>{item.title}</Text>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.typeLabel}>{typeConfig.label}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: `${priorityConfig.color}10` }]}>
                  <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                    {priorityConfig.label}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => deleteNotification(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="close-outline" size={14} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Card Body */}
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={9} color={theme.textMuted} />
              <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            </View>
            {item.relatedId && (
              <View style={styles.relatedContainer}>
                <Ionicons name="link-outline" size={9} color={theme.textMuted} />
                <Text style={styles.relatedText}>ID: {item.relatedId}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ label, value, count, active }) => {
    const isActive = filterType === value;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setFilterType(value)}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label} {count !== undefined ? `(${count})` : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  const PriorityFilter = ({ priority, label, active }) => {
    const isActive = selectedPriority === priority;
    const priorityConfig = getPriorityConfig(priority);
    
    return (
      <TouchableOpacity
        style={[styles.priorityChip, isActive && { backgroundColor: priorityConfig.color, borderColor: priorityConfig.color }]}
        onPress={() => setSelectedPriority(isActive ? null : priority)}
      >
        <Text style={[styles.priorityChipText, isActive && styles.priorityChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error && !loading && notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.status.error} />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Ionicons name="mail-unread-outline" size={10} color={theme.status.info} />
            <Text style={styles.statLabel}>Unread:</Text>
            <Text style={styles.statValue}>{unreadCount}</Text>
          </View>
          {highPriorityCount > 0 && (
            <View style={[styles.statPill, styles.highPriorityPill]}>
              <Ionicons name="alert-circle" size={10} color={theme.status.error} />
              <Text style={styles.statLabel}>High Priority:</Text>
              <Text style={[styles.statValue, { color: theme.status.error }]}>
                {highPriorityCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <FilterChip label="All" value="all" count={notifications.length} />
          <FilterChip label="Unread" value="unread" count={unreadCount} />
          <FilterChip label="Read" value="read" count={readCount} />
        </ScrollView>
      </View>

      {/* Priority Filters */}
      <View style={styles.priorityContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priorityScrollContent}>
          <PriorityFilter priority="high" label="High Priority" />
          <PriorityFilter priority="medium" label="Medium Priority" />
          <PriorityFilter priority="low" label="Low Priority" />
        </ScrollView>
      </View>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={12} color={theme.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
        contentContainerStyle={styles.listContent}
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
            <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              {filterType !== "all" || selectedPriority
                ? "No notifications match your filters"
                : "You're all caught up! Check back later for updates"}
            </Text>
            {(filterType !== "all" || selectedPriority) && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => { setFilterType("all"); setSelectedPriority(null); }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
    padding: 24,
  },
  
  // Header styles - matching design system
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
  highPriorityPill: {
    borderColor: theme.status.error,
    backgroundColor: `${theme.status.error}05`,
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
  
  // Tabs container
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
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    fontSize: 9,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  
  // Priority filters
  priorityContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  priorityScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  priorityChipText: {
    fontSize: 9,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  priorityChipTextActive: {
    color: "#FFFFFF",
  },
  
  // Mark all button
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: `${theme.primary}05`,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
  },
  markAllText: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.primary,
  },
  
  // List content
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Card styles
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: `${theme.primary}02`,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleArea: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.text,
    flex: 1,
  },
  titleBold: {
    fontWeight: "600",
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeLabel: {
    fontSize: 8,
    fontWeight: "500",
    color: theme.textMuted,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 4,
  },
  message: {
    fontSize: 10,
    color: theme.textSecondary,
    lineHeight: 14,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 8,
    color: theme.textMuted,
  },
  relatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relatedText: {
    fontSize: 8,
    color: theme.textMuted,
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
    fontSize: 11,
    color: theme.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${theme.primary}10`,
    borderRadius: 4,
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.primary,
  },
  
  // Loading & Error
  loadingText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 12,
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
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default NotificationsScreen;