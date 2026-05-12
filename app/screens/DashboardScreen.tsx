// screens/DashboardScreen.js
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import AddLightModal from "../../components/AddLightModal";
import EmptyState from "../../components/EmptyState";
import FAB from "../../components/FAB";
import LightCard from "../../components/LightCard";

// Theme
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

// API endpoints
const API_URL = "https://attendanceapp-rcqk.onrender.com/iot/alllights";
const ADD_LIGHT_API_URL = "https://attendanceapp-rcqk.onrender.com/iot/addlight";

const DashboardScreen = ({
  filter: externalFilter,
  setFilter: externalSetFilter,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  onClearFilters: externalOnClearFilters,
  onLightPress,
  onLogout,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [lightData, setLightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(externalFilter || "All");
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [addLightModalVisible, setAddLightModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addedLightName, setAddedLightName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(new Date());

  const debounceTimeout = useRef(null);
  const notificationInterval = useRef(null);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const generateNotificationsFromData = (lights, newLightAdded = null) => {
    const newNotifications = [];

    lights.forEach(light => {
      const lastUpdated = light.raw?.assignedAt || light.lastUpdatedTime;
      if (lastUpdated && isToday(lastUpdated)) {
        if (light.status === "Fault") {
          newNotifications.push({
            id: `fault-${light.id}-${Date.now()}`,
            title: `⚠️ Fault detected in Light ${light.id} at ${light.location}`,
            time: getRelativeTime(lastUpdated),
            status: "error",
            lightId: light.id,
            timestamp: new Date(lastUpdated)
          });
        } else if (light.status === "Offline") {
          newNotifications.push({
            id: `offline-${light.id}-${Date.now()}`,
            title: `📡 Light ${light.id} at ${light.location} went offline`,
            time: getRelativeTime(lastUpdated),
            status: "warning",
            lightId: light.id,
            timestamp: new Date(lastUpdated)
          });
        } else if (light.status === "Working" && light.raw?.assignedAt && isToday(light.raw.assignedAt)) {
          const addedTime = new Date(light.raw.assignedAt);
          const hoursDiff = (new Date() - addedTime) / 3600000;
          if (hoursDiff <= 1) {
            newNotifications.push({
              id: `working-${light.id}-${Date.now()}`,
              title: `✅ Light ${light.id} at ${light.location} is working normally`,
              time: getRelativeTime(lastUpdated),
              status: "success",
              lightId: light.id,
              timestamp: new Date(lastUpdated)
            });
          }
        }
      }
    });

    if (newLightAdded) {
      newNotifications.unshift({
        id: `added-${Date.now()}`,
        title: `✨ New light ${newLightAdded.lightId} has been added at ${newLightAdded.location}`,
        time: "Just now",
        status: "success",
        lightId: newLightAdded.lightId,
        timestamp: new Date()
      });
    }

    const uniqueNotifications = newNotifications.reduce((acc, current) => {
      const exists = acc.find(item => item.lightId === current.lightId && item.status === current.status);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    uniqueNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return uniqueNotifications.slice(0, 10);
  };

  const transformApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((task) => ({
      id: task.lightId || "Unknown",
      location: task.location || "Unknown",
      email: task.email || "",
      status: task.status || "Offline",
      voltage: task.voltage ?? "—",
      current: task.current ?? "—",
      priority: task.priority || "Medium",
      description: task.description || "",
      lastUpdated: task.assignedAt
        ? new Date(task.assignedAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
      lastUpdatedTime: task.assignedAt || new Date().toISOString(),
      raw: task,
    }));
  };

  const fetchLights = async (showLoading = true, newLightAdded = null) => {
    try {
      if (showLoading) setError(null);
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      const transformed = transformApiData(json);
      setLightData(transformed);
      setLastFetchTime(new Date());
      
      const newNotifications = generateNotificationsFromData(transformed, newLightAdded);
      setNotifications(prev => {
        const allNotifications = [...newNotifications, ...prev];
        const unique = allNotifications.filter((notif, index, self) => 
          index === self.findIndex(n => n.id === notif.id)
        );
        return unique.slice(0, 10);
      });
    } catch (err) {
      console.error("Fetch error:", err);
      if (showLoading) {
        setError(err.message);
        Alert.alert(
          "Error",
          "Failed to load lights data. Please pull to refresh.",
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchLights(true);
    
    notificationInterval.current = setInterval(() => {
      fetchLights(false);
    }, 30000);
    
    return () => {
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLights(true);
  };

  const clearAllFilters = () => {
    setFilter("All");
    setSearchQuery("");
    if (externalSetFilter) externalSetFilter("All");
    if (externalSetSearchQuery) externalSetSearchQuery("");
    if (externalOnClearFilters) externalOnClearFilters();
  };

  const handleSearchChange = (text) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearchQuery(text);
      if (externalSetSearchQuery) externalSetSearchQuery(text);
    }, 300);
  };

  const handleAddLight = async (newLight) => {
    try {
      const response = await fetch(ADD_LIGHT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLight),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      setAddedLightName(newLight.lightId);
      setSuccessModalVisible(true);
      
      await fetchLights(true, newLight);
      setTimeout(() => { setSuccessModalVisible(false) }, 1000);
    } catch (error) {
      console.error("Error adding light:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add light. Please try again.",
      );
    }
  };

  const totalLights = lightData.length;
  const workingLights = lightData.filter((l) => l.status === "Working").length;
  const faultyLights = lightData.filter((l) => l.status === "Fault").length;
  const offlineLights = lightData.filter((l) => l.status === "Offline").length;
  const progresslight = lightData.filter((l) => l.status === "In Progress").length;

  const filterOptions = useMemo(
    () => [
      { key: "All", label: "All", icon: "apps-outline", count: totalLights },
      {
        key: "Working",
        label: "Working",
        icon: "checkmark-circle-outline",
        count: workingLights,
      },
      {
        key: "Faulty",
        label: "Faulty",
        icon: "warning-outline",
        count: faultyLights,
      },
      {
        key: "Offline",
        label: "Offline",
        icon: "cloud-offline-outline",
        count: offlineLights,
      },
       {
        key: "In Progress",
        label: "In Progress",
        icon: "sync",
        count: progresslight,
      },
    ],
    [totalLights, workingLights, faultyLights, offlineLights],
  );

  const getFilteredData = () => {
    let filtered = lightData;
    if (filter !== "All") {
      if (filter === "Working")
        filtered = filtered.filter((l) => l.status === "Working");
      else if (filter === "Faulty")
        filtered = filtered.filter((l) => l.status === "Fault");
      else if (filter === "Offline")
        filtered = filtered.filter((l) => l.status === "Offline");
      else if(filter==="In Progress")
        filtered = filtered.filter((l)=>l.status==="In Progress");
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (l) =>
          l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  };

  const filteredData = getFilteredData();

  const FilterButton = ({ label, filterKey, iconName, count }) => {
    const isActive = filter === filterKey;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = () =>
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        useNativeDriver: true,
      }).start();
    const handlePressOut = () =>
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Pressable
        onPress={() => {
          setFilter(filterKey);
          if (externalSetFilter) externalSetFilter(filterKey);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.filterChip,
            isActive && styles.activeFilterChip,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons
            name={iconName}
            size={14}
            color={isActive ? theme.primary : theme.textSecondary}
            style={styles.filterIcon}
          />
          <Text
            style={[
              styles.filterChipText,
              isActive && styles.activeFilterChipText,
            ]}
          >
            {label}
          </Text>
          {count > 0 && (
            <View style={[styles.badge, isActive && styles.activeBadge]}>
              <Text
                style={[styles.badgeText, isActive && styles.activeBadgeText]}
              >
                {count}
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Working":
        return theme.status.success;
      case "Fault":
        return theme.status.error;
      case "Offline":
        return theme.status.warning;
      default:
        return theme.status.neutral;
    }
  };

  const mapDevices = lightData;

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.tableHeaderGradientBase} />
      <View style={styles.tableHeaderGradientTop} />
      <View style={styles.tableHeaderGradientBottom} />
      <View style={styles.tableHeaderContent}>
        <View style={[styles.headerCell, styles.idCell]}>
          <Text style={styles.headerText}>Light ID</Text>
        </View>
        <View style={[styles.headerCell, styles.statusCell]}>
          <Text style={styles.headerText}>Status</Text>
        </View>
        <View style={[styles.headerCell, styles.locationCell]}>
          <Text style={styles.headerText}>Location</Text>
        </View>
        <View style={[styles.headerCell, styles.metricsCell]}>
          <Text style={styles.headerText}>Metrics</Text>
        </View>
        <View style={[styles.headerCell, styles.priorityCell]}>
          <Text style={styles.headerText}>Priority</Text>
        </View>
        <View style={[styles.headerCell, styles.descriptionCell]}>
          <Text style={styles.headerText}>Description</Text>
        </View>
        <View style={[styles.headerCell, styles.updateCell]}>
          <Text style={styles.headerText}>Updated</Text>
        </View>
        <View style={[styles.headerCell, styles.actionCell]}>
          <Text style={styles.headerText}></Text>
        </View>
      </View>
    </View>
  );

  const RectangularMap = () => {
    const scrollViewRef = useRef(null);
    
    const getDynamicPositions = () => {
      const positions = [];
      const totalDevices = mapDevices.length;
      
      if (totalDevices === 0) return positions;
      
      let cols = 4;
      if (totalDevices <= 4) cols = 2;
      else if (totalDevices <= 9) cols = 3;
      else if (totalDevices <= 16) cols = 4;
      else if (totalDevices <= 25) cols = 5;
      else cols = 6;
      
      const rows = Math.ceil(totalDevices / cols);
      const spacingX = 160;
      const spacingY = 90;
      const startX = 40;
      const startY = 50;
      
      for (let i = 0; i < totalDevices; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          top: startY + (row * spacingY),
          left: startX + (col * spacingX),
        });
      }
      return positions;
    };

    const dynamicPositions = getDynamicPositions();
    const totalDevices = mapDevices.length;
    const colsNeeded = Math.min(6, Math.ceil(Math.sqrt(totalDevices)) || 1);
    const calculatedWidth = Math.max(450, colsNeeded * 170 + 50);
    const calculatedHeight = Math.max(300, Math.ceil(totalDevices / colsNeeded) * 100 + 80);

    return (
      <View style={styles.mapCard}>
        <ImageBackground 
          source={require('../../assets/images/map.png')} 
          style={styles.mapImageBackground}
          imageStyle={styles.mapImageStyle}
          resizeMode="cover"
        >
          <View style={styles.mapBackground}>
            <ScrollView 
              ref={scrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              showsVerticalScrollIndicator={true}
              style={styles.mapScrollView}
              contentContainerStyle={styles.mapScrollContent}
            >
              <View style={[styles.mapPattern, { 
                width: calculatedWidth,
                minHeight: calculatedHeight
              }]}>
                {/* Device Pins */}
                {mapDevices.map((device, index) => {
                  const pos = dynamicPositions[index];
                  if (!pos) return null;
                  return (
                    <View
                      key={device.id}
                      style={[styles.mapPin, { top: pos.top, left: pos.left }]}
                    >
                      <View style={styles.markerWrapper}>
                        <Ionicons
                          name="location"
                          size={32}
                          color={getStatusColor(device.status)}
                        />
                        <View style={styles.pinLabel}>
                          <Text style={styles.pinText}>{device.id}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.mapOverlay}>
              <View style={styles.mapContent}>
                <Ionicons name="location" size={16} color="#FFF" />
                <Text style={styles.mapTitle}>Live Device Tracking ({totalDevices} devices)</Text>
                <View style={styles.mapBadge}>
                  <View style={styles.liveDotMap} />
                  <Text style={styles.mapBadgeText}>
                    {workingLights} Active Devices
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const NotificationsCard = () => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'success': return theme.status.success;
        case 'error': return theme.status.error;
        case 'warning': return theme.status.warning;
        case 'info': return theme.status.info;
        default: return theme.primary;
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'success': return "checkmark-circle";
        case 'error': return "warning";
        case 'warning': return "alert-circle";
        case 'info': return "information-circle";
        default: return "notifications";
      }
    };

    return (
      <View style={styles.rightPanelCard}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC', '#F0FDF4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="notifications-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        
        <ScrollView 
          style={styles.notificationScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notificationList}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={24} color={theme.textMuted} />
                <Text style={styles.emptyNotificationsText}>No new notifications</Text>
                <Text style={styles.emptyNotificationsSubtext}>Pull to refresh for updates</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <View
                    style={[
                      styles.notificationDot,
                      { backgroundColor: getStatusColor(notification.status) },
                    ]}
                  />
                  <View style={styles.notificationIcon}>
                    <Ionicons 
                      name={getStatusIcon(notification.status)} 
                      size={12} 
                      color={getStatusColor(notification.status)} 
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const SummaryStats = ({ compact = false }) => {
    const cards = (
      <>
        <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: theme.status.info + "10" },
            ]}
          >
            <Ionicons name="bulb-outline" size={16} color={theme.status.info} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryCount}>{totalLights}</Text>
            <Text style={styles.summaryLabel}>Total Lights</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: theme.status.success + "10" },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={theme.status.success}
            />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryCount}>{workingLights}</Text>
            <Text style={styles.summaryLabel}>Working</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: theme.status.error + "10" },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={16}
              color={theme.status.error}
            />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryCount}>{faultyLights}</Text>
            <Text style={styles.summaryLabel}>Faulty</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: theme.status.warning + "10" },
            ]}
          >
            <Ionicons
              name="cloud-offline-outline"
              size={16}
              color={theme.status.warning}
            />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryCount}>{offlineLights}</Text>
            <Text style={styles.summaryLabel}>Offline</Text>
          </View>
        </View>
      </>
    );

    if (compact) {
      return (
        <View style={styles.summaryCompactPanel}>
          <View style={styles.summaryGradientBase} />
          <View style={styles.summaryGradientGlowTop} />
          <View style={styles.summaryGradientGlowBottom} />
          <View style={styles.summaryCompactGrid}>{cards}</View>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryRow}
        style={styles.summaryScroll}
      >
        {cards}
      </ScrollView>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.topHeaderRow}>
        <View style={styles.titleSection}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.liveIndicatorModern}>
            <View style={styles.liveDotModern} />
            <Text style={styles.liveTextModern}>Live Updates</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setProfileMenuVisible(true)}
          style={styles.profileButton}
        >
          <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={14} color={theme.background} />
          </View>
          <Text style={styles.profileButtonText}>Account</Text>
          <Ionicons
            name="chevron-down-outline"
            size={12}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.firstRow}>
        <View style={styles.mapContainer}>
          <RectangularMap />
        </View>
        <View style={styles.notificationsContainer}>
          <NotificationsCard />
          <SummaryStats compact />
        </View>
      </View>

      {!isDesktop && <SummaryStats />}

      <View style={styles.filtersSection}>
        {isDesktop ? (
          <View style={styles.desktopFilterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.desktopFilterScroll}
            >
              {filterOptions.map((opt) => (
                <FilterButton
                  key={opt.key}
                  label={opt.label}
                  filterKey={opt.key}
                  iconName={opt.icon}
                  count={opt.count}
                />
              ))}
            </ScrollView>
            <View style={styles.searchContainerDesktop}>
              <Ionicons
                name="search-outline"
                size={18}
                color={theme.textSecondary}
              />
              <TextInput
                style={styles.searchInputDesktop}
                placeholder="Search by light ID or location"
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
              {searchQuery !== "" && (
                <TouchableOpacity
                  onPress={() => handleSearchChange("")}
                  style={styles.clearSearchBtn}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.filterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
              >
                {filterOptions.map((opt) => (
                  <FilterButton
                    key={opt.key}
                    label={opt.label}
                    filterKey={opt.key}
                    iconName={opt.icon}
                    count={opt.count}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={14}
                color={theme.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by light ID or location"
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => handleSearchChange("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {(filter !== "All" || searchQuery !== "") && (
          <TouchableOpacity
            style={styles.clearFiltersRow}
            onPress={clearAllFilters}
          >
            <Ionicons name="refresh-outline" size={14} color={theme.primary} />
            <Text style={styles.clearFiltersText}>Clear all filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {isDesktop && filteredData.length > 0 && <TableHeader />}
    </View>
  );

  const renderItem = useCallback(
    ({ item }) => (
      <LightCard item={item} onPress={onLightPress} isDesktop={isDesktop} />
    ),
    [onLightPress, isDesktop],
  );

  const keyExtractor = useCallback((item) => item.id, []);

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
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={theme.status.error}
        />
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLights}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        key="lights-list"
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            onClear={clearAllFilters}
            hasActiveFilters={filter !== "All" || searchQuery !== ""}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          isDesktop && styles.listContainerDesktop,
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
        initialNumToRender={15}
        windowSize={10}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />

      <FAB onPress={() => setAddLightModalVisible(true)} />

      <AddLightModal
        visible={addLightModalVisible}
        onClose={() => setAddLightModalVisible(false)}
        onAddLight={handleAddLight}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.status.success}
            />
            <Text style={{ fontSize: 10, fontWeight: "700", color: theme.text, marginBottom: 8 }}>Success!</Text>
            <Text style={{ fontSize: 8, color: theme.textSecondary, textAlign: "center", marginBottom: 20 }}>
              Light {addedLightName} has been added successfully.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContainer}>
            <View style={styles.logoutGradientBase} />
            <View style={styles.logoutGradientTop} />
            <View style={styles.logoutGradientBottom} />
            <Ionicons
              name="log-out-outline"
              size={30}
              color={theme.status.error}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutTitle}>Confirm Logout</Text>
            <Text style={styles.logoutMessage}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonNo, styles.logoutBtn]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonYes, styles.logoutBtn]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  onLogout();
                }}
              >
                <Text style={styles.modalButtonTextYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={profileMenuVisible}
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <Pressable
          style={styles.profileMenuOverlay}
          onPress={() => setProfileMenuVisible(false)}
        >
          <View style={styles.profileMenuCard}>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                Alert.alert("Profile", "Profile details will be available soon.");
              }}
            >
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={theme.primary}
              />
              <Text style={styles.profileMenuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                Alert.alert("Settings", "Settings will be available soon.");
              }}
            >
              <Ionicons name="settings-outline" size={16} color={theme.primary} />
              <Text style={styles.profileMenuText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.profileMenuDivider} />
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileMenuVisible(false);
                setLogoutModalVisible(true);
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={16}
                color={theme.status.error}
              />
              <Text style={styles.profileMenuLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: theme.background },
  
  rightPanelCard: {
    position: "relative",
    backgroundColor: "#FFF",
    borderRadius: 4,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
    height: 200,
  },
  notificationScrollView: {
    flex: 1,
  },
  notificationList: {
    gap: 10,
    paddingBottom: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border + "40",
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  notificationIcon: {
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 9,
    color: theme.textSecondary,
    fontWeight: "500",
    lineHeight: 12,
  },
  notificationTime: {
    fontSize: 8,
    color: theme.textMuted,
    marginTop: 2,
  },
  notificationBadge: {
    backgroundColor: theme.status.error,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notificationBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFF",
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyNotificationsText: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 10,
    fontWeight: "500",
  },
  emptyNotificationsSubtext: {
    fontSize: 8,
    color: theme.textMuted,
    marginTop: 4,
  },
  tableHeader: {
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.primaryDark,
    overflow: "hidden",
  },
  tableHeaderGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.primary,
  },
  tableHeaderGradientTop: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 180,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  tableHeaderGradientBottom: {
    position: "absolute",
    left: -30,
    bottom: -35,
    width: 200,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(5,150,105,0.32)",
  },
  tableHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ECFDF5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  idCell: { width: 50, minWidth: 70 },
  statusCell: { width: 95, minWidth: 95 },
  locationCell: { width: 150, minWidth: 150 },
  metricsCell: { width: 120, minWidth: 120 },
  priorityCell: { width: 85, minWidth: 85 },
  descriptionCell: { flex: 2, minWidth: 150 },
  updateCell: { width: 90, minWidth: 90 },
  actionCell: { width: 30, alignItems: "flex-end" },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  titleSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  dashboardTitle: { fontSize: 16, fontWeight: "700", color: theme.text },
  liveIndicatorModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primary + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  liveDotModern: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.primary,
  },
  liveTextModern: { fontSize: 9, fontWeight: "600", color: theme.primary },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  profileAvatar: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.text,
  },
  firstRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  mapContainer: { flex: 6 },
  notificationsContainer: { width: 250, height: 340, gap: 8 },
  mapCard: {
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  mapImageBackground: {
    width: "100%",
    height: 380,
  },
  mapImageStyle: {
    borderRadius: 4,
  },
  mapBackground: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  mapScrollView: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
    minHeight: 380,
  },
  mapPattern: { 
    position: "relative", 
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapPin: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },
  pinLabel: { 
    flexDirection: "column", 
    alignItems: "center", 
    marginTop: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pinText: { 
    fontSize: 10, 
    fontWeight: "600", 
    color: "#FFFFFF",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  mapContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  mapTitle: { 
    fontSize: 11, 
    fontWeight: "600", 
    color: "#FFF", 
    flex: 1 
  },
  mapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  liveDotMap: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  mapBadgeText: { 
    fontSize: 9, 
    fontWeight: "600", 
    color: "#FFF" 
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: "600", color: theme.text },
  divider: { height: 1, backgroundColor: theme.border, marginBottom: 12 },
  summaryScroll: { marginBottom: 20 },
  summaryRow: { paddingHorizontal: 16, gap: 8 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    minWidth: 96,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryInfo: { flex: 1 },
  summaryCount: { fontSize: 16, fontWeight: "800", color: theme.text },
  summaryLabel: { fontSize: 9, color: theme.textSecondary, marginTop: 2 },
  summaryCompactPanel: {
    position: "relative",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BFE8D8",
    overflow: "hidden",
    padding: 8,
  },
  summaryGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ECFDF5",
  },
  summaryGradientGlowTop: {
    position: "absolute",
    top: -26,
    right: -20,
    width: 130,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16,185,129,0.14)",
  },
  summaryGradientGlowBottom: {
    position: "absolute",
    left: -14,
    bottom: -18,
    width: 120,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(52,211,153,0.12)",
  },
  summaryCompactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryCardCompact: {
    width: "48%",
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  filtersSection: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 2 },
  filterContainer: { marginBottom: 12 },
  filterScrollContent: { gap: 8 },
  desktopFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  desktopFilterScroll: { flexDirection: "row", gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilterChip: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    fontSize: 9,
    fontWeight: "600",
    color: theme.textSecondary,
    marginRight: 6,
  },
  activeFilterChipText: { color: theme.background, fontWeight: "700" },
  filterIcon: { marginRight: 6 },
  badge: {
    backgroundColor: theme.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    marginLeft: 4,
  },
  activeBadge: { backgroundColor: "rgba(255,255,255,0.3)" },
  badgeText: { fontSize: 10, fontWeight: "700", color: theme.text },
  activeBadgeText: { color: theme.background },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 10,
    color: theme.text,
    marginLeft: 10,
  },
  searchContainerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 250,
    position: 'absolute',
    right: 185,
  },
  searchInputDesktop: {
    flex: 1,
    fontSize: 9,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: theme.text,
  },
  clearSearchBtn: { padding: 4 },
  clearFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    marginBottom: 4,
  },
  clearFiltersText: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.primary,
    marginLeft: 6,
  },
  listContainer: { 
    paddingBottom: 80, 
    backgroundColor: theme.background 
  },
  listContainerDesktop: { 
    paddingBottom: 20, 
    paddingHorizontal: 16 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 220,
    minWidth: 220,
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logoutModalContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 280,
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  logoutGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  logoutGradientTop: {
    position: "absolute",
    top: -24,
    right: -28,
    width: 140,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(16,185,129,0.10)",
  },
  logoutGradientBottom: {
    position: "absolute",
    left: -24,
    bottom: -22,
    width: 140,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  logoutIcon: {
    marginBottom: 6,
  },
  logoutTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 4,
  },
  logoutMessage: {
    fontSize: 9,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  logoutBtn: {
    minWidth: 100,
    paddingVertical: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  modalButtonNo: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalButtonYes: { backgroundColor: theme.status.error },
  modalButtonTextNo: { color: theme.text, fontWeight: "600", fontSize: 10 },
  modalButtonTextYes: {
    color: theme.background,
    fontWeight: "600",
    fontSize: 10,
  },
  profileMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "flex-end",
    paddingTop: 62,
    paddingRight: 16,
  },
  profileMenuCard: {
    width: 170,
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  profileMenuText: {
    fontSize: 10,
    color: theme.text,
    fontWeight: "500",
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 4,
  },
  profileMenuLogoutText: {
    fontSize: 10,
    color: theme.status.error,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  loadingText: { marginTop: 12, fontSize: 10, color: theme.textSecondary },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: theme.text,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  retryButtonText: { color: theme.background, fontWeight: "600" },
});

export default DashboardScreen;