// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/icons/Icon';
import { Platform } from 'react-native';

export default function TabLayout() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: themeColors.iconSelected,
                tabBarStyle: Platform.select({
                    ios: {
                        backgroundColor: themeColors.background,
                        height: 90, // iOS specific height
                        paddingTop: 5,
                        level: 100,
                    },
                    android: {
                        backgroundColor: themeColors.background,
                        height: 70, // Android specific height
                        paddingTop: 10,
                        paddingBottom: 5, // Android specific padding
                        level: 100,
                    },
                }),
                tabBarLabelStyle: {
                    marginBottom: Platform.OS === 'android' ? 10 : 0, // Adjusts label position for Android
                },
                headerTitleContainerStyle: {
                    paddingLeft: 8, // Add padding on the left
                },
                headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                headerTitleAlign: 'left', // Align the title to the left
                headerShown: true,
                tabBarShowLabel: true,
                headerRight: () => (
                    <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('settings/settings' as any)}>
                        <Icon name='person' size={26} color={themeColors.subText} style={{ marginRight: 18 }} />
                    </TouchableOpacity>
                ),
            }}
            sceneContainerStyle={{ backgroundColor: themeColors.background }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: 90,
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Home',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name='(top-tabs)'
                options={{
                    headerStyle: {
                        height: 90,
                        backgroundColor: themeColors.background,
                        borderBottomWidth: 0, // Remove the border under the navbar
                        shadowOpacity: 0, // Remove the shadow for iOS
                        elevation: 0, // Remove the elevation for Android
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Training',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'exercise-active' : 'exercise-inactive'} size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name='nutrition'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: 90,
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Nutrition',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'nutrition-active' : 'nutrition-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='progress'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: 90,
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Progress',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'progress-active' : 'progress-inactive'} size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
