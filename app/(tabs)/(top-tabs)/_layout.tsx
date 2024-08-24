// app/(tabs)/(top-tabs)/_layout.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useColorScheme } from '@/hooks/useColorScheme'; // Import the color scheme hook
import { Colors } from '@/constants/Colors'; // Import your color definitions

const { Navigator, Screen } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
    const colorScheme = useColorScheme(); // Retrieve the current theme (light or dark)
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <MaterialTopTabs
            screenOptions={{
                tabBarLabelStyle: { textTransform: 'none', fontSize: 15 },
                tabBarStyle: { backgroundColor: themeColors.background },
                tabBarIndicatorStyle: { backgroundColor: themeColors.text },
                tabBarActiveTintColor: themeColors.text, // Active tab label color
                tabBarInactiveTintColor: themeColors.textShades[500], // Inactive tab label color
            }}
        >
            <MaterialTopTabs.Screen name='programs' options={{ title: 'Programs' }} />
            <MaterialTopTabs.Screen name='workouts' options={{ title: 'Workouts' }} />
        </MaterialTopTabs>
    );
}

const styles = StyleSheet.create({
    // Define any styles for your components here
});
