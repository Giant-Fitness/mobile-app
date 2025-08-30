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
                    marginTop: Sizes.headerHeight - Spaces.MD,
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
                            backgroundColor: themeColors.subTextSecondary,
                            height: 1.5,
                        },
                        tabBarStyle: {
                            backgroundColor: themeColors.background,
                            elevation: 0,
                            shadowOpacity: 0,
                        },
                        tabBarLabelStyle: {
                            fontWeight: '500',
                        },
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
