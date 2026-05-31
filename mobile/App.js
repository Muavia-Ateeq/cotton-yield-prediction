import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/SplashScreen';
import LoginScreen from './src/LoginScreen';
import SignupScreen from './src/SignupScreen';
import HomeScreen from './src/HomeScreen';
import AnalyticsScreen from './src/AnalyticsScreen';
import PredictScreen from './src/PredictScreen';
import VarietiesScreen from './src/VarietiesScreen';
import ProfileScreen from './src/ProfileScreen';
import { COLORS } from './src/theme';
import ForgotScreen from './src/ForgotScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CenterButton({ children, onPress }) {
  return (
    <TouchableOpacity style={styles.centerWrap} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.centerCircle}>{children}</View>
    </TouchableOpacity>
  );
}

function MainTabs({ route }) {
  const user = route?.params?.user || 'Guest';
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.border,
          height: 64, paddingBottom: 8, paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        initialParams={{ user }}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} /> }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={22} color={color} /> }} />
      <Tab.Screen name="Predict" component={PredictScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <Ionicons name="sparkles" size={22} color="#fff" />,
          tabBarButton: (props) => <CenterButton {...props} />,
        }} />
      <Tab.Screen name="Varieties" component={VarietiesScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="leaf-outline" size={22} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        initialParams={{ user }}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Forgot" component={ForgotScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerWrap: { top: -18, justifyContent: 'center', alignItems: 'center', flex: 1 },
  centerCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
});