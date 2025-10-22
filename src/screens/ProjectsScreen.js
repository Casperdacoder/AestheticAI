import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, colors } from '../components/UI';

export default function ProjectScreen() {
  const photoURL = null;
  const userName = 'Noelyn';
  const notifications = [];
  const handleNotificationsPress = () => console.log('Notifications pressed');
  const colors = { primaryText: '#FFFFFF', primary: '#0F3E48' };

  // 🔹 Sample saved designs
  const [savedDesigns, setSavedDesigns] = useState([
    { id: 1, title: 'Modern Minimalist', subtitle: 'Clean and neutral design', image: 'https://i.imgur.com/bxQO1sX.jpeg' },
    { id: 2, title: 'Tropical Vibe', subtitle: 'Bright and refreshing look', image: 'https://i.imgur.com/3RjzKjL.jpeg' },
  ]);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // 🔹 Toggle select mode
  const handleSelectToggle = () => {
    setIsSelecting(!isSelecting);
    setSelectedIds([]);
  };

  // 🔹 Toggle checkbox
  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 🔹 Delete confirmation
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete selected designs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSavedDesigns(savedDesigns.filter((design) => !selectedIds.includes(design.id)));
            setSelectedIds([]);
            setIsSelecting(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" />

      {/* 🔹 Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identity}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handleNotificationsPress} style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={42} color={colors.primaryText} />
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Welcome, {userName}!</Text>
      </View>

      {/* 🔹 Quick Layouts Section */}
      <View style={styles.section}>
        <View style={styles.designHeader}>
          <Text style={styles.designTitle}></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isSelecting && selectedIds.length > 0 && (
              <TouchableOpacity onPress={handleDeleteSelected} style={{ marginRight: 12 }}>
                {/* ✅ Filled trash icon */}
                <Ionicons name="trash" size={22} color="#FF3B30" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSelectToggle}>
              <Text style={styles.selectText}>{isSelecting ? 'Cancel' : 'Select'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.quickLayout}>Quick Layouts</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layoutScroll}>
          <View style={styles.layoutCard}>
            <Text style={styles.layoutTitle}>Living Room Reset</Text>
            <Text style={styles.layoutDescription}>
              Rearrange the living room for better conversation flow and window views.
            </Text>
            <Text style={styles.startText}>Start →</Text>
          </View>

          <View style={styles.layoutCard}>
            <Text style={styles.layoutTitle}>Cozy Corner</Text>
            <Text style={styles.layoutDescription}>Create a cozy home nook with natural lighting.</Text>
            <Text style={styles.startText}>Start →</Text>
          </View>
        </ScrollView>
      </View>

      {/* 🔹 My Designs Section */}
      <View style={styles.myDesignsSection}>
        <Text style={styles.myDesignsTitle}>My Designs</Text>

        <View style={styles.cardSection}>
          {savedDesigns.map((design) => (
            <TouchableOpacity
              key={design.id}
              onPress={() => isSelecting && handleSelectItem(design.id)}
              activeOpacity={isSelecting ? 0.8 : 1}
              style={[
                styles.card,
                selectedIds.includes(design.id) && { borderWidth: 2, borderColor: '#FF3B30' }, // ✅ only border highlight when selected
              ]}
            >
              {isSelecting && (
                <View style={styles.checkboxContainer}>
                  <Ionicons
                    name={selectedIds.includes(design.id) ? 'checkbox' : 'square-outline'}
                    size={22}
                    color="#fff"
                  />
                </View>
              )}
              <Image source={{ uri: design.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{design.title}</Text>
              <Text style={styles.cardSubtitle}>{design.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatarImage: { width: 55, height: 55, borderRadius: 28 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notificationWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  welcome: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 20, fontFamily: 'serif' },
  designHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 4 },
  designTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F3E48' },
  selectText: { fontSize: 16, color: '#154b57ff', fontWeight: '500', marginTop: 10 },
  quickLayout: { fontSize: 16, color: '#FFFFFF', marginTop: 4, marginBottom: 8, paddingHorizontal: 20 },
  layoutScroll: { paddingLeft: 20 },
  layoutCard: {
    backgroundColor: '#0F3E48',
    borderRadius: 16,
    width: 260,
    padding: 16,
    marginRight: 12,
  },
  layoutTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  layoutDescription: { color: '#A9C7CA', marginVertical: 8, fontSize: 14 },
  startText: { color: '#ffffffff', fontWeight: '600' },
  myDesignsSection: { marginTop: 24, paddingHorizontal: 20 },
  myDesignsTitle: { fontSize: 18, fontWeight: '700', color: '#0F3E48', marginBottom: 12 },
  cardSection: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  card: {
    backgroundColor: '#0F3E48',
    borderRadius: 16,
    width: '48%',
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  checkboxContainer: { position: 'absolute', top: 10, left: 10, zIndex: 1 },
  cardImage: { width: '100%', height: 140 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 8, marginLeft: 8 },
  cardSubtitle: { color: '#A9C7CA', fontSize: 14, marginBottom: 8, marginLeft: 8 },
});
