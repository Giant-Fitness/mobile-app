// app/(tabs)/(top-tabs)/_layout.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
                tabBarLabelStyle: { textTransform: 'none' },
                tabBarStyle: {
                    backgroundColor: themeColors.background,
                },
                tabBarIndicatorStyle: {
                    backgroundColor: themeColors.text,
                    height: 0.7, // Thickness of the tab indicator line
                },
                tabBarActiveTintColor: themeColors.text, // Active tab label color
                tabBarInactiveTintColor: themeColors.textLight, // Inactive tab label color
            }}
        >
            <MaterialTopTabs.Screen name='programs' options={{ title: 'Programs' }} />
            <MaterialTopTabs.Screen name='workouts' options={{ title: 'Workouts' }} />
        </MaterialTopTabs>
    );
}
