import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './src/components/UI';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import MessagesInboxScreen from './src/screens/MessagesInboxScreen';
import AccountScreen from './src/screens/AccountScreen';

import UploadScreen from './src/screens/UploadScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import AiResultScreen from './src/screens/AiResultScreen';
import CustomizeAiScreen from './src/screens/CustomizeAiScreen';
import ConsultantScreen from './src/screens/ConsultantScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import DesignDetailScreen from './src/screens/DesignDetailScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import ManageSubscriptionScreen from './src/screens/ManageSubscriptionScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SecurityScreen from './src/screens/SecurityScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarStyle: { height: 62, paddingBottom: 10, paddingTop: 8 }
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="Messages"
        component={MessagesInboxScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="mail-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="folder-open-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown:false }}>
        {/* Landing + Auth */}
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />

        {/* Main */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Feature Screens */}
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="AiResult" component={AiResultScreen} />
        <Stack.Screen name="CustomizeAI" component={CustomizeAiScreen} />
        <Stack.Screen name="Consultant" component={ConsultantScreen} />
        <Stack.Screen name="VideoCall" component={VideoCallScreen} />
        <Stack.Screen name="DesignDetail" component={DesignDetailScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
