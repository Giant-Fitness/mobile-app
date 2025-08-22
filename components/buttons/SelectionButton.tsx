// components/buttons/SelectionButton.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

interface SelectionOption {
    key: string;
    text: string;
    subText?: string;
    icon?: string;
}

interface SelectionButtonProps {
    option: SelectionOption;
    isSelected: boolean;
    onSelect: (key: string) => void;
    variant?: 'radio' | 'chip';
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    subTextStyle?: TextStyle;
    iconStyle?: ViewStyle;
    haptic?: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes | 'none';
    size?: 'SM' | 'MD';
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
    option,
    isSelected,
    onSelect,
    variant = 'radio',
    containerStyle,
    textStyle,
    subTextStyle,
    iconStyle,
    haptic = 'selection',
    size = 'MD',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const getButtonStyle = () => {
        if (variant === 'chip') {
            return [
                styles.chipButton,
                {
                    backgroundColor: isSelected ? themeColors.buttonPrimary : themeColors.background,
                    borderColor: isSelected ? themeColors.buttonPrimary : themeColors.systemBorderColor,
                },
                containerStyle,
            ];
        }

        return [
            styles.radioButton,
            {
                backgroundColor: themeColors.background,
                borderColor: isSelected ? themeColors.iconSelected : themeColors.systemBorderColor,
                borderWidth: isSelected ? 1.2 : 1,
            },
            containerStyle,
        ];
    };

    const getTextColor = () => {
        if (variant === 'chip') {
            return isSelected ? themeColors.background : themeColors.subText;
        }
        return isSelected ? themeColors.text : themeColors.subText;
    };

    const getSubtextColor = () => {
        if (variant === 'chip') {
            return isSelected ? themeColors.background : themeColors.subText;
        }
        return isSelected ? themeColors.subText : addAlpha(themeColors.subText, 0.7);
    };

    const getTextType = () => {
        if (size === 'SM') {
            return 'bodySmall';
        }
        return 'overline';
    };

    const getRadioSize = () => {
        if (size === 'SM') {
            return 16;
        }
        return 20;
    };

    const textColor = getTextColor();
    const subtextColor = getSubtextColor();
    const textType = getTextType();
    const radioSize = getRadioSize();

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={() => {
                if (haptic !== 'none') {
                    trigger(haptic);
                }
                onSelect(option.key);
            }}
            activeOpacity={variant === 'chip' ? 0.8 : 0.9}
        >
            {variant === 'radio' ? (
                <>
                    <View style={styles.leftContent}>
                        {option.icon && (
                            <View style={[styles.iconContainer, iconStyle]}>
                                <Icon name={option.icon} size={Sizes.iconSizeDefault} color={isSelected ? themeColors.iconSelected : themeColors.subText} />
                            </View>
                        )}
                        <View style={styles.textContainer}>
                            <ThemedText type={textType} style={[{ color: textColor, textAlign: 'left' }, textStyle]}>
                                {option.text}
                            </ThemedText>
                            {option.subText && (
                                <ThemedText type='bodyXSmall' style={[styles.subText, { color: subtextColor, textAlign: 'left' }, subTextStyle]}>
                                    {option.subText}
                                </ThemedText>
                            )}
                        </View>
                    </View>

                    <View style={styles.radioContainer}>
                        <Icon
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={radioSize}
                            color={isSelected ? themeColors.iconSelected : themeColors.systemBorderColor}
                        />
                    </View>
                </>
            ) : (
                <View style={styles.chipContent}>
                    {option.icon && (
                        <View style={[styles.chipIconContainer, iconStyle]}>
                            <Icon name={option.icon} size={Sizes.iconSizeSM} color={textColor} />
                        </View>
                    )}
                    <ThemedText type='bodyXSmall' style={[{ color: textColor, textAlign: 'center' }, textStyle]}>
                        {option.text}
                    </ThemedText>
                </View>
            )}
        </TouchableOpacity>
    );
};

interface SelectionGroupProps {
    options: SelectionOption[];
    selectedKeys: string[];
    onSelect: (key: string) => void;
    multiSelect?: boolean;
    variant?: 'radio' | 'chip';
    layout?: 'row' | 'column';
    containerStyle?: ViewStyle;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    subTextStyle?: TextStyle;
    iconStyle?: ViewStyle;
    size?: 'SM' | 'MD';
}

export const SelectionGroup: React.FC<SelectionGroupProps> = ({
    options,
    selectedKeys,
    onSelect,
    multiSelect = false,
    variant = 'radio',
    layout = 'column',
    containerStyle,
    buttonStyle,
    textStyle,
    subTextStyle,
    iconStyle,
    size = 'MD',
}) => {
    const handleSelect = (key: string) => {
        if (multiSelect) {
            onSelect(key);
        } else {
            onSelect(selectedKeys[0] === key ? '' : key);
        }
    };

    const getContainerStyle = () => {
        if (layout === 'row') {
            return [styles.rowContainer, containerStyle];
        }
        return [styles.columnContainer, containerStyle];
    };

    // For radio buttons in row layout, we need different button styling
    const getButtonStyleForLayout = () => {
        if (variant === 'radio' && layout === 'row') {
            return StyleSheet.flatten([styles.radioInRowButton, buttonStyle]);
        }
        return buttonStyle;
    };

    return (
        <View style={getContainerStyle()}>
            {options.map((option) => (
                <SelectionButton
                    key={option.key}
                    option={option}
                    isSelected={selectedKeys.includes(option.key)}
                    onSelect={handleSelect}
                    variant={variant}
                    containerStyle={StyleSheet.flatten([layout === 'row' && variant === 'chip' && styles.chipInRow, getButtonStyleForLayout()])}
                    textStyle={textStyle}
                    subTextStyle={subTextStyle}
                    iconStyle={iconStyle}
                    size={size}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // Column layout (default)
    columnContainer: {
        width: '100%',
    },

    // Row layout
    rowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spaces.SM,
    },

    // Radio button variant styles
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: Spaces.XS,
        borderWidth: 0,
        opacity: 0.9,
        paddingVertical: Spaces.MD + Spaces.XXS,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40, // Fixed width for consistent alignment
        alignItems: 'center', // Center the icon within the container
        justifyContent: 'center',
        marginRight: Spaces.SM,
    },
    textContainer: {
        flex: 1,
        marginRight: Spaces.SM,
    },
    subText: {},
    radioContainer: {},

    // Chip variant styles
    chipButton: {
        paddingVertical: Spaces.SM,
        borderWidth: moderateScale(0.8),
        borderRadius: Spaces.XS,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spaces.MD,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipIconContainer: {},
    chipInRow: {
        flex: 1,
        marginBottom: 0,
    },

    // Radio buttons in row layout
    radioInRowButton: {
        flex: 1,
        marginBottom: 0,
        paddingVertical: Spaces.SM,
    },
});
