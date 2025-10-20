import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { warnMissingConfig } from './src/utils/configValidator';

import { colors } from './src/components/UI';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import MessagesInboxScreen from './src/screens/MessagesInboxScreen';
import AccountScreen from './src/screens/AccountScreen';
import ConsultantScreen from './src/screens/ConsultantScreen';
import ConsultantChat from './src/screens/ConsultantChat';

import UploadScreen from './src/screens/UploadScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import AiResultScreen from './src/screens/AiResultScreen';
import CustomizeAiScreen from './src/screens/CustomizeAiScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import DesignDetailScreen from './src/screens/DesignDetailScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import ManageSubscriptionScreen from './src/screens/ManageSubscriptionScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import ChatScreen from './src/screens/ChatScreen';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const USER_TAB_CONFIG = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Messages', component: MessagesInboxScreen, icon: 'mail' },
  { name: 'Browse', component: BrowseScreen, icon: 'people' },
  { name: 'My Designs', component: ProjectsScreen, icon: 'folder-open' },
  { name: 'Account', component: AccountScreen, icon: 'person-circle' }
];



const DESIGNER_TAB_CONFIG = [
  { name: 'Studio', component: ConsultantScreen, icon: 'color-palette-outline' },
  { name: 'Messages', component: MessagesInboxScreen, icon: 'chatbubble-ellipses-outline' },
  { name: 'Projects', component: ProjectsScreen, icon: 'briefcase-outline' },
  { name: 'Account', component: AccountScreen, icon: 'person-circle-outline' }
];

const tabIconStyles = StyleSheet.create({
  container: {
    width: 54,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline
  },
  focused: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },
  unfocused: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0
  }
});

function AnimatedTabIcon({ iconName, focused }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.94,
        damping: 14,
        stiffness: 160,
        mass: 0.7,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.8,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
  }, [focused, opacity, scale]);

  return (
    <Animated.View
      style={[
        tabIconStyles.container,
        focused ? tabIconStyles.focused : tabIconStyles.unfocused,
        { transform: [{ scale }], opacity }
      ]}
    >
      <Ionicons
        name={iconName}
        size={22}
        color={focused ? colors.primaryText : colors.mutedAlt}
      />
    </Animated.View>
  );
}

function buildTabNavigator(tabs) {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => {
        const currentTab = tabs.find((tab) => tab.name === route.name);
        const iconName = currentTab?.icon ?? 'grid-outline';
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primaryText,
          tabBarInactiveTintColor: colors.mutedAlt,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 6
          },
          tabBarItemStyle: {
            paddingVertical: 6
          },
          tabBarStyle: {
            height: 84,
            paddingBottom: 14,
            paddingTop: 12,
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            elevation: 16,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: -6 }
          },
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon iconName={iconName} focused={focused} />
          )
        };
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tabs.Navigator>
  );
}

function UserTabsNavigator() {
  return buildTabNavigator(USER_TAB_CONFIG);
}

function DesignerTabsNavigator() {
  return buildTabNavigator(DESIGNER_TAB_CONFIG);
}

export default function App() {
  useEffect(() => {
    warnMissingConfig();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        {/* Landing + Auth */}
        <Stack.Screen name="Landing" component={LandingScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />

        {/* Main */}
        <Stack.Screen name="UserTabs" component={UserTabsNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="DesignerTabs" component={DesignerTabsNavigator} options={{ animation: 'fade' }} />

        {/* Feature Screens */}
        <Stack.Screen name="Upload" component={UploadScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Consultant" component={ConsultantScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Assistant" component={AssistantScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="AiResult" component={AiResultScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CustomizeAI" component={CustomizeAiScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="VideoCall"
          component={VideoCallScreen}
          options={{ presentation: 'modal', animation: 'fade' }}
        />
        <Stack.Screen name="DesignDetail" component={DesignDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Security" component={SecurityScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ConsultantChat" component={ConsultantChat} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
