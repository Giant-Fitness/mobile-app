// components/navigation/AnimatedHeader.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BackButton } from '@/components/navigation/BackButton';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';

type AnimatedHeaderProps = {
    scrollY: Animated.SharedValue<number>;
    onBackPress?: () => void;
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
    disableColorChange?: boolean;
    title?: string;
    backButtonColor?: string;
    headerBackground?: string;
    menuIcon?: string;
    onMenuPress?: () => void;
    disableBackButtonAnimation?: boolean; // New prop
};

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
    scrollY,
    onBackPress,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 170,
    disableColorChange = false,
    title,
    backButtonColor,
    headerBackground = 'transparent',
    menuIcon = 'more-horizontal',
    disableBackButtonAnimation = false,
    onMenuPress,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

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

    const animatedIconColor = useDerivedValue(() => {
        if (disableColorChange || disableBackButtonAnimation) {
            return backButtonColor || themeColors.text;
        }
        return interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
    });

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <BackButton style={styles.backButton} animatedColor={animatedIconColor} onBackPress={onBackPress} />
            {title && (
                <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                    {title}
                </ThemedText>
            )}
            {onMenuPress && (
                <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={1}>
                    <Icon name={menuIcon} size={22} color={animatedIconColor} />
                </TouchableOpacity>
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
        height: Sizes.headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: Spaces.XXL + Spaces.SM, // Adjusted to account for padding
        left: Spaces.MD, // Adjusted to account for padding
        zIndex: 10,
        padding: Spaces.SM, // Add padding to increase hitbox
    },
    title: {
        top: Spaces.LG,
    },
    menuButton: {
        position: 'absolute',
        top: Spaces.XXL + Spaces.SM, // Adjusted to account for padding
        right: Spaces.LG, // Adjusted to account for padding
        zIndex: 10,
        padding: Spaces.SM, // Add padding to increase hitbox
    },
});

export default AnimatedHeader;
