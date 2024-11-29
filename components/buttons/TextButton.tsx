// components/buttons/TextButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle, AccessibilityProps, ActivityIndicator } from 'react-native';
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
    iconName?: string;
    iconPosition?: 'left' | 'right';
    iconSize?: number;
    iconColor?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ViewStyle>;
    textType?: ThemedTextProps['type'];
    size?: 'SM' | 'MD' | 'LG';
    disabled?: boolean;
    accessibilityLabel?: string;
    loading?: boolean;
    children?: React.ReactNode;
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
                    opacity: disabled || loading ? 0.5 : 1,
                    ...buttonPadding,
                },
                style,
            ]}
            onPress={disabled || loading ? undefined : onPress}
            activeOpacity={Opacities.buttonActiveOpacity}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled || loading}
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
