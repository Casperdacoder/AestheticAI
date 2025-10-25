// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Screen, Input, Button, colors } from "../components/UI";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { cacheUserRole } from "../services/userCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

const PROFILE_KEY_PREFIX = "aestheticai:user-profile:";

export default function LoginScreen({ route, navigation }) {
  const initialRole = route?.params?.role || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadProfile = async (uid) => {
    try {
      const json = await AsyncStorage.getItem(`${PROFILE_KEY_PREFIX}${uid}`);
      return json ? JSON.parse(json) : null;
    } catch (err) {
      console.log("Error loading cached profile:", err);
      return null;
    }
  };

  const saveProfile = async (uid, profile) => {
    try {
      await AsyncStorage.setItem(
        `${PROFILE_KEY_PREFIX}${uid}`,
        JSON.stringify(profile)
      );
    } catch (err) {
      console.log("Error saving profile:", err);
    }
  };

  const fetchProfileFromFirestore = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() };
      } else {
        console.log("No profile found for UID:", uid);
        return null;
      }
    } catch (err) {
      console.log("Error fetching profile:", err);
      return null;
    }
  };

  const login = async () => {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = credential.user.uid;

      // Load profile from cache first
      let profile = await loadProfile(uid);
      if (!profile) {
        profile = await fetchProfileFromFirestore(uid);
        if (profile) await saveProfile(uid, profile);
      }

      if (!profile) {
        Alert.alert(
          "Login Error",
          "Profile not found. Please register first."
        );
        return;
      }

      // Ensure correct role
      if (profile.role !== initialRole) {
        Alert.alert(
          "Access Denied",
          `This account is registered as a ${profile.role}. Please use the correct login page.`
        );
        return;
      }

      // Pending consultant verification
      if (profile.role === "consultant" && profile.status !== "verified") {
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
      await cacheUserRole(uid, profile.role);

      // Navigate to correct tab navigator per role
      const dashboardRoute =
        profile.role === "consultant"
          ? "DesignerTabs" // Consultant tab navigator
          : profile.role === "admin"
          ? "AdminTabs"    // Admin tab navigator
          : "UserTabs";    // Regular user tab navigator

      navigation.reset({
        index: 0,
        routes: [{ name: dashboardRoute }],
      });
    } catch (error) {
      Alert.alert("Login Error", error.message);
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

        <Button title="Login" onPress={login} />

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
  content: { flex: 1, padding: 10 },
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
});
