import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Alert, StyleSheet, ScrollView } from 'react-native';
import { Screen, Toast, colors, Button, Card } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { loadSavedDesigns, saveDesign, persistSavedDesigns } from '../services/storage';

const SAMPLE_LIBRARY = [
  {
    id: 'lib-1',
    title: 'Modern Loft',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
    style: 'Industrial Loft'
  },
  {
    id: 'lib-2',
    title: 'Scandi Retreat',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
    style: 'Scandinavian Cozy'
  }
];

const QUICK_LAYOUTS = [
  {
    id: 'quick-living',
    title: 'Living Room Reset',
    prompt: 'Rearrange the living room for better conversation flow and window views.'
  },
  {
    id: 'quick-homeoffice',
    title: 'Compact Home Office',
    prompt: 'Create a productivity-focused home office with storage and natural light.'
  },
  {
    id: 'quick-bedroom',
    title: 'Serene Bedroom',
    prompt: 'Design a calming bedroom retreat with layered lighting and soft textures.'
  }
];

export default function ProjectsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = () => {
    if (!selected.size) return;
    Alert.alert('Delete Designs', 'Delete selected designs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSavedDesigns((current) => current.filter((item) => !selected.has(item.id)));
          setToastVisible(true);
          setTimeout(() => setToastVisible(false), 1600);
          setSelected(new Set());
          setSelecting(false);
        }
      }
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadSavedDesigns().then((designs) => {
        if (isActive) setSavedDesigns(designs);
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.savedDesign) {
        saveDesign(route.params.savedDesign).then((designs) => {
          setSavedDesigns(designs);
        });
        navigation.setParams({ savedDesign: undefined });
      }
    }, [route.params, navigation])
  );

  const combinedDesigns = useMemo(() => {
    return [...savedDesigns, ...SAMPLE_LIBRARY];
  }, [savedDesigns]);

  const handleQuickLayout = (layout) => {
    navigation.navigate('CustomizeAI', {
      quickPrompt: layout.prompt
    });
  };

  return (
    <Screen style={styles.screen}>
      <Toast
        visible={toastVisible}
        text="Deleted successfully!"
        onClose={() => setToastVisible(false)}
        variant="danger"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Designs</Text>
          <TouchableOpacity
            onPress={() => {
              if (selecting) {
                setSelected(new Set());
              }
              setSelecting((prev) => !prev);
            }}
          >
            <Text style={styles.selectAction}>{selecting ? 'Cancel' : 'Select'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Quick Layouts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {QUICK_LAYOUTS.map((layout) => (
            <TouchableOpacity
              key={layout.id}
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => handleQuickLayout(layout)}
            >
              <Text style={styles.quickTitle}>{layout.title}</Text>
              <Text style={styles.quickPrompt}>{layout.prompt}</Text>
              <View style={styles.quickCTA}>
                <Text style={styles.quickCTAtext}>Start</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primaryText} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={combinedDesigns}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() =>
                  selecting
                    ? toggleSelect(item.id)
                    : navigation.navigate('DesignDetail', { uploadedUri: item.image, title: item.title, design: item })
                }
                onLongPress={() => {
                  if (!selecting) setSelecting(true);
                  toggleSelect(item.id);
                }}
              >
                <Image source={{ uri: item.image }} style={styles.thumbnail} />
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardStyle}>{item.style || 'Custom Style'}</Text>
                  {selecting ? (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected ? <Ionicons name="checkmark" size={16} color={colors.primaryText} /> : null}
                    </View>
                  ) : (
                    <Ionicons name="heart-outline" size={18} color={colors.mutedAlt} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <Button
          title="Upload New Design"
          onPress={() => navigation.navigate('Upload')}
          variant="outline"
          style={styles.uploadButtonFull}
          textStyle={{ color: colors.primary }}
        />
      </ScrollView>

      {selecting ? (
        <Button
          title="Delete Selected"
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteSelected}
          textStyle={styles.deleteSelectedText}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56
  },
  scroll: {
    paddingBottom: 120
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  heading: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700'
  },
  selectAction: {
    color: colors.accent,
    fontWeight: '600'
  },
  sectionLabel: {
    color: colors.subtleText,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600'
  },
  quickRow: {
    gap: 16,
    paddingBottom: 8
  },
  quickCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: 8
  },
  quickTitle: {
    color: colors.primaryText,
    fontWeight: '700'
  },
  quickPrompt: {
    color: colors.subtleText,
    fontSize: 14,
    lineHeight: 18
  },
  quickCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10
  },
  quickCTAtext: {
    color: colors.primaryText,
    fontWeight: '600'
  },
  listContent: {
    paddingVertical: 20,
    gap: 18
  },
  columnWrapper: {
    gap: 18
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  thumbnail: {
    width: '100%',
    height: 140
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4
  },
  cardTitle: {
    color: colors.primaryText,
    fontWeight: '600'
  },
  cardStyle: {
    color: colors.mutedAlt,
    fontSize: 13
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  deleteSelected: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    borderColor: colors.danger
  },
  deleteSelectedText: {
    color: colors.danger
  },
  uploadButtonFull: {
    marginTop: 12
  }
});



