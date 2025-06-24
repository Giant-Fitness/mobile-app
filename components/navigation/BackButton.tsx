// components/navigation/BackButton.tsx

import { Icon } from '@/components/base/Icon';
import { Colors } from '@/constants/Colors';
import { Opacities } from '@/constants/Opacities';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { AccessibilityProps, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { SharedValue } from 'react-native-reanimated';

type BackButtonProps = {
    style?: ViewStyle;
    animatedColor?: SharedValue<string>; // Optional animated color
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
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    // Determine the color to use - prioritize animatedColor, then staticColor, then default
    const iconColor = animatedColor || staticColor || themeColors.iconSelected;

    const handleBackPress = () => {
        trigger('effectClick');

        // Execute custom back handler or default router.back()
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handleBackPress}
            accessibilityLabel={accessibilityLabel}
            activeOpacity={Opacities.buttonActiveOpacity}
        >
            <Icon name='chevron-back' size={moderateScale(iconSize)} color={iconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
    },
});
