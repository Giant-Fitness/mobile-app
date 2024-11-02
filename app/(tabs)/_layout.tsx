// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/base/Icon';
import { Platform } from 'react-native';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { moderateScale } from '@/utils/scaling'; // Use the customized moderateScale

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
                        height: Sizes.footerHeightIOS, // iOS specific height
                        paddingTop: 0,
                        level: 100,
                    },
                    android: {
                        backgroundColor: themeColors.background,
                        height: Sizes.footerHeightAndroid, // Android specific height
                        paddingTop: Spaces.SM,
                        paddingBottom: Spaces.XS, // Android specific padding
                        level: 100,
                    },
                }),
                tabBarLabelStyle: {
                    marginBottom: Platform.OS === 'android' ? 10 : 0, // Adjusts label position for Android
                },
                headerTitleContainerStyle: {
                    paddingLeft: 0, // Add padding on the left
                },
                headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                headerTitleAlign: 'center', // Align the title to the left
                headerShown: true,
                tabBarShowLabel: true,
                headerLeft: () => (
                    <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate('settings/settings' as any)}>
                        <Icon name='person' size={28} color={themeColors.subText} style={{ marginLeft: Spaces.LG }} />
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
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Home',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='(top-tabs)'
                options={{
                    href: null, // This prevents the tab from being rendered
                }}
            />
            {/*<Tabs.Screen
                name='(top-tabs)'
                options={{
                    headerStyle: {
                        height: Sizes.headerHeight,
                        backgroundColor: themeColors.background,
                        borderBottomWidth: 0, // Remove the border under the navbar
                        shadowOpacity: 0, // Remove the shadow for iOS
                        elevation: 0, // Remove the elevation for Android
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Train',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'exercise-active' : 'exercise-inactive'} size={25} color={color} />,
                }}
            />*/}
            <Tabs.Screen
                name='nutrition'
                options={{
                    href: null, // This prevents the tab from being rendered
                }}
            />
            {/*<Tabs.Screen
                name='nutrition'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    title: 'Nutrition',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'nutrition-active' : 'nutrition-inactive'} size={23} color={color} />,
                }}
            />*/}
            <Tabs.Screen
                name='programs'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Plans',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'plan-active' : 'plan-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='on-demand'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Solos',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'lightning-active' : 'lightning-inactive'} size={23} color={color} />,
                }}
            />
            <Tabs.Screen
                name='progress'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Progress',
                    tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? 'progress-active' : 'progress-inactive'} size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
