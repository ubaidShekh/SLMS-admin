// components/LightDetailModal.js (Updated with Edit and Delete buttons)
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getNearestRepairman } from "../app/utils/helpers";

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

const LightDetailModal = ({ visible, light, onClose, onAssign, onHide, onEdit, onDelete }) => {
  const [nearestRepairman, setNearestRepairman] = useState(null);

  useEffect(() => {
    if (light && light.status !== "Working")
      setNearestRepairman(getNearestRepairman(light.id));
    else setNearestRepairman(null);
  }, [light]);

  if (!light) return null;

  const isWorking = light.status === "Working";
  const statusConfig = {
    Working: {
      color: theme.status.success,
      bg: theme.status.success + "10",
      border: theme.status.success,
      icon: "checkmark-circle",
    },
    Offline: {
      color: theme.status.warning,
      bg: theme.status.warning + "10",
      border: theme.status.warning,
      icon: "cloud-offline",
    },
    Fault: {
      color: theme.status.error,
      bg: theme.status.error + "10",
      border: theme.status.error,
      icon: "alert-circle",
    },
    "Power Failure": {
      color: theme.status.error,
      bg: theme.status.error + "10",
      border: theme.status.error,
      icon: "flash-off",
    },
  };
  const status = statusConfig[light.status] || statusConfig.Offline;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <Pressable style={styles.modalOverlay} onPress={onHide}>
        <Pressable
          style={[styles.modalContainer, { width: Math.min(width - 40, 500) }]}
        >
          <View style={styles.dragHandleRow}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons
                name={isWorking ? "information-circle" : "alert-triangle"}
                size={20}
                color={isWorking ? theme.primary : status.color}
              />
            </View>
            <Text style={styles.modalTitle}>
              {isWorking ? "Light Details" : "Faulty Light Report"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="bulb-outline" size={16} color={theme.primary} />
              </View>
              <Text style={styles.detailLabel}>Light ID</Text>
              <Text style={styles.detailValue}>{light.id}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={16} color={theme.primary} />
              </View>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{light.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="flash-outline" size={16} color={theme.primary} />
              </View>
              <Text style={styles.detailLabel}>Voltage</Text>
              <Text style={styles.detailValue}>{light.voltage || "—"} V</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="battery-charging-outline" size={16} color={theme.primary} />
              </View>
              <Text style={styles.detailLabel}>Current</Text>
              <Text style={styles.detailValue}>{light.current || "—"} A</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={16} color={theme.primary} />
              </View>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>{light.lastUpdated || "Just now"}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="alert-circle-outline" size={16} color={status.color} />
              </View>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: status.bg, borderColor: status.border },
                ]}
              >
                <Ionicons name={status.icon} size={10} color={status.color} />
                <Text style={[styles.statusPillText, { color: status.color }]}>
                  {light.status}
                </Text>
              </View>
            </View>

            {light.priority && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="flag-outline" size={16} color={theme.primary} />
                </View>
                <Text style={styles.detailLabel}>Priority</Text>
                <Text style={styles.detailValue}>{light.priority}</Text>
              </View>
            )}

            {light.description && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text-outline" size={16} color={theme.primary} />
                </View>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{light.description}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons - Edit and Delete */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                onClose();
                if (onEdit) onEdit(light);
              }}
            >
              <Ionicons name="create-outline" size={18} color={theme.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                onClose();
                if (onDelete) onDelete(light);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.status.error} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
    </Pressable>

      </Modal>
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
  detailCard: {
    backgroundColor: theme.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: theme.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.text,
    flex: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    gap: 5,
    alignSelf: "flex-start",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: theme.primary + "10",
    borderColor: theme.primary,
  },
  deleteButton: {
    backgroundColor: theme.status.error + "10",
    borderColor: theme.status.error,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.status.error,
  },
});

export default LightDetailModal;