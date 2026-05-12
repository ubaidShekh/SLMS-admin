// components/EditLightModal.js
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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

const { width } = Dimensions.get("window");

const EditLightModal = ({ visible, light, onClose}) => {
  const [formData, setFormData] = useState({
    lightId: "",
    location: "",
    voltage: "",
    current: "",
    status: "",
    priority: "",
    description: "",
  });
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (light) {
      setFormData({
        lightId: light.id || "",
        location: light.location || "",
        voltage: light.voltage?.toString() || "",
        current: light.current?.toString() || "",
        status: light.status || "Working",
        priority: light.priority || "Medium",
        description: light.description || "",
      });
    }
  }, [light]);

  if (!light) return null;

  const statusOptions = ["Working", "Fault", "Offline", "In Progress"];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];
  const url = "https://attendanceapp-rcqk.onrender.com/iot/save-light";

  const handleSave = async () => {
    const updatedLight = {
      id: formData.lightId,
      location: formData.location,
      voltage: formData.voltage,
      current: formData.current,
      status: formData.status,
      priority: formData.priority,
      description: formData.description,
    };
    
    setLoading(true);
    try {
      const update = await axios.post(url, updatedLight);
      if (update.status === 200) {
        setLoading(false);
        setSuccessModalVisible(true);
        // Close edit modal after 1.5 seconds
        setTimeout(() => {
          setSuccessModalVisible(false);
          onClose();
       
        }, 1500);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      Alert.alert("Error", "Failed to update light. Please try again.");
      onClose();
    }
  };

  return (
    <>
      <Modal
        transparent
        visible={visible}
        onRequestClose={onClose}
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={[styles.modalContainer, { width: Math.min(width - 40, 500) }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dragHandleRow}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.modalHeader}>
                <View style={styles.headerIcon}>
                  <Ionicons name="create-outline" size={20} color={theme.primary} />
                </View>
                <Text style={styles.modalTitle}>Edit Light Details</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Light ID</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lightId}
                    onChangeText={(text) => setFormData({ ...formData, lightId: text })}
                    placeholder="Enter light ID"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Enter location"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                <View style={styles.rowInput}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Voltage (V)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.voltage}
                      onChangeText={(text) => setFormData({ ...formData, voltage: text })}
                      placeholder="Voltage"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Current (A)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.current}
                      onChangeText={(text) => setFormData({ ...formData, current: text })}
                      placeholder="Current"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.rowInput}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Status</Text>
                    <View style={styles.optionsContainer}>
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionChip,
                            formData.status === option && styles.activeOptionChip,
                          ]}
                          onPress={() => setFormData({ ...formData, status: option })}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              formData.status === option && styles.activeOptionText,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.rowInput}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <View style={styles.optionsContainer}>
                      {priorityOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionChip,
                            formData.priority === option && styles.activeOptionChipPriority,
                          ]}
                          onPress={() => setFormData({ ...formData, priority: option })}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              formData.priority === option && styles.activeOptionText,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Enter description"
                    placeholderTextColor={theme.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#FFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <Ionicons name="checkmark-circle" size={48} color={theme.status.success} />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Light "{formData.lightId}" has been updated successfully.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: "90%",
  },
  dragHandleRow: {
    alignItems: "center",
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: theme.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 10,
    color: theme.text,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  rowInput: {
    flexDirection: "row",
    gap: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceHighlight,
  },
  activeOptionChip: {
    backgroundColor: theme.status.success,
    borderColor: theme.status.success,
  },
  activeOptionChipPriority: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  optionText: {
    fontSize: 9,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  activeOptionText: {
    color: "#FFF",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    borderRadius: 4,
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContainer: {
    width: "80%",
    maxWidth: 280,
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    marginTop: 12,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default EditLightModal;