import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './utils/supabase';
import HomeScreen from "./screens/HomeScreen"
import SiteDetails from "./screens/SiteDetails"
import PlaceDetails from "./screens/PlaceDetails"
import VirtualToursScreen from "./screens/VirtualToursScreen"
import ProfileScreen from "./screens/ProfileScreen"
import GuidesScreen from "./screens/GuidesScreen"
import MonumentScanScreen from "./screens/MonumentScanScreen"
import AuthNavigator from './navigation/AuthNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={HomeScreen} />
      <Stack.Screen name="SiteDetails" component={SiteDetails} />
      <Stack.Screen name="PlaceDetails" component={PlaceDetails} />
    </Stack.Navigator>
  );
}

function VirtualToursStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VirtualToursHome" component={VirtualToursScreen} />
      <Stack.Screen name="SiteDetails" component={SiteDetails} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Guides':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Discover':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'Virtual Tours':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Guides" component={GuidesScreen} />
      <Tab.Screen name="Discover" component={MonumentScanScreen} />
      <Tab.Screen name="Virtual Tours" component={VirtualToursStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <NavigationContainer>
        {session ? <MainTabs /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});