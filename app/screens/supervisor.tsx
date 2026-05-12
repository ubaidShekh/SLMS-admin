// screens/SupervisorsScreen.js – Professional UI matching design system
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
  TextInput,
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

// Mock data – replace with your API
const MOCK_SUPERVISORS = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98765 43210",
    department: "Electrical",
    zone: "North Zone",
    status: "active",
    assignedLights: 24,
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43211",
    department: "Maintenance",
    zone: "South Zone",
    status: "active",
    assignedLights: 18,
    joinDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Amit Verma",
    email: "amit.verma@example.com",
    phone: "+91 98765 43212",
    department: "Electrical",
    zone: "East Zone",
    status: "inactive",
    assignedLights: 12,
    joinDate: "2022-11-10",
  },
  {
    id: "4",
    name: "Sunita Patel",
    email: "sunita.patel@example.com",
    phone: "+91 98765 43213",
    department: "Operations",
    zone: "West Zone",
    status: "active",
    assignedLights: 30,
    joinDate: "2023-06-05",
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 98765 43214",
    department: "Technical",
    zone: "Central Zone",
    status: "active",
    assignedLights: 22,
    joinDate: "2022-09-18",
  },
];

const SupervisorsScreen = ({ onSupervisorPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const numColumns = width >= 1200 ? 3 : width >= 768 ? 2 : 1;

  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchSupervisors = async () => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      setSupervisors(MOCK_SUPERVISORS);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "Failed to load supervisors.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSupervisors();
  };

  const filteredSupervisors = useMemo(() => {
    let filtered = supervisors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    return filtered;
  }, [supervisors, searchQuery, filterStatus]);

  const getStatusConfig = (status) => {
    if (status === "active") {
      return { 
        color: theme.status.success, 
        bgColor: `${theme.status.success}10`,
        icon: "checkmark-circle", 
        label: "Active"
      };
    }
    return { 
      color: theme.status.error, 
      bgColor: `${theme.status.error}10`,
      icon: "close-circle", 
      label: "Inactive"
    };
  };

  const activeCount = supervisors.filter(s => s.status === "active").length;
  const inactiveCount = supervisors.filter(s => s.status === "inactive").length;

  const renderSupervisorCard = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onSupervisorPress?.(item)}
        style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}
      >
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: `${theme.primary}10` }]}>
              <Ionicons name="person" size={16} color={theme.primary} />
            </View>
            <View style={styles.cardTitleArea}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.department}>{item.department}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon} size={8} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>

          {/* Card Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="mail-outline" size={10} color={theme.textMuted} />
                <Text style={styles.detailText} numberOfLines={1}>{item.email}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={10} color={theme.textMuted} />
                <Text style={styles.detailText}>{item.phone}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="map-outline" size={10} color={theme.textMuted} />
                <Text style={styles.detailText}>{item.zone}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="bulb-outline" size={10} color={theme.textMuted} />
                <Text style={styles.detailText}>{item.assignedLights} lights</Text>
              </View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Ionicons name="calendar-outline" size={9} color={theme.textMuted} />
            <Text style={styles.joinDate}>Joined {item.joinDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ label, value, count }) => {
    const isActive = filterStatus === value;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setFilterStatus(value)}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label} {count !== undefined ? `(${count})` : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading supervisors...</Text>
      </View>
    );
  }

  if (error && !loading && supervisors.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.status.error} />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSupervisors}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - Matching design system */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerLeft}>
          <Ionicons name="people-outline" size={18} color={theme.primary} />
          <Text style={styles.headerTitle}>Supervisors</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Ionicons name="checkmark-circle" size={10} color={theme.status.success} />
            <Text style={styles.statLabel}>Active:</Text>
            <Text style={styles.statValue}>{activeCount}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="close-circle" size={10} color={theme.status.error} />
            <Text style={styles.statLabel}>Inactive:</Text>
            <Text style={styles.statValue}>{inactiveCount}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={14} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or zone..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={14} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs - Using same tab style as LightsScreen */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <FilterChip label="All" value="all" count={supervisors.length} />
          <FilterChip label="Active" value="active" count={activeCount} />
          <FilterChip label="Inactive" value="inactive" count={inactiveCount} />
        </ScrollView>
      </View>

      {/* Grid List */}
      <FlatList
        key={`supervisors-${numColumns}`}
        data={filteredSupervisors}
        keyExtractor={(item) => item.id}
        renderItem={renderSupervisorCard}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : null}
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
            <Ionicons name="people-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyTitle}>No Supervisors Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filters"
                : "No supervisors available at this time"}
            </Text>
            {(searchQuery !== "" || filterStatus !== "all") && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => { setSearchQuery(""); setFilterStatus("all"); }}
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
  
  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    marginLeft: 8,
    color: theme.text,
    paddingVertical: 0,
  },
  
  // Tabs container - matching LightsScreen
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
  
  // Grid layout
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    padding: 0,
  },
  
  // Card styles - matching design system
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleArea: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 2,
  },
  department: {
    fontSize: 9,
    color: theme.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
  },
  
  // Details section
  detailsGrid: {
    gap: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 9,
    color: theme.textSecondary,
    flex: 1,
  },
  
  // Card footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  joinDate: {
    fontSize: 9,
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

export default SupervisorsScreen;