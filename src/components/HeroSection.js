import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../components/UI'; // Corrected import path for colors

export default function HeroSection({ 
    userName, 
    photoURL, 
    notifications, 
    handleNotificationsPress, 
    handleEditAccount 
}) {
    return (
        <View style={styles.hero}>
            <View style={styles.heroTop}>
                {/* User Identity and Crown */}
                <View style={styles.identity}>
                    {photoURL ? (
                        <Image source={{ uri: photoURL }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatar}>
                            <Ionicons name="person-circle" size={55} color="#FFFFFF" />
                        </View>
                    )}
                    <TouchableOpacity onPress={handleEditAccount} style={styles.crownWrapper}>
                        {/* Assuming this button navigates to a premium/account page */}
                        <FontAwesome5 name="crown" size={24} color="#FFD700" />
                    </TouchableOpacity>
                </View>
                
                {/* Notifications */}
                <TouchableOpacity onPress={handleNotificationsPress} style={styles.notificationWrapper}>
                    <Ionicons name="notifications-outline" size={42} color={colors.primaryText} />
                    {notifications.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{notifications.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            
            {/* Welcome Message */}
            <Text style={styles.welcome}>Welcome, {userName}!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        // You might need to adjust the color and text color based on your actual `colors` import
        backgroundColor: colors.surfaceMuted || '#F0F0F0', // Use a fallback color if colors.surfaceMuted is not accessible
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        // The original code uses StatusBar.currentHeight. Ensure this is correct for your environment.
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 35 : 75,
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    heroTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    identity: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10 
    },
    avatar: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: -18 
    },
    avatarImage: { 
        width: 55, 
        height: 55, 
        borderRadius: 28, 
        marginLeft: 8 
    },
    crownWrapper: { 
        marginLeft: -5, 
        marginTop: 2 
    },
    notificationWrapper: { 
        position: 'relative' 
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF3B30', // Red for notification badge
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: { 
        color: '#fff', 
        fontSize: 10, 
        fontWeight: '700', 
        marginStart: 2 
    },
    welcome: { 
        // Use a fallback color if colors.primaryText is not accessible
        color: colors.primaryText || '#333', 
        fontSize: 22, 
        fontWeight: '700', 
        marginTop: 35, 
        marginBottom: 0, 
        // Note: 'serif' is not a standard React Native font, use a system or custom font.
        fontFamily: 'serif' 
    },
});
