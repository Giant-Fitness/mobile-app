// components/buttons/TextButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle, AccessibilityProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Opacities } from '@/constants/Opacities';
import { ThemedTextProps } from '@/components/base/ThemedText';

type TextButtonProps = {
    onPress: () => void;
    text?: string;
    iconName?: string; // Optional icon to be displayed with text
    iconPosition?: 'left' | 'right'; // Icon position relative to text
    iconSize?: number;
    iconColor?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ViewStyle>;
    textType?: ThemedTextProps['type']; // For themed text
    size?: 'SM' | 'MD' | 'LG'; // Button size variants
    disabled?: boolean; // Disable button
    accessibilityLabel?: string; // Accessibility label for screen readers
};

export const TextButton: React.FC<TextButtonProps & AccessibilityProps> = ({
    onPress,
    text,
    iconName,
    iconPosition = 'left',
    iconSize = Sizes.iconSizeDefault,
    iconColor,
    style,
    textStyle,
    iconStyle,
    textType = 'body', // Default text type
    size = 'MD',
    disabled = false,
    accessibilityLabel = text || 'Text button', // Fallback to text for accessibility label
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    // Define button dimensions based on size prop
    const buttonPadding = {
        SM: { paddingVertical: Spaces.SM, paddingHorizontal: Spaces.SM },
        MD: { paddingVertical: Spaces.SM, paddingHorizontal: Spaces.MD },
        LG: { paddingVertical: Spaces.MD, paddingHorizontal: Spaces.LG },
    }[size];
    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? themeColors.buttonDisabled : themeColors.background,
                    borderColor: themeColors.text,
                    opacity: disabled ? Opacities.disabled : 1,
                    ...buttonPadding,
                },
                style,
            ]}
            onPress={disabled ? undefined : onPress}
            activeOpacity={Opacities.buttonActiveOpacity}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
        >
            {iconName && iconPosition === 'left' && (
                <Icon
                    name={iconName}
                    size={moderateScale(iconSize)}
                    color={iconColor || themeColors.text}
                    style={[styles.icon, iconStyle, { marginRight: Spaces.SM, marginBottom: Spaces.XXS }]}
                />
            )}

            <ThemedText type={textType} style={[styles.text, { color: themeColors.text }, textStyle]}>
                {text}
            </ThemedText>

            {iconName && iconPosition === 'right' && (
                <Icon
                    name={iconName}
                    size={moderateScale(iconSize)}
                    color={iconColor || themeColors.text}
                    style={[styles.icon, iconStyle, { marginLeft: Spaces.XS }]}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spaces.XL, // Rounded corners
        borderWidth: StyleSheet.hairlineWidth,
    },
    text: {
        fontSize: Sizes.fontSizeDefault,
    },
    icon: {
        alignSelf: 'center',
    },
});
