// components/navigation/BackButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, AccessibilityProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/base/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Opacities } from '@/constants/Opacities';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

type BackButtonProps = {
    style?: ViewStyle;
    animatedColor?: Animated.SharedValue<string>; // Optional animated color
    staticColor?: string; // Optional static color
    iconSize?: number; // Allows custom icon Sizes
    onBackPress?: () => void; // Custom onPress handler
    accessibilityLabel?: string; // Accessibility label for screen readers
};

export const BackButton: React.FC<BackButtonProps & AccessibilityProps> = ({
    style,
    animatedColor,
    staticColor,
    iconSize = Sizes.iconSizeMD, // Default icon size from Sizes utility
    onBackPress,
    accessibilityLabel = 'Go back', // Default accessibility label
}) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    const defaultIconColor = staticColor || themeColors.iconSelected; // Use static color if provided
    const AnimatedIcon = Animated.createAnimatedComponent(Icon);

    // Animated props to update the color dynamically if animatedColor is provided
    const animatedProps = animatedColor
        ? useAnimatedProps(() => ({
              color: animatedColor.value,
          }))
        : undefined; // No animated props if animatedColor is not provided

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onBackPress || (() => navigation.goBack())}
            accessibilityLabel={accessibilityLabel}
            activeOpacity={Opacities.buttonActiveOpacity}
        >
            <AnimatedIcon name='chevron-back' size={moderateScale(iconSize)} color={defaultIconColor} animatedProps={animatedProps} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
    },
});
