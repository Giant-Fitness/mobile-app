// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation();

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
                headerTitleContainerStyle: {
                    paddingLeft: 8, // Add padding on the left
                },
                headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
                headerTitleAlign: 'left', // Align the title to the left
                headerShown: true,
                tabBarShowLabel: true,
                headerRight: () => (
                    <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('settings')}>
                        <Ionicons name="person-circle-outline" size={22} color={Colors[colorScheme ?? 'light'].text} style={{ marginRight: 16 }} />
                    </TouchableOpacity>
                ),
            }}
            sceneContainerStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => <MaterialIcons size={24} name='home' color={color} />,
                }}
            />
            <Tabs.Screen
                name='(top-tabs)'
                options={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                        borderBottomWidth: 0, // Remove the border under the navbar
                        shadowOpacity: 0, // Remove the shadow for iOS
                        elevation: 0, // Remove the elevation for Android
                    },
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
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
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
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
                    headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
                    title: 'Progress',
                    tabBarIcon: ({ color, focused }) => <TabBarIcon name='stats-chart' size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
