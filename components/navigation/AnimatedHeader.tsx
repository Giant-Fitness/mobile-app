// components/navigation/AnimatedHeader.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BackButton } from '@/components/navigation/BackButton';
import { Spaces } from '@/constants/Spaces';
import { ThemedText } from '@/components/base/ThemedText';

type AnimatedHeaderProps = {
    scrollY: Animated.SharedValue<number>;
    onBackPress?: () => void;
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
    disableColorChange?: boolean;
    title?: string; // Optional title prop
    backButtonColor?: string;
    headerBackground?: string;
};

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
    scrollY,
    onBackPress,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 170,
    disableColorChange = false,
    title, // Destructure the title prop
    backButtonColor,
    headerBackground = 'transparent',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    // Determine background color style
    const animatedHeaderStyle = useAnimatedStyle(() => {
        if (disableColorChange) {
            return { backgroundColor: headerBackground || 'transparent' };
        }

        const backgroundColor = interpolateColor(
            scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            [themeColors.transparent, themeColors.background],
        );
        return { backgroundColor };
    });

    // Determine icon color
    const animatedIconColor = useDerivedValue(() => {
        if (disableColorChange) {
            return backButtonColor || themeColors.text;
        }

        const color = interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
        return color;
    });

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <BackButton style={styles.backButton} animatedColor={animatedIconColor} onBackPress={onBackPress} />
            {title && (
                <ThemedText type='link' style={[styles.title, { color: themeColors.text }]}>
                    {title}
                </ThemedText>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: Spaces.XXL,
        left: Spaces.MD,
        zIndex: 10,
    },
    title: {
        top: Spaces.MD,
    },
});

export default AnimatedHeader;
