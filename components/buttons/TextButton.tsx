// components/buttons/TextButton.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Opacities } from '@/constants/Opacities';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { AccessibilityProps, ActivityIndicator, StyleProp, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

type TextButtonProps = {
    onPress: () => void;
    text?: string;
    iconName?: string;
    iconPosition?: 'left' | 'right';
    iconSize?: number;
    iconColor?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<TextStyle>;
    textType?: ThemedTextProps['type'];
    size?: 'SM' | 'MD' | 'LG';
    disabled?: boolean;
    accessibilityLabel?: string;
    loading?: boolean;
    children?: React.ReactNode;
    haptic?: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes | 'none';
    hitSlop?: { top: number; right: number; bottom: number; left: number };
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
    textType = 'body',
    size = 'MD',
    disabled = false,
    accessibilityLabel = text || 'Text button',
    loading = false,
    children,
    haptic = 'none',
    hitSlop,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

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
                    backgroundColor: disabled || loading ? themeColors.background : themeColors.background,
                    borderColor: themeColors.text,
                    opacity: disabled || loading ? 0.2 : 1,
                    ...buttonPadding,
                },
                style,
            ]}
            onPress={
                disabled || loading
                    ? undefined
                    : () => {
                          if (haptic !== 'none') {
                              trigger(haptic);
                          }
                          onPress();
                      }
            }
            activeOpacity={Opacities.buttonActiveOpacity}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled || loading}
            hitSlop={hitSlop}
        >
            {loading ? (
                <ActivityIndicator size='small' color={themeColors.text} />
            ) : children ? (
                children
            ) : (
                <>
                    {iconName && iconPosition === 'left' && (
                        <Icon
                            name={iconName}
                            size={moderateScale(iconSize)}
                            color={iconColor || themeColors.text}
                            style={[styles.icon, { marginRight: Spaces.SM, marginBottom: Spaces.XXS }, iconStyle]}
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
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spaces.XL,
        borderWidth: StyleSheet.hairlineWidth,
    },
    text: {
        fontSize: Sizes.fontSizeDefault,
    },
    icon: {
        alignSelf: 'center',
    },
});
