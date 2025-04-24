// components/buttons/PrimaryButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle, AccessibilityProps, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ThemedTextProps } from '@/components/base/ThemedText';

type PrimaryButtonProps = {
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
    textType = 'body',
    size = 'MD',
    disabled = false,
    accessibilityLabel = text || 'Primary button',
    loading = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

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
                    backgroundColor: disabled || loading ? themeColors.buttonPrimary : themeColors.buttonPrimary,
                    opacity: disabled || loading ? 0.2 : 1,
                    ...buttonPadding,
                },
                style,
            ]}
            onPress={disabled || loading ? undefined : onPress}
            activeOpacity={1}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator size='small' color={themeColors.buttonPrimaryText} />
            ) : (
                <>
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
