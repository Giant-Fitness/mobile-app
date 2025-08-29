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

    // Function to conditionally show profile header
    const getHeaderRight = (routeName: string) => {
        if (routeName === 'profile') {
            const ProfileHeaderLeft = () => (
                <TouchableOpacity activeOpacity={1} onPress={handleSettingPress}>
                    <Icon name='settings' size={Sizes.iconSizeDefault} color={themeColors.iconDefault} style={{ marginRight: Spaces.LG }} />
                </TouchableOpacity>
            );
            ProfileHeaderLeft.displayName = 'ProfileHeaderLeft';
            return ProfileHeaderLeft;
        }
        return undefined;
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
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'home-active' : 'home-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='(training-tabs)'
                options={{
                    headerStyle: Platform.select({
                        ios: {
                            backgroundColor: themeColors.background,
                            height: Sizes.headerHeight,
                            shadowColor: 'transparent',
                            borderBottomWidth: 0,
                        },
                        android: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                        },
                    }),
                    headerTitleStyle: { color: themeColors.text, fontSize: moderateScale(16) },
                    title: 'Training',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'training-active' : 'training-inactive'} size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name='food-log'
                options={{
                    headerShown: false,
                    title: 'Food Log',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'food-log-active' : 'food-log-inactive'} size={20} color={color} />,
                }}
            />
            <Tabs.Screen
                name='profile'
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
                        },
                    }),
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'profile-active' : 'profile-inactive'} size={24} color={color} />,
                    headerRight: getHeaderRight('profile'),
                }}
            />
        </Tabs>
    );
}
