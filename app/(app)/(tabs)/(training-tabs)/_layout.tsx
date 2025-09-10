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

            {/* Top Tabs with adjusted positioning */}
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
                        tabBarIndicatorStyle: {
                            backgroundColor: themeColors.text,
                            height: 1,
                        },
                        tabBarStyle: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 0.2,
                            borderBottomColor: themeColors.subTextSecondary, // or any border color you prefer
                        },
                        tabBarItemStyle: {
                            paddingHorizontal: Spaces.MD,
                            // width: 'auto', // Let tabs size themselves
                            alignItems: 'center',
                        },
                        tabBarLabelStyle: {
                            fontWeight: '500',
                            textAlign: 'left',
                        },
                        tabBarContentContainerStyle: {
                            justifyContent: 'center', // Left align the entire tab bar content
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
