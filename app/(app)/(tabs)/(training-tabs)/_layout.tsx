// app/(app)/(tabs)/(training-tabs)/_layout.tsx

import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { View } from 'react-native';

import { withLayoutContext } from 'expo-router';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { trigger } from 'react-native-haptic-feedback';
import { useSharedValue } from 'react-native-reanimated';

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function TrainingLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            {/* Animated Header */}
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Training'
                disableBackButton={true}
                backButtonColor={themeColors.text}
            />

            {/* Top Tabs with adjusted positioning and matching HorizontalTabSwitcher styling */}
            <View
                style={{
                    flex: 1,
                    marginTop: Sizes.headerHeight - Spaces.SM,
                }}
            >
                <TopTabs
                    screenListeners={() => ({
                        tabPress: () => trigger('virtualKey'),
                    })}
                    screenOptions={{
                        tabBarActiveTintColor: themeColors.text,
                        tabBarInactiveTintColor: themeColors.subText,
                        tabBarIndicator: ({ state, layout }) => {
                            // Custom indicator that renders borders for all tabs
                            const tabWidth = layout.width / state.routes.length;

                            return (
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        flexDirection: 'row',
                                    }}
                                >
                                    {state.routes.map((route, index) => (
                                        <View
                                            key={route.key}
                                            style={{
                                                width: tabWidth,
                                                height: 2,
                                                backgroundColor:
                                                    index === state.index
                                                        ? themeColors.text // Active tab
                                                        : themeColors.systemBorderColor, // Inactive tabs: gray border
                                            }}
                                        />
                                    ))}
                                </View>
                            );
                        },
                        tabBarStyle: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 0, // Remove base border to avoid double lines
                        },
                        tabBarItemStyle: {
                            alignItems: 'center',
                        },
                        tabBarLabelStyle: {
                            fontWeight: '500',
                            textAlign: 'center',
                            fontSize: 14,
                        },
                        tabBarContentContainerStyle: {
                            justifyContent: 'center',
                        },
                        swipeEnabled: false,
                    }}
                >
                    <TopTabs.Screen
                        name='programs'
                        options={{
                            title: 'Programs',
                        }}
                    />
                    <TopTabs.Screen
                        name='solos'
                        options={{
                            title: 'Solos',
                        }}
                    />
                </TopTabs>
            </View>
        </View>
    );
}
