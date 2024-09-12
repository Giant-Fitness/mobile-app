import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CustomBackButton } from '@/components/base/CustomBackButton';
import { spacing } from '@/utils/spacing';

type AnimatedHeaderProps = {
    scrollY: Animated.SharedValue<number>;
    onBackPress?: () => void;
    headerInterpolationStart?: number; // Start point for header background animation
    headerInterpolationEnd?: number; // End point for header background animation
    disableColorChange?: boolean; // New prop to disable color change
};

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
    scrollY,
    onBackPress,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 170,
    disableColorChange = false, // Default is false
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // Determine background color style
    const animatedHeaderStyle = useAnimatedStyle(() => {
        if (disableColorChange) {
            // If color change is disabled, use a fixed background color
            return { backgroundColor: 'transparent' }; // Or use a specific color
        }

        // Otherwise, interpolate color based on scroll value
        const backgroundColor = interpolateColor(
            scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            ['rgba(255, 255, 255, 0)', themeColors.background],
        );
        return { backgroundColor };
    });

    // Determine icon color
    const animatedIconColor = useDerivedValue(() => {
        if (disableColorChange) {
            // If color change is disabled, use a fixed icon color
            return themeColors.text; // Or any desired static color
        }

        // Otherwise, interpolate icon color based on scroll value
        const color = interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
        return color;
    });

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <CustomBackButton style={styles.backButton} animatedColor={animatedIconColor} onBackPress={onBackPress} />
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        top: spacing.xxl,
        left: spacing.md,
        zIndex: 10,
    },
});

export default AnimatedHeader;
