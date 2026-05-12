// components/AddLightModal.js
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const AddLightModal = ({ visible, onClose, onAddLight }) => {
  const [lightId, setLightId] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Offline");
  const [voltage, setVoltage] = useState("0");
  const [current, setCurrent] = useState("0");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  
  // New states for address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const addressDebounceTimer = useRef(null);

  // New states for supervisor autocomplete
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [showSupervisorSuggestions, setShowSupervisorSuggestions] = useState(false);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState("");
  const supervisorDebounceTimer = useRef(null);

  // Fetch supervisors from backend
  const fetchSupervisors = async () => {
    setIsLoadingSupervisors(true);
    try {
      const response = await fetch("https://attendanceapp-rcqk.onrender.com/iot/fetchAsupervisor");
      
      if (response.status === 404) {
        console.warn("Supervisor API endpoint not found (404)");
        // Fallback to demo data if API returns 404
     
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let supervisorsList = [];
      if (Array.isArray(data)) {
        supervisorsList = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        supervisorsList = data.data;
      } else if (data && typeof data === 'object') {
        // If single object is returned, convert to array
        supervisorsList = [data];
      }
      
      setSupervisors(supervisorsList);
      setFilteredSupervisors(supervisorsList);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      // Fallback to demo data on error
      const demoSupervisors = [
        { _id: "1", fullName: "Ubaid Shekh", email: "ubaidjmi2022@gmail.com" },
        { _id: "2", fullName: "John Doe", email: "john.doe@example.com" },
        { _id: "3", fullName: "Jane Smith", email: "jane.smith@example.com" },
      ];
      setSupervisors(demoSupervisors);
      setFilteredSupervisors(demoSupervisors);
    } finally {
      setIsLoadingSupervisors(false);
    }
  };

  // Filter supervisors based on search query
  const filterSupervisors = (query) => {
    if (!query.trim()) {
      setFilteredSupervisors(supervisors);
      setShowSupervisorSuggestions(true);
      return;
    }
    
    const filtered = supervisors.filter(sup => 
      sup.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      sup.email?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredSupervisors(filtered);
    setShowSupervisorSuggestions(true);
  };

  // Handle supervisor input change with debounce
  const handleSupervisorChange = (text) => {
    setSupervisorName(text);
    setSupervisorSearchQuery(text);
    
    // Clear previous timer
    if (supervisorDebounceTimer.current) {
      clearTimeout(supervisorDebounceTimer.current);
    }
    
    // Set new timer for filtering
    supervisorDebounceTimer.current = setTimeout(() => {
      filterSupervisors(text);
    }, 300);
  };

  // Handle supervisor input focus - show all supervisors
  const handleSupervisorFocus = () => {
    if (supervisors.length > 0) {
      setFilteredSupervisors(supervisors);
      setShowSupervisorSuggestions(true);
    }
  };

  // Handle supervisor selection
  const handleSelectSupervisor = (selectedSupervisor) => {
    setSupervisorName(selectedSupervisor.fullName);
    setSupervisorEmail(selectedSupervisor.email);
    setSupervisorId(selectedSupervisor._id);
    setSupervisorSearchQuery(selectedSupervisor.fullName);
    setShowSupervisorSuggestions(false);
    setFilteredSupervisors([]);
  };

  // Debounced address search function
  const searchAddress = async (query) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5&countrycodes=in`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const suggestions = data.map((item) => ({
          id: item.place_id,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle location input change with debounce
  const handleLocationChange = (text) => {
    setLocation(text);
    
    if (addressDebounceTimer.current) {
      clearTimeout(addressDebounceTimer.current);
    }
    
    addressDebounceTimer.current = setTimeout(() => {
      searchAddress(text);
    }, 500);
  };

  // Handle location focus
  const handleLocationFocus = () => {
    if (location.length >= 3) {
      searchAddress(location);
    }
  };

  // Handle address selection from suggestions
  const handleSelectAddress = (suggestion) => {
    setLocation(suggestion.display_name);
    setSelectedAddress(suggestion.display_name);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Load supervisors when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchSupervisors();
    }
  }, [visible]);

  // Clear suggestions when modal closes
  useEffect(() => {
    if (!visible) {
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
      setShowSupervisorSuggestions(false);
      setFilteredSupervisors([]);
      setSelectedAddress("");
      setSupervisorSearchQuery("");
      if (addressDebounceTimer.current) {
        clearTimeout(addressDebounceTimer.current);
      }
      if (supervisorDebounceTimer.current) {
        clearTimeout(supervisorDebounceTimer.current);
      }
    }
  }, [visible]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (addressDebounceTimer.current) {
        clearTimeout(addressDebounceTimer.current);
      }
      if (supervisorDebounceTimer.current) {
        clearTimeout(supervisorDebounceTimer.current);
      }
    };
  }, []);

  const resetForm = () => {
    setLightId("");
    setLocation("");
    setStatus("Working");
    setVoltage("");
    setCurrent("");
    setPriority("Medium");
    setDescription("");
    setSupervisorName("");
    setSupervisorEmail("");
    setSupervisorId("");
    setSupervisorSearchQuery("");
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setShowSupervisorSuggestions(false);
    setFilteredSupervisors([]);
    setSelectedAddress("");
  };

  const handleSubmit = () => {
    // Validation
    if (!lightId.trim()) {
      Alert.alert("Error", "Light ID is required");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Error", "Location is required");
      return;
    }
    if (!supervisorName.trim()) {
      Alert.alert("Error", "Please select a supervisor");
      return;
    }
    if (!supervisorEmail.trim()) {
      Alert.alert("Error", "Please select a valid supervisor");
      return;
    }
    if (status === "Working") {
      if (!voltage || isNaN(parseFloat(voltage))) {
        Alert.alert("Error", "Valid voltage is required for Working status");
        return;
      }
      if (!current || isNaN(parseFloat(current))) {
        Alert.alert("Error", "Valid current is required for Working status");
        return;
      }
    }

    const newLight = {
      lightId: lightId.trim(),
      location: location.trim(),
      status: status,
      voltage: status === "Working" ? parseFloat(voltage) : 0,
      current: status === "Working" ? parseFloat(current) : 0,
      priority: priority,
      description: description.trim() || `Light ${lightId} installed at ${location}`,
      assignedAt: new Date().toISOString(),
      supervisorName: supervisorName,
      supervisorEmail: supervisorEmail,
      supervisorId: supervisorId,
    };

    onAddLight(newLight);
    resetForm();
    onClose();
  };

  const statusOptions = ["Working", "Fault", "Offline"];
  const priorityOptions = ["High", "Medium", "Low"];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { width: width > 500 ? 450 : width - 40 },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Light</Text>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Ionicons name="close" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Light ID */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="bulb-outline"
                size={14}
                color="#10B981"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Light ID (e.g., L-1011)"
                placeholderTextColor="#9CA3AF"
                value={lightId}
                onChangeText={setLightId}
                autoCapitalize="characters"
              />
            </View>

            {/* Location with Autocomplete */}
            <View style={styles.autocompleteContainer}>
              <View style={styles.inputGroup}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#10B981"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location (e.g., Room 101, Hall A)"
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={handleLocationChange}
                  onFocus={handleLocationFocus}
                />
                {isLoadingAddress && (
                  <ActivityIndicator size="small" color="#10B981" />
                )}
              </View>
              
              {/* Address Suggestions Dropdown - Higher zIndex */}
              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <View style={styles.addressSuggestionsContainer}>
                  <FlatList
                    data={addressSuggestions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectAddress(item)}
                      >
                        <Ionicons
                          name="location"
                          size={12}
                          color="#10B981"
                          style={styles.suggestionIcon}
                        />
                        <Text style={styles.suggestionText} numberOfLines={2}>
                          {item.display_name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="always"
                  />
                </View>
              )}
            </View>

            {/* Supervisor with Autocomplete */}
            <View style={styles.supervisorContainer}>
              <View style={styles.inputGroup}>
                <Ionicons
                  name="person-circle-outline"
                  size={14}
                  color="#10B981"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Search & Assign Supervisor"
                  placeholderTextColor="#9CA3AF"
                  value={supervisorName}
                  onChangeText={handleSupervisorChange}
                  onFocus={handleSupervisorFocus}
                />
                {isLoadingSupervisors && (
                  <ActivityIndicator size="small" color="#10B981" />
                )}
              </View>
              
              {/* Selected Supervisor Email Display */}
              {supervisorEmail ? (
                <View style={styles.selectedInfo}>
                  <Ionicons name="mail-outline" size={10} color="#10B981" />
                  <Text style={styles.selectedEmail}>{supervisorEmail}</Text>
                </View>
              ) : null}
              
              {/* Supervisor Suggestions Dropdown */}
              {showSupervisorSuggestions && filteredSupervisors.length > 0 && (
                <View style={styles.supervisorSuggestionsContainer}>
                  <FlatList
                    data={filteredSupervisors}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSupervisor(item)}
                      >
                        <Ionicons
                          name="person"
                          size={12}
                          color="#10B981"
                          style={styles.suggestionIcon}
                        />
                        <View style={styles.suggestionContent}>
                          <Text style={styles.suggestionText}>
                            {item.fullName}
                          </Text>
                          <Text style={styles.suggestionSubtext}>
                            {item.email}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="always"
                  />
                </View>
              )}
            </View>

            {/* Priority Dropdown */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionsContainer}>
              {priorityOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionButton,
                    priority === opt && styles.optionButtonActive,
                  ]}
                  onPress={() => setPriority(opt)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      priority === opt && styles.optionButtonTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#10B981"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Ionicons name="add-circle-outline" size={14} color="#FFF" />
              <Text style={styles.submitButtonText}>Add Light</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 24,
    maxHeight: "85%",
    maxWidth: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 9,
    paddingVertical: 12,
    color: "#111827",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  optionButtonText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#4B5563",
  },
  optionButtonTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 2,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Styles for autocomplete
  autocompleteContainer: {
    position: "relative",
    zIndex: 2,
    marginBottom: 12,
  },
  supervisorContainer: {
    position: "relative",
    zIndex: 1,
    marginBottom: 12,
  },
  addressSuggestionsContainer: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    maxHeight: 200,
    zIndex: 3,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  supervisorSuggestionsContainer: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    maxHeight: 200,
    zIndex: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
  },
  suggestionSubtext: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 2,
  },
  suggestionContent: {
    flex: 1,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    marginTop: -8,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  selectedEmail: {
    fontSize: 8,
    color: "#10B981",
    fontWeight: "500",
  },
});

export default AddLightModal;