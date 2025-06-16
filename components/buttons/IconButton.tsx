// components/buttons/IconButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, AccessibilityProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { moderateScale } from '@/utils/scaling';
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

type IconButtonProps = {
    onPress: () => void;
    iconName: string;
    iconSize?: number; // Default size will be applied if not provided
    iconColor?: string | SharedValue<string>; // Now supports animated colors while maintaining backwards compatibility
    disabled?: boolean;
    size?: number; // Variants for button size
    style?: StyleProp<ViewStyle>;
    addBorder?: boolean;
    backgroundColor?: string; // Control background color
    accessibilityLabel?: string; // Accessibility label for screen readers
    haptic?: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes | 'none';
};

export const IconButton: React.FC<IconButtonProps & AccessibilityProps> = ({
    onPress,
    iconName,
    iconSize = 30,
    iconColor,
    size = 30, // Default size
    style,
    addBorder = true,
    backgroundColor,
    disabled = false,
    accessibilityLabel = 'Icon button', // Default accessibility label
    haptic = 'none',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Button size based on the `size` prop
    const buttonDimensions = size;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    width: buttonDimensions,
                    height: buttonDimensions,
                    borderRadius: buttonDimensions / 2,
                    backgroundColor: backgroundColor || (addBorder ? themeColors.background : 'transparent'),
                    borderColor: addBorder ? themeColors.systemBorderColor : 'transparent',
                },
                style,
            ]}
            onPress={() => {
                if (haptic !== 'none') {
                    trigger(haptic);
                }
                onPress();
            }}
            accessibilityLabel={accessibilityLabel}
            activeOpacity={1}
            disabled={disabled}
        >
            <Icon name={iconName} size={moderateScale(iconSize)} color={iconColor || themeColors.iconDefault} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
});
