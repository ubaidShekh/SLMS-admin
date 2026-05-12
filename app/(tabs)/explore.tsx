import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- Dummy Data ----------
const generateAssignedTasks = () => [
  {
    id: "T-001",
    lightId: "L-1002",
    location: "Park Street, Near Metro",
    status: "Pending",
    priority: "High",
    assignedAt: "2024-03-15 10:30 AM",
    description: "Light completely off – electrical fault",
  },
  {
    id: "T-002",
    lightId: "L-1005",
    location: "Industrial Area, Phase 2",
    status: "In Progress",
    priority: "Medium",
    assignedAt: "2024-03-14 02:15 PM",
    description: "Power failure – check transformer",
  },
  {
    id: "T-003",
    lightId: "L-1009",
    location: "University Area, Gate 2",
    status: "Pending",
    priority: "High",
    assignedAt: "2024-03-16 09:00 AM",
    description: "Light flickering – replace ballast",
  },
  {
    id: "T-004",
    lightId: "L-1004",
    location: "Civil Lines, Block C",
    status: "Completed",
    priority: "Low",
    assignedAt: "2024-03-12 11:20 AM",
    description: "Offline – network issue resolved",
  },
  {
    id: "T-005",
    lightId: "L-1008",
    location: "Old City, Jamalpur",
    status: "Pending",
    priority: "Medium",
    assignedAt: "2024-03-16 01:45 PM",
    description: "Light not turning on at night",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "#F59E0B";
    case "In Progress":
      return "#3B82F6";
    case "Completed":
      return "#10B981";
    default:
      return "#9CA3AF";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "#EF4444";
    case "Medium":
      return "#F59E0B";
    case "Low":
      return "#10B981";
    default:
      return "#9CA3AF";
  }
};

// ---------- Task Card Component (with micro-interactions) ----------
const TaskCard = ({ task, onPress, onStatusUpdate }) => {
  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(task)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.taskCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskLightId}>{task.lightId}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {task.status}
            </Text>
          </View>
        </View>
        <View style={styles.taskLocation}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{task.location}</Text>
        </View>
        <View style={styles.taskFooter}>
          <View style={styles.priorityBadge}>
            <Ionicons name="flag-outline" size={12} color={priorityColor} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {task.priority}
            </Text>
          </View>
          {task.status !== "Completed" && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={(e) => {
                e.stopPropagation();
                onStatusUpdate(task);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.updateButtonText}>
                {task.status === "Pending" ? "Start" : "Complete"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ---------- Task Detail Modal (bottom sheet style) ----------
const TaskDetailModal = ({ visible, task, onClose, onStatusUpdate }) => {
  const { width } = Dimensions.get("window");
  if (!task) return null;

  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);

  const handleStatusUpdate = () => {
    onStatusUpdate(task);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { width }]}>
          {/* Drag handle */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#E5E7EB",
                borderRadius: 2,
              }}
            />
          </View>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="bulb-outline" size={22} color="#10B981" />
            <Text style={styles.detailLabel}>Light ID:</Text>
            <Text style={styles.detailValue}>{task.lightId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={22} color="#10B981" />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{task.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={statusColor}
            />
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: statusColor }]}>
              {task.status}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="flag-outline" size={22} color={priorityColor} />
            <Text style={styles.detailLabel}>Priority:</Text>
            <Text style={[styles.detailValue, { color: priorityColor }]}>
              {task.priority}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={22} color="#6B7280" />
            <Text style={styles.detailLabel}>Assigned:</Text>
            <Text style={styles.detailValue}>{task.assignedAt}</Text>
          </View>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>

          {task.status !== "Completed" && (
            <TouchableOpacity
              style={styles.modalUpdateButton}
              onPress={handleStatusUpdate}
            >
              <Text style={styles.modalUpdateButtonText}>
                {task.status === "Pending" ? "Start Work" : "Mark as Completed"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ---------- Tasks Screen ----------
const TasksScreen = ({
  tasks,
  refreshing,
  onRefresh,
  onTaskPress,
  onStatusUpdate,
}) => {
  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={onTaskPress}
            onStatusUpdate={onStatusUpdate}
          />
        )}
        contentContainerStyle={styles.tasksList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyTitle}>No tasks assigned</Text>
            <Text style={styles.emptyMessage}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
};

// ---------- Profile Screen (refreshed) ----------
const ProfileScreen = ({ repairmanName, onLogout }) => {
  const [stats, setStats] = useState({ total: 5, completed: 2, pending: 3 });
  // In a real app, fetch stats from API

  return (
    <View style={styles.screenContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#10B981" />
        </View>
        <Text style={styles.profileName}>{repairmanName}</Text>
        <Text style={styles.profileRole}>Field Repair Technician</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButtonProfile}
        onPress={onLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------- Custom Tab Bar (floating pill style) ----------
const CustomTabBar = ({ activeTab, onTabPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (tab) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
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

  return (
    <View style={styles.customTabBarContainer}>
      <Animated.View
        style={[styles.customTabBar, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "tasks" && { backgroundColor: "#E8F5E9" },
          ]}
          onPress={() => handlePress("tasks")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "tasks" ? "list" : "list-outline"}
            size={24}
            color={activeTab === "tasks" ? "#10B981" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "tasks" && styles.activeTabLabel,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "profile" && { backgroundColor: "#E8F5E9" },
          ]}
          onPress={() => handlePress("profile")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={24}
            color={activeTab === "profile" ? "#10B981" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "profile" && styles.activeTabLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ---------- Authentication Screens (modernized) ----------
const LoginScreen = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      if (password.length >= 4) {
        await AsyncStorage.setItem("repairmanToken", "dummy-token");
        await AsyncStorage.setItem(
          "repairmanName",
          email.split("@")[0] || "Repairman",
        );
        onLogin();
      } else {
        Alert.alert(
          "Login Failed",
          "Invalid credentials (password must be at least 4 characters)",
        );
      }
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Ionicons
          name="construct-outline"
          size={56}
          color="#10B981"
          style={styles.authIcon}
        />
        <Text style={styles.authTitle}>Repairman Portal</Text>
        <Text style={styles.authSubtitle}>Sign in to manage your tasks</Text>
        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity
          style={styles.authButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={styles.authLink}>
            New repairman? <Text style={{ color: "#10B981" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const SignupScreen = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await AsyncStorage.setItem("repairmanToken", "dummy-token");
      await AsyncStorage.setItem("repairmanName", name);
      onSignup();
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Ionicons
          name="construct-outline"
          size={56}
          color="#10B981"
          style={styles.authIcon}
        />
        <Text style={styles.authTitle}>Create Account</Text>
        <Text style={styles.authSubtitle}>Join as a repairman</Text>
        <View style={styles.inputGroup}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <TouchableOpacity
          style={styles.authButton}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.authLink}>
            Already have an account?{" "}
            <Text style={{ color: "#10B981" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ---------- Main App with Auth Flow ----------
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repairmanName, setRepairmanName] = useState("");
  const [tasks, setTasks] = useState(generateAssignedTasks());
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("repairmanToken");
      const name = await AsyncStorage.getItem("repairmanName");
      if (token && name) {
        setRepairmanName(name);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTasks(generateAssignedTasks());
      setRefreshing(false);
    }, 1000);
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleStatusUpdate = (task) => {
    let newStatus = "";
    if (task.status === "Pending") newStatus = "In Progress";
    else if (task.status === "In Progress") newStatus = "Completed";
    else return;

    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t,
    );
    setTasks(updatedTasks);
    Alert.alert("Success", `Task marked as ${newStatus}`);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("repairmanToken");
    await AsyncStorage.removeItem("repairmanName");
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="construct-outline" size={48} color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <AuthNavigator onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.appHeader}>
        <Ionicons name="construct-outline" size={24} color="#10B981" />
        <Text style={styles.appHeaderTitle}>Repairman Hub</Text>
      </View>

      {activeTab === "tasks" ? (
        <TasksScreen
          tasks={tasks}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onTaskPress={handleTaskPress}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <ProfileScreen repairmanName={repairmanName} onLogout={handleLogout} />
      )}

      <CustomTabBar activeTab={activeTab} onTabPress={setActiveTab} />

      <TaskDetailModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </SafeAreaView>
  );
}

const AuthNavigator = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return (
      <LoginScreen
        onLogin={onLogin}
        onSwitchToSignup={() => setShowLogin(false)}
      />
    );
  } else {
    return (
      <SignupScreen
        onSignup={onLogin}
        onSwitchToLogin={() => setShowLogin(true)}
      />
    );
  }
};

// ---------- Styles (modernized) ----------
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6B7280" },
  screenContainer: { flex: 1, backgroundColor: "#F9FAFB" },

  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  appHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 10,
  },

  // Task Card
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskLightId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 40,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  taskLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 40,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 40,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tasksList: {
    paddingBottom: 100,
  },

  // Profile Screen
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 15,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  logoutButtonProfile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 40,
    gap: 10,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Modal (Bottom Sheet)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    width: 80,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
  },
  descriptionBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  modalUpdateButton: {
    backgroundColor: "#10B981",
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalUpdateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Floating Tab Bar
  customTabBarContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "transparent",
  },
  customTabBar: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 40,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 4,
  },
  activeTabLabel: {
    color: "#10B981",
    fontWeight: "600",
  },

  // Authentication
  authContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  authIcon: { alignSelf: "center", marginBottom: 24 },
  authTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  authInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: "#111827",
  },
  authButton: {
    backgroundColor: "#10B981",
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  authLink: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#6B7280",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
