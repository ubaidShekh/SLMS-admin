// App.js
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import { generateDummyData } from "../../app/utils/helpers";
import CustomTabBar from "../../components/CustomTabBar";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import EditLightModal from "../../components/EditLightModal";
import LightDetailModal from "../../components/LightDetailModal";
import DashboardScreen from "../screens/DashboardScreen";
import LightsScreen from "../screens/LightsScreen";
import LoginScreen from "../screens/LoginScreen";
import NotificationsScreen from "../screens/notification";
import SignupScreen from "../screens/SignupScreen";
import SupervisorScreen from "../screens/supervisor";
import TaskScreen from "../screens/task";
import { getItem, removeItem, setItem } from "../utils/storage";

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

  // Status colors (matching AddLightModal style)
  status: {
    success: "#10B981", // Green for working/success
    warning: "#F59E0B", // Amber for warnings
    error: "#EF4444", // Red for errors/faulty
    info: "#3B82F6", // Blue for info
    neutral: "#6B7280", // Gray for neutral
  },
};

const AuthNavigator = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);
  if (showLogin)
    return (
      <LoginScreen
        onLogin={onLogin}
        onSwitchToSignup={() => setShowLogin(false)}
      />
    );
  else
    return (
      <SignupScreen
        onSignup={onLogin}
        onSwitchToLogin={() => setShowLogin(true)}
      />
    );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightData, setLightData] = useState(generateDummyData());
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [editModalVisible, setEditModalVisible] = useState(false);
const [deleteModalVisible, setDeleteModalVisible] = useState(false);



  useEffect(() => {
    const checkLogin = async () => {
      const token = await getItem("userToken");
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkLogin();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLightData(generateDummyData());
      setRefreshing(false);
    }, 1000);
  };

  const clearAllFilters = () => {
    setFilter("All");
    setSearchQuery("");
  };

  const openLightModal = (light) => {
    setSelectedLight(light);
    setModalVisible(true);
  };

  const handleAssignWork = (light, repairman) => {
    Alert.alert(
      "Work Assigned",
      `Assigned to ${repairman.name} for light ${light.id}`,
      [{ text: "OK" }],
    );
    setModalVisible(false);
  };

  const handleLogin = async () => {
    await setItem("userToken", "dummy-token");
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await removeItem("userToken");
    setIsLoggedIn(false);
  };

  const handleEditLight = (light) => {
  setSelectedLight(light);
  setEditModalVisible(true);
};

const handleDeleteLight = async(light) => {
  setSelectedLight(light);

  setDeleteModalVisible(true);

};

const handleSaveEdit = async (updatedLight) => {
  // Your API call to update light
  console.log("Save edited light:", updatedLight);
  // After successful update, refresh the lights list
  await fetchLights(true);
};

const handleConfirmDelete = async (lightToDelete) => {
  const url = "https://5qbfjszb-3000.inc1.devtunnels.ms/iot/iot/delete-light";
  try{
const deleteData = await axios.post(url, {
  id: lightToDelete.id
});
if(deleteData.status === 200){
  Alert.alert("Success", `Light ${lightToDelete.id} deleted successfully.`);
  setDeleteModalVisible(false);
}
  }
  catch(err){
    setDeleteModalVisible(false);
    Alert.alert("Error", "Failed to delete light. Please try again.");
  }
  // Your API call to delete light
  console.log("Delete light:", lightToDelete);
  // After successful deletion, refresh the lights list
 
};

  if (loading) return <View style={styles.loadingContainer} />;
  if (!isLoggedIn) return <AuthNavigator onLogin={handleLogin} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <CustomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      <View
        style={[styles.mainContent, isDesktop && styles.mainContentWithSidebar]}
      >
        {activeTab === "dashboard" ? (
          <DashboardScreen
            lightData={lightData}
            refreshing={refreshing}
            onRefresh={onRefresh}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onClearFilters={clearAllFilters}
            onLightPress={openLightModal}
            onLogout={handleLogout}
          />
        ) :activeTab === "lights" ? (
          <LightsScreen
            lightData={lightData}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onLightPress={openLightModal}
          />
        ) :activeTab === "tasks" ? (
          <TaskScreen />
        ) :activeTab === "supervisor" ? (
          <SupervisorScreen />
        ) : (
        <NotificationsScreen  />
        )}
      </View>
      <LightDetailModal
        visible={modalVisible}
        light={selectedLight}
        onClose={() => setModalVisible(false)}
        onAssign={handleAssignWork}
        onHide={() => setModalVisible(false)}
        onEdit={handleEditLight}
  onDelete={handleDeleteLight}
      />
      <EditLightModal
  visible={editModalVisible}
  light={selectedLight}
  onClose={() => setEditModalVisible(false)}
  //onSave={handleSaveEdit}
/>

<DeleteConfirmationModal
  visible={deleteModalVisible}
  light={selectedLight}
  onClose={() => setDeleteModalVisible(false)}
  
/>
   
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  mainContent: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  mainContentWithSidebar: {
    marginLeft: 250,
  },
});
