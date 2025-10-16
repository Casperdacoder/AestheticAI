import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Screen, Card, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';

const SAMPLE_DESIGNS = [
  { id: '1', title: 'Modern Living Room', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
  { id: '2', title: 'Scandinavian Loft', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&q=80' },
  { id: '3', title: 'Minimalist Bedroom', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&sig=1' },
  { id: '4', title: 'Cozy Studio', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&sig=2' },
  { id: '5', title: 'Urban Workspace', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&q=80' },
  { id: '6', title: 'Boho Retreat', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
  { id: '7', title: 'Art Deco Lounge', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&sig=3' },
  { id: '8', title: 'Neutral Workspace', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80' },
  { id: '9', title: 'Industrial Kitchen', image: 'https://images.unsplash.com/photo-1570129476769-55f4a5add5a6?w=800&q=80' },
  { id: '10', title: 'Serene Bathroom', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80' }
];

export default function HomeScreen({ navigation }) {
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveRole = async () => {
      try {
        const uid = auth.currentUser?.uid;
        const cachedRole = uid ? await getCachedUserRole(uid) : null;
        if (isMounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsDesigner(false);
          setRoleChecked(true);
        }
      }
    };
    resolveRole();
    return () => {
      isMounted = false;
    };
  }, []);

  const designs = useMemo(() => SAMPLE_DESIGNS, []);

  return (
    <Screen inset={false} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.identity}>
              <View style={styles.avatar} />
              <Ionicons name="ribbon-outline" size={20} color={colors.accent} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
          <Text style={styles.welcome}>Welcome Username!</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Assistant')} style={styles.column}>
              <Card style={styles.tile}>
                <Ionicons name="color-palette-outline" size={36} color={colors.primaryText} style={styles.tileIcon} />
                <Text style={styles.tileText}>Design with AI</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('CustomizeAI')} style={styles.column}>
              <Card style={styles.tile}>
                <Ionicons name="settings-outline" size={36} color={colors.primaryText} style={styles.tileIcon} />
                <Text style={styles.tileText}>Customize with AI</Text>
              </Card>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Consultant')}>
            <Card style={[styles.tile, styles.tileFull]}>
              <Ionicons name="headset-outline" size={36} color={colors.primaryText} style={styles.tileIcon} />
              <Text style={styles.tileText}>Consultation</Text>
            </Card>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Designs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')} style={styles.viewAll}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward-circle" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.designGrid}>
            {designs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.designOption}
                activeOpacity={0.82}
                onPress={() => navigation.navigate('DesignDetail', { uploadedUri: item.image, title: item.title })}
              >
                <Card style={styles.designCard}>
                  <Image source={{ uri: item.image }} style={styles.designImage} />
                  <Text style={styles.designTitle}>{item.title}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background
  },
  scroll: {
    paddingBottom: 48
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface
  },
  welcome: {
    color: colors.primaryText,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20
  },
  row: {
    flexDirection: 'row',
    gap: 18
  },
  column: {
    flex: 1
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.outline
  },
  tileFull: {
    marginTop: 0
  },
  tileIcon: {
    marginBottom: 16
  },
  tileText: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700'
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  viewAllText: {
    color: colors.accent,
    fontWeight: '600'
  },
  designGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  designOption: {
    width: '48%',
    marginBottom: 18
  },
  designCard: {
    padding: 0,
    overflow: 'hidden'
  },
  designImage: {
    width: '100%',
    height: 140
  },
  designTitle: {
    color: colors.subtleText,
    fontWeight: '600',
    padding: 14
  }
});




