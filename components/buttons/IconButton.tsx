// components/buttons/IconButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, AccessibilityProps } from 'react-native';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { moderateScale } from '@/utils/scaling';
import { Sizes } from '@/constants/Sizes';
import { Opacities } from '@/constants/Opacities';

type IconButtonProps = {
    onPress: () => void;
    iconName: string;
    iconSize?: number; // Default size will be applied if not provided
    iconColor?: string; // Default color if not provided
    disabled?: boolean;
    size?: 'SM' | 'MD' | 'LG'; // Variants for button size
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string; // Accessibility label for screen readers
};

export const IconButton: React.FC<IconButtonProps & AccessibilityProps> = ({
    onPress,
    iconName,
    iconSize = Sizes.iconSizeDefault,
    iconColor,
    size = 'MD', // Default size
    style,
    disabled = false,
    accessibilityLabel = 'Icon button', // Default accessibility label
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Button size based on the `size` prop
    const buttonDimensions = {
        SM: Sizes.iconButtonSM,
        MD: Sizes.iconButtonMD,
        LG: Sizes.iconButtonLG,
    }[size];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    width: buttonDimensions,
                    height: buttonDimensions,
                    borderRadius: buttonDimensions / 2,
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.systemBorderColor,
                },
                style,
            ]}
            onPress={onPress}
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
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
});
