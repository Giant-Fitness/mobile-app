// components/buttons/PrimaryButton.tsx

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

type PrimaryButtonProps = {
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

export const PrimaryButton: React.FC<PrimaryButtonProps & AccessibilityProps> = ({
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
    accessibilityLabel = text || 'Primary button', // Fallback to text for accessibility label
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Define button dimensions based on size prop
    const buttonPadding = {
        SM: { paddingVertical: Spaces.XS, paddingHorizontal: Spaces.SM, borderRadius: Spaces.XL },
        MD: { paddingVertical: Spaces.SM, paddingHorizontal: Spaces.MD, borderRadius: Spaces.XL },
        LG: { paddingVertical: Spaces.MD, paddingHorizontal: Spaces.LG, borderRadius: Spaces.XL },
    }[size];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? themeColors.buttonDisabled : themeColors.buttonPrimary, // Solid color for primary action
                    opacity: disabled ? Opacities.disabled : 1,
                    ...buttonPadding,
                },
                style,
            ]}
            onPress={disabled ? undefined : onPress}
            activeOpacity={1}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
        >
            {iconName && iconPosition === 'left' && (
                <Icon
                    name={iconName}
                    size={moderateScale(iconSize)}
                    color={iconColor || themeColors.buttonPrimaryText}
                    style={[styles.icon, iconStyle, { marginRight: Spaces.SM }]}
                />
            )}

            <ThemedText type={textType} style={[styles.text, { color: themeColors.buttonPrimaryText }, textStyle]}>
                {text}
            </ThemedText>

            {iconName && iconPosition === 'right' && (
                <Icon
                    name={iconName}
                    size={moderateScale(iconSize)}
                    color={iconColor || themeColors.buttonPrimaryText}
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: Sizes.fontSizeDefault,
    },
    icon: {
        alignSelf: 'center',
    },
});
