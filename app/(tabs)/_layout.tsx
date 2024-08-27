// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';

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
                        <Icon name='person' size={26} color={Colors[colorScheme ?? 'light'].textLight} style={{ marginRight: 18 }} />
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
                    tabBarIcon: ({ color, focused }) => <Icon size={24} name='home' color={color} />,
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
                    tabBarIcon: ({ color, focused }) => <Icon name='exercise' size={24} color={color} />,
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
                    tabBarIcon: ({ color, focused }) => <Icon name='nutrition' size={22} color={color} />,
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
                    tabBarIcon: ({ color, focused }) => <Icon name='progress' size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
