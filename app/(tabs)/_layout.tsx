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
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    height: 90,
                    paddingTop: 5,
                    level: 100,
                },
                headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text },
                headerShown: true,
                tabBarShowLabel: true,
            }}
            sceneContainerStyle={{ backgroundColor: 'yellow' }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text },
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => <MaterialIcons size={24} name='home' color={color} />,
                }}
            />
            <Tabs.Screen
                name='(top-tabs)'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text },
                    title: 'Exercise',
                    tabBarIcon: ({ color, focused }) => <MaterialIcons name='sports-martial-arts' size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name='nutrition'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text },
                    title: 'Nutrition',
                    tabBarIcon: ({ color, focused }) => <Entypo name='leaf' size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='progress'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text },
                    title: 'Progress',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name='stats-chart' size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
