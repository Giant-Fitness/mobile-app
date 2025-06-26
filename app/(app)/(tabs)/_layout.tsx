// app/(app)/(tabs)/_layout.tsx

import { Icon } from '@/components/base/Icon';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { debounce } from '@/utils/debounce';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { Platform, Pressable, TouchableOpacity } from 'react-native';

import { router, Tabs } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

export default function TabLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handleSettingPress = () => {
        trigger('effectClick');
        debounce(router, '/(app)/settings');
    };

    return (
        <Tabs
            screenListeners={() => ({
                tabPress: () => trigger('virtualKey'),
            })}
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
                        level: 100,
                    },
                }),
                tabBarButton:
                    Platform.OS === 'android'
                        ? (props) => (
                              <Pressable onPress={props.onPress} style={props.style} android_ripple={{ color: 'transparent' }}>
                                  {props.children}
                              </Pressable>
                          )
                        : undefined,
                lazy: true, // This helps with performance
                tabBarItemStyle: {
                    flexDirection: 'column', // Applied to both platforms
                    alignItems: 'center', // Applied to both platforms
                    justifyContent: 'flex-start', // Applied to both platforms
                    // iOS-specific padding
                    ...Platform.select({
                        ios: {
                            paddingVertical: Spaces.SM,
                        },
                        android: {}, // No additional padding for Android
                    }),
                },
                tabBarLabelStyle: Platform.select({
                    ios: {
                        marginTop: Spaces.XS,
                    },
                    android: {}, // Default margin for Android
                }),
                headerTitleContainerStyle: {
                    paddingLeft: 0,
                },
                headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                headerTitleAlign: 'center',
                headerShown: true,
                tabBarShowLabel: true,
                headerLeft: () => (
                    <TouchableOpacity activeOpacity={1} onPress={handleSettingPress}>
                        <Icon name='person' size={28} color={themeColors.subText} style={{ marginLeft: Spaces.LG }} />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            // No height specified for Android - will use default height
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='programs'
                options={{
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            // No height specified for Android - will use default height
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Plans',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'plan-active' : 'plan-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='on-demand'
                options={{
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            // No height specified for Android - will use default height
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Solos',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'lightning-active' : 'lightning-inactive'} size={23} color={color} />,
                }}
            />
            <Tabs.Screen
                name='progress'
                options={{
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            // No height specified for Android - will use default height
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Progress',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'progress-active' : 'progress-inactive'} size={21} color={color} />,
                }}
            />
        </Tabs>
    );
}
