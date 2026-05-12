// components/DeleteConfirmationModal.js
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const theme = {
  primary: "#10B981",
  status: {
    error: "#EF4444",
    success: "#10B981",
  },
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceHighlight: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

const { width } = Dimensions.get("window");

const DeleteConfirmationModal = ({ visible, light, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  if (!light) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      // ✅ CORRECTED URL - Single /iot
      const url = "https://attendanceapp-rcqk.onrender.com/iot/delete-light";
      
      const deleteData = await axios.post(url, {
        id: light.id
      });
      
      if (deleteData.status === 200 && deleteData.data.success) {
        setLoading(false);
        setSuccessModalVisible(true);
        
        // Close modals after 1.5 seconds
        setTimeout(() => {
          setSuccessModalVisible(false);
          onClose();
          if (onConfirm) {
            onConfirm(light);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setLoading(false);
      Alert.alert(
        "Error", 
        err.response?.data?.message || "Failed to delete light. Please try again."
      );
    }
  };

  return (
    <>
      <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={[styles.modalContainer, { width: Math.min(width - 40, 400) }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-triangle" size={48} color={theme.status.error} />
            </View>
            
            <Text style={styles.title}>Delete Light</Text>
            <Text style={styles.message}>
              Are you sure you want to delete light <Text style={styles.lightId}>{light.id}</Text>?
            </Text>
            <Text style={styles.subMessage}>This action cannot be undone.</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.deleteButton, loading && styles.disabledButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#FFF" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
            <Text style={styles.successTitle}>Deleted!</Text>
            <Text style={styles.successMessage}>
              Light "{light.id}" has been deleted successfully.
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
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  lightId: {
    fontWeight: "700",
    color: theme.status.error,
  },
  subMessage: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  deleteButton: {
    backgroundColor: theme.status.error,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.textSecondary,
  },
  deleteButtonText: {
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

export default DeleteConfirmationModal;