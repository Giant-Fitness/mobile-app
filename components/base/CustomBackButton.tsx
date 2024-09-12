import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

type CustomBackButtonProps = {
    style?: ViewStyle;
    animatedColor?: Animated.SharedValue<string>; // Optional animated color
    staticColor?: string; // Optional static color
    onBackPress?: () => void;
};

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({ style, animatedColor, staticColor, onBackPress }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const defaultIconColor = themeColors.iconSelected;

    // Animated props to update the color dynamically if animatedColor is provided
    const animatedProps = animatedColor
        ? useAnimatedProps(() => ({
              color: animatedColor.value,
          }))
        : undefined; // No animated props if animatedColor is not provided

    // Determine final color: use animated color if available, else use static color or default color
    const finalColor = animatedColor ? undefined : staticColor || defaultIconColor;

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onBackPress || (() => navigation.goBack())}>
            <Animated.View style={animatedProps ? animatedProps : {}}>
                <Icon name='chevron-back' size={moderateScale(22)} color={finalColor} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
});
