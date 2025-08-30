// app/(app)/(tabs)/(training-tabs)/_layout.tsx

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';

import { withLayoutContext } from 'expo-router';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { trigger } from 'react-native-haptic-feedback';

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function TrainingLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TopTabs
            screenListeners={() => ({
                tabPress: () => trigger('virtualKey'),
            })}
            screenOptions={{
                tabBarActiveTintColor: themeColors.text,
                tabBarInactiveTintColor: themeColors.subText,
                tabBarIndicatorStyle: {
                    backgroundColor: themeColors.systemBorderColor,
                    height: 1.2,
                },
                tabBarStyle: {
                    backgroundColor: themeColors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontWeight: '500',
                },
            }}
        >
            <TopTabs.Screen
                name='programs'
                options={{
                    title: 'Programs',
                }}
            />
            <TopTabs.Screen
                name='solos'
                options={{
                    title: 'Solos',
                }}
            />
        </TopTabs>
    );
}
