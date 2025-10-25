import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/components/UI';

// ------------------------
// Screens
// ------------------------
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RegisterConScreen from './src/consultant/RegisterConScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AdminLogin from './src/admin/Adminlogin';

import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import MessagesInboxScreen from './src/screens/MessagesInboxScreen';
import ConsultantScreen from './src/consultant/ConsultantScreen';
import EarningsScreen from './src/consultant/EarningsScreen';
import ConsultantDashboardScreen from './src/consultant/ConsultantDashboardScreen';

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
import VerificationForm from './src/consultant/VerificationForm';

// ------------------------
// Admin Screens
// ------------------------
import DashboardScreen from './src/admin/DashboardScreen';
import AccountsScreen from './src/admin/AccountsScreen';
import VerificationsScreen from './src/admin/VerificationsScreen';
import WithdrawalsScreen from './src/admin/WithdrawalsScreen';
import VerificationDetailScreen from './src/admin/VerificationDetailScreen';

// ------------------------
// Account Screens
// ------------------------
import AccountUserScreen from './src/screens/AccountUserScreen';
import AccountDesignerScreen from './src/consultant/AccountDesignerScreen';
import BookingScreen from './src/screens/BookingScreen';
import ConsultationsInboxScreen from './src/consultant/ConsultationsInboxScreen';

// ------------------------
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// ------------------------
// Tab Config
// ------------------------
const USER_TAB_CONFIG = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Messages', component: MessagesInboxScreen, icon: 'mail' },
  { name: 'Browse', component: BrowseScreen, icon: 'people' },
  { name: 'My Designs', component: ProjectsScreen, icon: 'folder-open' },
  { name: 'Account', component: AccountUserScreen, icon: 'person-circle' },
];

const DESIGNER_TAB_CONFIG = [
  { name: 'Home', component: ConsultantDashboardScreen, icon: 'home' },
  { name: 'Bookings', component: BookingScreen, icon: 'calendar' },
  { name: 'Consultations', component: ConsultationsInboxScreen, icon: 'mail' },
  { name: 'Earnings', component: EarningsScreen, icon: 'cash' },
  { name: 'AccountDesigner', component: AccountDesignerScreen, icon: 'person-circle' },
];

const ADMIN_TAB_CONFIG = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'home' },
  { name: 'Accounts', component: AccountsScreen, icon: 'people' },
  { name: 'Verifications', component: VerificationsScreen, icon: 'checkmark-done-circle' },
  { name: 'Withdrawals', component: WithdrawalsScreen, icon: 'cash' },
];

// ------------------------
// Tab Icon Styles
// ------------------------
const tabIconStyles = StyleSheet.create({
  container: {
    width: 60,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  focused: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  unfocused: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
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
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.8,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        tabIconStyles.container,
        focused ? tabIconStyles.focused : tabIconStyles.unfocused,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Ionicons
        name={iconName}
        size={30}
        color={focused ? colors.primaryText : colors.mutedAlt}
      />
    </Animated.View>
  );
}

// ------------------------
// Build Tab Navigator
// ------------------------
function buildTabNavigator(tabs) {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => {
        const currentTab = tabs.find((tab) => tab.name === route.name);
        const iconName = currentTab?.icon ?? 'grid-outline';
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarItemStyle: { paddingVertical: 6 },
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
            shadowOffset: { width: 0, height: -6 },
          },
          tabBarIcon: ({ focused }) => <AnimatedTabIcon iconName={iconName} focused={focused} />,
        };
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tabs.Navigator>
  );
}

// ------------------------
// Tab Navigators
// ------------------------
function UserTabsNavigator() {
  return buildTabNavigator(USER_TAB_CONFIG);
}
function DesignerTabsNavigator() {
  return buildTabNavigator(DESIGNER_TAB_CONFIG);
}
function AdminTabsNavigator() {
  return buildTabNavigator(ADMIN_TAB_CONFIG);
}

// ------------------------
// Main App
// ------------------------
export default function App() {
  useEffect(() => {
    console.warn('⚠️ Missing config validation skipped (no validator found).');
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Auth screens */}
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterCon" component={RegisterConScreen} />
        <Stack.Screen name="VerificationForm" component={VerificationForm} />
        <Stack.Screen name="VerificationsScreen" component={VerificationsScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />

        {/* Main tabs */}
        <Stack.Screen name="UserTabs" component={UserTabsNavigator} />
        <Stack.Screen name="DesignerTabs" component={DesignerTabsNavigator} />
        <Stack.Screen name="AdminTabs" component={AdminTabsNavigator} />

        {/* Admin Feature Screen */}
        <Stack.Screen name="VerificationDetail" component={VerificationDetailScreen} />

        {/* Other Feature screens */}
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Consultant" component={ConsultantScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="AiResult" component={AiResultScreen} />
        <Stack.Screen name="CustomizeAI" component={CustomizeAiScreen} />
        <Stack.Screen
          name="VideoCall"
          component={VideoCallScreen}
          options={{ presentation: 'modal', animation: 'fade' }}
        />
        <Stack.Screen name="DesignDetail" component={DesignDetailScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />

        <Stack.Screen name="AccountsScreen" component={AccountsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
