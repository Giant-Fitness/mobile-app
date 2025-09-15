// app/(app)/(tabs)/_layout.tsx

import { Icon } from '@/components/base/Icon';
import { QuickAddModal } from '@/components/overlays/QuickAddModal';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha } from '@/utils/colorUtils';
import React, { useState } from 'react';
import { Platform, Pressable, TouchableOpacity } from 'react-native';

import { Tabs } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

export default function TabLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);

    const handleQuickActionPress = () => {
        trigger('effectClick');
        setQuickActionModalVisible(true);
    };

    return (
        <>
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
                    lazy: true,
                    tabBarItemStyle: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        ...Platform.select({
                            ios: {
                                paddingVertical: Spaces.SM,
                            },
                            android: {},
                        }),
                    },
                    tabBarLabelStyle: Platform.select({
                        ios: {
                            marginTop: Spaces.XS,
                        },
                        android: {},
                    }),
                    headerTitleContainerStyle: {
                        paddingLeft: 0,
                    },
                    headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
                    headerTitleAlign: 'center',
                    headerShown: true,
                    tabBarShowLabel: true,
                }}
            >
                <Tabs.Screen
                    name='home'
                    options={{
                        headerShown: false,
                        title: 'Home',
                        tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={22} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name='(training-tabs)'
                    options={{
                        headerShown: false,
                        title: 'Training',
                        tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'training-active' : 'training-inactive'} size={22} color={color} />,
                    }}
                />
                {/* Quick Action Tab - with fixed circular button */}
                <Tabs.Screen
                    name='quick-action'
                    options={{
                        tabBarShowLabel: false,
                        tabBarButton: (props) => {
                            const buttonSize = 40;
                            return (
                                <TouchableOpacity
                                    onPress={handleQuickActionPress}
                                    style={[
                                        {
                                            width: buttonSize,
                                            height: buttonSize,
                                            borderRadius: buttonSize / 2,
                                            backgroundColor: addAlpha(themeColors.iconSelected, 0.85),
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            ...Platform.select({
                                                ios: {
                                                    marginTop: 6,
                                                },
                                                android: {
                                                    marginTop: 8,
                                                },
                                            }),
                                        },
                                        props.style && { width: buttonSize, height: buttonSize },
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Icon name='plus' size={20} color={themeColors.background} />
                                </TouchableOpacity>
                            );
                        },
                    }}
                />
                <Tabs.Screen
                    name='food-log'
                    options={{
                        headerShown: false,
                        title: 'Food Diary',
                        tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'food-log-active' : 'food-log-inactive'} size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        headerShown: false,
                        title: 'Profile',
                        tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'profile-active' : 'profile-inactive'} size={24} color={color} />,
                    }}
                />
            </Tabs>

            {/* Quick Action Modal */}
            <QuickAddModal visible={quickActionModalVisible} onClose={() => setQuickActionModalVisible(false)} />
        </>
    );
}
