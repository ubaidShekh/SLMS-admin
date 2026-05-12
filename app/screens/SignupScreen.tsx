// screens/SignupScreen.js
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { setItem } from "../utils/storage";

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
    success: "#10B981", // Green for success
    warning: "#F59E0B", // Amber for warnings
    error: "#EF4444", // Red for errors
    info: "#3B82F6", // Blue for info
    neutral: "#6B7280", // Gray for neutral
  },
};

const SignupScreen = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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
      await setItem("userToken", "dummy-token");
      onSignup();
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.key === "Enter") handleSignup();
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={[styles.authCard, isDesktop && styles.authCardDesktop]}>
        <View style={styles.iconWrapper}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ height: 50, width: 70 }}
          />
        </View>
        <Text style={[styles.authTitle, isDesktop && styles.authTitleDesktop]}>
          Create Account
        </Text>
        <Text style={styles.authSubtitle}>Sign up to get started</Text>

        <View style={styles.inputGroup}>
          <Ionicons
            name="person-outline"
            size={16}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Full Name"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            onKeyPress={handleKeyPress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={16}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Email"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onKeyPress={handleKeyPress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onKeyPress={handleKeyPress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={theme.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.authInput}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onKeyPress={handleKeyPress}
          />
        </View>

        <TouchableOpacity
          style={[styles.authButton, isDesktop && styles.authButtonDesktop]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.authButtonText}>
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.authLink}>
            Already have an account?{" "}
            <Text style={styles.authLinkAccent}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: "#F3F7F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authCard: {
    backgroundColor: theme.surfaceHighlight,
    borderRadius: 4,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  authCardDesktop: { maxWidth: 340, padding: 24 },
  iconWrapper: { alignItems: "center", marginBottom: 20 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  authTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.text,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  authTitleDesktop: { fontSize: 14 },
  authSubtitle: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 6 },
  authInput: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 10,
    color: theme.text,
    outline: "none",
  },
  authButton: {
    backgroundColor: theme.primary,
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
    cursor: "pointer",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  authButtonDesktop: { paddingVertical: 10, marginTop: 16 },
  authButtonText: {
    color: theme.background,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  authLink: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 9,
    color: theme.textSecondary,
    cursor: "pointer",
  },
  authLinkAccent: { color: theme.primary, fontWeight: "500" },
});

export default SignupScreen;
