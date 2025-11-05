// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { Screen, Input, Button, colors } from "../components/UI";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { cacheUserRole, getCachedUserRole } from "../services/userCache";
import { loadProfile, saveProfile, fetchProfileFromFirestore, cacheProfileLocally } from "../services/profileStore";

export default function LoginScreen({ route, navigation }) {
  const initialRole = route?.params?.role || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sanitizeEmail = (value) => value?.replace(/\s+/g, "") ?? "";

  const login = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const normalizedEmail = sanitizeEmail(email);
      setEmail(normalizedEmail);

      const credential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const uid = credential.user.uid;
      const userEmail = credential.user.email || normalizedEmail;
      const fallbackName =
        credential.user.displayName ||
        (userEmail ? userEmail.split('@')[0] : 'User');

      const [cachedProfile, cachedRole] = await Promise.all([
        loadProfile(uid),
        getCachedUserRole(uid)
      ]);

      // Load profile from cache first
      let profile = cachedProfile;
      let fetchError = null;
      if (!profile) {
        const fetchResult = await fetchProfileFromFirestore(uid, initialRole);
        const { profile: fetchedProfile, error } = fetchResult;
        fetchError = error;
        profile = fetchedProfile;

        if (!profile && fetchError?.code === "unavailable" && cachedRole) {
          profile = {
            uid,
            role: cachedRole,
            email: userEmail,
            name: fallbackName,
            status: "offline",
            offline: true
          };
          await cacheProfileLocally(uid, profile);
          console.log("Proceeding with cached role due to offline state.");
        } else if (!profile && fetchError?.code === "unavailable") {
          profile = {
            uid,
            role: initialRole,
            email: userEmail,
            name: fallbackName,
            status: "offline",
            offline: true
          };
          await cacheProfileLocally(uid, profile);
          console.log("Proceeding with inferred role due to offline state.");
        }

        if (profile && !profile.offline) {
          try {
            await saveProfile(uid, profile);
          } catch (saveError) {
            console.warn("Failed to persist profile", saveError);
          }
        }
      }

      if (!profile) {
        Alert.alert(
          "Login Error",
          "Profile not found. Please register first."
        );
        return;
      }

      const resolvedRole = profile.role || cachedRole || initialRole;
      if (!resolvedRole) {
        Alert.alert(
          "Login Error",
          "We could not determine your account role. Please contact support."
        );
        return;
      }

      // Ensure correct role
      if (resolvedRole !== initialRole) {
        Alert.alert(
          "Access Denied",
          `This account is registered as a ${resolvedRole}. Please use the correct login page.`
        );
        return;
      }

      // Pending consultant verification
      if (resolvedRole === "consultant" && profile.status !== "verified") {
        Alert.alert(
          "Account Pending",
          "Your account is pending admin approval. You cannot access the dashboard yet.",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Landing" }],
                }),
            },
          ]
        );
        return;
      }

      // Cache role locally
      await cacheUserRole(uid, resolvedRole);

      // Navigate to correct tab navigator per role
      const dashboardRoute =
        resolvedRole === "consultant"
          ? "DesignerTabs" // Consultant tab navigator
          : resolvedRole === "admin"
          ? "AdminTabs"    // Admin tab navigator
          : "UserTabs";    // Regular user tab navigator

      navigation.reset({
        index: 0,
        routes: [{ name: dashboardRoute }],
      });
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue to your account
        </Text>

        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Forgot")}
          style={styles.linkWrapper}
        >
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isSubmitting ? "Signing in..." : "Login"}
          onPress={login}
          disabled={isSubmitting}
        />

        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            if (initialRole === "consultant") {
              navigation.navigate("RegisterCon");
            } else {
              navigation.navigate("Register", { role: initialRole });
            }
          }}
          style={styles.footerLink}
        >
          <Text style={styles.footer}>New here? Create an Account</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: "#0F3E48",
    fontSize: 15,
    marginTop: 80,
    marginBottom: 100,
    margin: 10,
  },
  content: { flex: 1, padding: 10, position: "relative" },
  title: {
    color: colors.subtleText,
    fontSize: 30,
    fontWeight: "900",
    fontFamily: "serif",
    marginBottom: 3,
    marginLeft: 10,
    marginRight: 10,
  },
  subtitle: {
    color: colors.subtleText,
    fontSize: 15,
    fontFamily: "serif",
    marginBottom: 32,
    opacity: 0.8,
    marginLeft: 10,
    marginRight: 10,
  },
  linkWrapper: { alignItems: "flex-start", marginStart: 25, marginBottom: 18 },
  link: { color: colors.subtleText, fontWeight: "800", fontFamily: "serif" },
  footerLink: { marginTop: 24 },
  footer: {
    textAlign: "center",
    color: colors.subtleText,
    fontWeight: "400",
    fontSize: 15,
    fontFamily: "serif",
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
