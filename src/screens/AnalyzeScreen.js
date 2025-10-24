import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import BASE from "../config/apiBase";
import {
  ensureMediaLibraryPermission,
  MEDIA_TYPE_IMAGES,
} from "../utils/imagePickerHelpers";

export default function AnalyzeScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  const [layout, setLayout] = useState("open");
  const [style, setStyle] = useState("minimalist");
  const [palette, setPalette] = useState("warm neutral");

  const pickImage = async () => {
    const { granted } = await ensureMediaLibraryPermission();
    if (!granted) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MEDIA_TYPE_IMAGES,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
        setAnalysis(null);
        setSuggestions(null);
      }
    } catch (error) {
      console.warn("ImagePicker library error", error);
      Alert.alert("Photo picker error", error?.message ?? "Unable to open your photo library.");
    }
  };

  const analyzePhoto = async () => {
    if (!image) {
      Alert.alert("No image", "Pick a room photo first.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("image", {
        uri: image,
        name: "room.jpg",
        type: "image/jpeg",
      });

      const res = await fetch(`${BASE}/api/analyze`, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analyze failed");
      }

      setAnalysis(json);
    } catch (error) {
      Alert.alert("Analyze error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!analysis?.objects) {
      Alert.alert("Analyze first", "Run analyze to detect furniture and colors.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        objects: analysis.objects,
        colors: analysis.colors,
        preferences: { layout, style, palette },
      };
      const res = await fetch(`${BASE}/api/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Suggest failed");
      }

      setSuggestions(json.suggestions);
    } catch (error) {
      Alert.alert("Suggest error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderColor = ({ item }) => (
    <View style={{ alignItems: "center", marginRight: 12 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: item,
          borderWidth: 1,
          borderColor: "#ccc",
        }}
      />
      <Text style={{ fontSize: 12, color: "#333", marginTop: 4 }}>{item}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>AestheticAI — Analyze Room</Text>

      <TouchableOpacity
        onPress={pickImage}
        style={{ backgroundColor: "#111827", padding: 12, borderRadius: 12, marginBottom: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Pick a Room Photo</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            aspectRatio: 1.4,
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: "#f3f4f6",
          }}
          resizeMode="cover"
        />
      )}

      <View
        style={{
          backgroundColor: "#f9fafb",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Preferences</Text>
        <TextInput
          placeholder="Layout (e.g., open, L-shaped)"
          value={layout}
          onChangeText={setLayout}
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 10,
            marginBottom: 8,
          }}
        />
        <TextInput
          placeholder="Style (e.g., minimalist, scandinavian)"
          value={style}
          onChangeText={setStyle}
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 10,
            marginBottom: 8,
          }}
        />
        <TextInput
          placeholder="Palette (e.g., warm neutral, cool, monochrome)"
          value={palette}
          onChangeText={setPalette}
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 10,
          }}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={analyzePhoto}
          style={{ flex: 1, backgroundColor: "#2563eb", padding: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
            {loading ? "Analyzing..." : "Analyze"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={getSuggestions}
          disabled={!analysis || loading}
          style={{ flex: 1, backgroundColor: analysis ? "#059669" : "#6b7280", padding: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
            {loading ? "Thinking..." : "Suggest"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#111827" style={{ marginVertical: 8 }} />}

      {analysis && (
        <View
          style={{
            backgroundColor: "#f9fafb",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>Detected Furniture</Text>
          {analysis.objects?.length ? (
            analysis.objects.map((o, idx) => (
              <Text key={idx} style={{ color: "#111827" }}>
                • {o.name} ({Math.round(o.confidence * 100)}%)
              </Text>
            ))
          ) : (
            <Text style={{ color: "#6b7280" }}>No items detected.</Text>
          )}

          <Text style={{ fontSize: 16, fontWeight: "700", marginVertical: 8 }}>Dominant Colors</Text>
          <FlatList
            horizontal
            data={analysis.colors || []}
            renderItem={renderColor}
            keyExtractor={(c, i) => `${c}-${i}`}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {suggestions && (
        <View
          style={{ backgroundColor: "#eef2ff", borderColor: "#c7d2fe", borderWidth: 1, borderRadius: 12, padding: 12 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>AI Suggestions</Text>
          <Text style={{ color: "#111827", lineHeight: 20 }}>{suggestions}</Text>
        </View>
      )}
    </ScrollView>
  );
}
