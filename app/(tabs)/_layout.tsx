// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Entypo, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            initialRouteName='fitness'
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: true,
                tabBarShowLabel: true,
            }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => <MaterialIcons size={24} name='home' color={color} />,
                }}
            />
            <Tabs.Screen
                name='(top-tabs)'
                options={{
                    title: 'Exercise',
                    tabBarIcon: ({ color, focused }) => <MaterialIcons name='sports-martial-arts' size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name='nutrition'
                options={{
                    title: 'Nutrition',
                    tabBarIcon: ({ color, focused }) => <Entypo name='leaf' size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='progress'
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name='stats-chart' size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
