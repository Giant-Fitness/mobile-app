// components/base/CustomBackButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

type CustomBackButtonProps = {
    style?: ViewStyle;
    animatedColor?: Animated.SharedValue<string>; // Optional animated color
    staticColor?: string; // Optional static color
    onBackPress?: () => void;
};

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({ style, animatedColor, staticColor, onBackPress }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    const defaultIconColor = themeColors.iconSelected;
    const AnimatedIcon = Animated.createAnimatedComponent(Icon);

    // Animated props to update the color dynamically if animatedColor is provided
    const animatedProps = animatedColor
        ? useAnimatedProps(() => ({
              color: animatedColor.value,
          }))
        : undefined; // No animated props if animatedColor is not provided

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onBackPress || (() => navigation.goBack())}>
            <AnimatedIcon name='chevron-back' size={moderateScale(22)} color={defaultIconColor} animatedProps={animatedProps} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
});
