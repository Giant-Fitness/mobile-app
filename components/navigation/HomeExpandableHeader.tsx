// components/navigation/HomeExpandableHeader.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

type HomeExpandableHeaderProps = {
    scrollY: Animated.SharedValue<number>;
    greeting: string;
    expandedHeight?: number;
};

const formatDateHumanFriendly = (): string => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
};

export const HomeExpandableHeader: React.FC<HomeExpandableHeaderProps> = ({
    scrollY,
    greeting,
    expandedHeight = Sizes.headerHeight + 40, // Default expanded height
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const collapsedHeight = Sizes.headerHeight;
    const shrinkDistance = expandedHeight - collapsedHeight; // How much we can shrink

    // Get today's date in human-friendly format
    const todaysDate = formatDateHumanFriendly();

    // Header container - shrinks at exact scroll speed
    const headerAnimatedStyle = useAnimatedStyle(() => {
        // Direct 1:1 relationship with scroll - no spring, no timing
        const height = interpolate(
            scrollY.value,
            [0, shrinkDistance], // Shrink over exactly the shrink distance
            [expandedHeight, collapsedHeight],
            'clamp',
        );

        return {
            height,
            backgroundColor: themeColors.background,
        };
    });

    // Greeting container - creates the "eaten up" effect with proper clipping
    const greetingContainerStyle = useAnimatedStyle(() => {
        // Calculate available space for greeting text
        const availableHeight = interpolate(
            scrollY.value,
            [0, shrinkDistance],
            [expandedHeight - Spaces.MD - 44, 0], // Subtract top padding and bottom margin
            'clamp',
        );

        // Fade out as space decreases
        const opacity = interpolate(
            scrollY.value,
            [0, shrinkDistance * 0.7], // Start fading earlier for smoother transition
            [1, 0],
            'clamp',
        );

        return {
            height: Math.max(0, availableHeight),
            opacity,
        };
    });

    // Greeting text positioning - stays at bottom of its container
    const greetingTextStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: 0 }], // No translation needed now
        };
    });

    // "Home" title - appears only when header reaches collapsed size
    const homeTitleAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [shrinkDistance * 0.8, shrinkDistance], // Appear near the end
            [0, 1],
            'clamp',
        );

        return {
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            {/* Greeting content that gets "eaten" by height reduction */}
            <Animated.View style={[styles.greetingContainer, greetingContainerStyle]}>
                <Animated.View style={[styles.greetingTextContainer, greetingTextStyle]}>
                    <ThemedText type='caption' style={[styles.dateText, { color: themeColors.subText }]}>
                        {todaysDate}
                    </ThemedText>
                    <ThemedText type='greeting' style={[styles.greeting, { color: themeColors.text }]}>
                        {greeting}
                    </ThemedText>
                </Animated.View>
            </Animated.View>

            {/* Collapsed "Home" title */}
            <Animated.View style={[styles.homeTitleContainer, homeTitleAnimatedStyle]}>
                <ThemedText type='title' style={[styles.homeTitle, { color: themeColors.text }]}>
                    Home
                </ThemedText>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'transparent',
        overflow: 'hidden', // Critical: clips content that extends beyond bounds
        ...Platform.select({
            ios: {
                paddingTop: 44, // Status bar height
            },
            android: {
                paddingTop: 24, // Status bar height
            },
        }),
    },
    greetingContainer: {
        position: 'absolute',
        bottom: 0, // Always stick to bottom
        left: 0,
        right: 0,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XS,
        overflow: 'hidden', // Clips content as container shrinks
        justifyContent: 'flex-end', // Keep text at bottom of container
    },
    greetingTextContainer: {
        // Container for the actual text
    },
    dateText: {
        textAlign: 'left',
        marginBottom: Spaces.XS / 2, // Small space between date and greeting
        textTransform: 'uppercase',
    },
    greeting: {
        textAlign: 'left',
    },
    homeTitleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Sizes.headerHeight,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                paddingTop: 44, // Status bar height
            },
            android: {
                paddingTop: 24, // Status bar height
            },
        }),
    },
    homeTitle: {
        textAlign: 'center',
        ...Platform.select({
            ios: {
                marginTop: Spaces.SM, // Fine-tune positioning
            },
            android: {
                marginTop: Spaces.XS,
            },
        }),
    },
});
