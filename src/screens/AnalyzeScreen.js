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
import { generateLayout } from "../services/api";
import {
  ensureMediaLibraryPermission,
  MEDIA_TYPE_IMAGES,
} from "../utils/imagePickerHelpers";

export default function AnalyzeScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [layoutResult, setLayoutResult] = useState(null);

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
        setLayoutResult(null);
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
      setLayoutResult(null);
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
      const promptParts = [
        `User prefers a ${layout || "flexible"} layout in a ${style || "versatile"} style.`,
        `Target colour palette: ${palette || "neutral tones"}.`,
      ];
      if (analysis?.objects?.length) {
        promptParts.push(`Detected furniture or items: ${analysis.objects.map((o) => o.name).join(", ")}.`);
      }
      if (analysis?.colors?.length) {
        promptParts.push(`Dominant colours in the photo: ${analysis.colors.join(", ")}.`);
      }

      const result = await generateLayout({
        imageUri: image,
        prompt: promptParts.join(" "),
        roomType: null,
        measurements: null,
      });

      setLayoutResult(result);
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
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>AestheticAI â€” Analyze Room</Text>

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
                - {o.name} ({Math.round(o.confidence * 100)}%)
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

      {layoutResult && (
        <View
          style={{
            backgroundColor: "#eef2ff",
            borderColor: "#c7d2fe",
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            gap: 10
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>AI Suggestions</Text>

          {layoutResult.caption ? (
            <Text style={{ color: "#1f2937" }}>Vision summary: {layoutResult.caption}</Text>
          ) : null}

          {layoutResult.warning ? (
            <Text style={{ color: "#b45309" }}>{layoutResult.warning}</Text>
          ) : null}

          {layoutResult.model ? (
            <Text style={{ color: "#4b5563", marginTop: 4, fontSize: 12 }}>
              Models: {layoutResult.model.image} · {layoutResult.model.text}
            </Text>
          ) : null}

          {layoutResult.plan ? (
            <View style={{ marginTop: 12 }}>
              <View>
                <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 4 }}>Style</Text>
                <Text style={{ color: "#111827" }}>{layoutResult.plan.styleName}</Text>
                <Text style={{ color: "#4b5563", marginTop: 4 }}>{layoutResult.plan.styleSummary}</Text>
              </View>

              {Array.isArray(layoutResult.plan.colorPalette) && layoutResult.plan.colorPalette.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>Colour Palette</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {layoutResult.plan.colorPalette.map((hex, index) => (
                      <View
                        key={`${hex}-${index}`}
                        style={{ alignItems: "center", width: 64, marginRight: 12, marginBottom: 12 }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: hex,
                            borderWidth: 1,
                            borderColor: "#d1d5db"
                          }}
                        />
                        <Text style={{ fontSize: 12, marginTop: 4, color: "#374151" }}>{hex}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {Array.isArray(layoutResult.plan.layoutIdeas) && layoutResult.plan.layoutIdeas.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>Layout Ideas</Text>
                  {layoutResult.plan.layoutIdeas.map((idea, index) => (
                    <Text key={index} style={{ color: "#1f2937", marginBottom: 4 }}>
                      - {idea.room ? `${idea.room}: ` : ""}{idea.summary}
                    </Text>
                  ))}
                </View>
              ) : null}

              {Array.isArray(layoutResult.plan.decorTips) && layoutResult.plan.decorTips.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>Decor Tips</Text>
                  {layoutResult.plan.decorTips.map((tip, index) => (
                    <Text key={index} style={{ color: "#1f2937", marginBottom: 4 }}>
                      - {tip}
                    </Text>
                  ))}
                </View>
              ) : null}

              {Array.isArray(layoutResult.plan.furnitureSuggestions) && layoutResult.plan.furnitureSuggestions.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>Furniture Suggestions</Text>
                  {layoutResult.plan.furnitureSuggestions.map((item, index) => (
                    <Text key={index} style={{ color: "#1f2937", marginBottom: 4 }}>
                      - {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {layoutResult.plan.photoInsights?.observations?.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>Photo Insights</Text>
                  {layoutResult.plan.photoInsights.observations.map((item, index) => (
                    <Text key={index} style={{ color: "#1f2937", marginBottom: 4 }}>
                      - {item}
                    </Text>
                  ))}
                  {layoutResult.plan.photoInsights.recommendedLighting ? (
                    <Text style={{ color: "#1f2937", marginTop: 4 }}>
                      Recommended lighting: {layoutResult.plan.photoInsights.recommendedLighting}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {!layoutResult.plan && layoutResult.raw ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "600", color: "#111827", marginBottom: 6 }}>AI Response</Text>
              <Text style={{ color: "#1f2937", lineHeight: 20 }}>{layoutResult.raw}</Text>
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}


