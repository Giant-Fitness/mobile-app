// app/(app)/(tabs)/_layout.tsx

import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { router, Tabs } from 'expo-router';
import { Icon } from '@/components/base/Icon';
import { Platform } from 'react-native';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { moderateScale } from '@/utils/scaling';

export default function TabLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <Tabs
            screenOptions={{
                headerTitleAllowFontScaling: false,
                tabBarAllowFontScaling: false,
                tabBarActiveTintColor: themeColors.iconSelected,
                tabBarStyle: Platform.select({
                    ios: {
                        backgroundColor: themeColors.background,
                        height: Sizes.footerHeightIOS,
                        paddingTop: 0,
                        level: 100,
                    },
                    android: {
                        backgroundColor: themeColors.background,
                        height: Sizes.footerHeightAndroid,
                        paddingTop: Spaces.SM,
                        paddingBottom: Spaces.XS,
                        level: 100,
                    },
                }),
                lazy: true, // This helps with performance
                tabBarItemStyle: {
                    paddingVertical: Spaces.SM, // Add some vertical padding
                    flexDirection: 'column', // Ensure vertical stacking
                    alignItems: 'center',
                    justifyContent: 'flex-start', // Start from top instead of space-between
                },
                tabBarLabelStyle: {
                    marginTop: Spaces.XS,
                },
                headerTitleContainerStyle: {
                    paddingLeft: 0,
                },
                headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                headerTitleAlign: 'center',
                headerShown: true,
                tabBarShowLabel: true,
                headerLeft: () => (
                    <TouchableOpacity activeOpacity={1} onPress={() => router.push('/(app)/settings')}>
                        <Icon name='person' size={28} color={themeColors.subText} style={{ marginLeft: Spaces.LG }} />
                    </TouchableOpacity>
                ),
            }}
            sceneContainerStyle={{
                backgroundColor: themeColors.background,
                flex: 1, // Ensure proper layout
            }}
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
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='programs'
                options={{
                    headerStyle: {
                        backgroundColor: themeColors.background,
                        height: Sizes.headerHeight,
                    },
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Plans',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'plan-active' : 'plan-inactive'} size={22} color={color} />,
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
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'lightning-active' : 'lightning-inactive'} size={23} color={color} />,
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
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'progress-active' : 'progress-inactive'} size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
