// components/buttons/SelectionButton.tsx

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { trigger } from 'react-native-haptic-feedback';

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
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    subTextStyle?: TextStyle;
    iconStyle?: ViewStyle;
    haptic?: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'rigid' | 'soft' | 'notificationError' | 'notificationSuccess' | 'notificationWarning' | 'none';
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
    option,
    isSelected,
    onSelect,
    containerStyle,
    textStyle,
    subTextStyle,
    iconStyle,
    haptic = 'none',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const buttonStyle = [
        styles.button,
        {
            backgroundColor: isSelected ? themeColors.buttonPrimary : themeColors.backgroundTertiary,
            borderColor: isSelected ? themeColors.systemBorderColor : themeColors.systemBorderColor,
        },
        containerStyle,
    ];

    const textColor = isSelected ? themeColors.buttonPrimaryText : themeColors.text;

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={() => {
                if (haptic !== 'none') {
                    trigger(haptic);
                }
                onSelect(option.key);
            }}
            activeOpacity={0.9}
        >
            {option.icon && (
                <View style={[styles.iconContainer, iconStyle]}>
                    <Icon name={option.icon} size={Spaces.MD} color={textColor} />
                </View>
            )}
            <View style={styles.textContainer}>
                <ThemedText type='overline' style={[{ color: textColor, textAlign: 'center' }, textStyle]}>
                    {option.text}
                </ThemedText>
                {option.subText && (
                    <ThemedText type='bodyXSmall' style={[styles.subText, { color: textColor, textAlign: 'center' }, subTextStyle]}>
                        {option.subText}
                    </ThemedText>
                )}
            </View>
        </TouchableOpacity>
    );
};

interface SelectionGroupProps {
    options: SelectionOption[];
    selectedKeys: string[];
    onSelect: (key: string) => void;
    multiSelect?: boolean;
    containerStyle?: ViewStyle;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    subTextStyle?: TextStyle;
    iconStyle?: ViewStyle;
}

export const SelectionGroup: React.FC<SelectionGroupProps> = ({
    options,
    selectedKeys,
    onSelect,
    multiSelect = false,
    containerStyle,
    buttonStyle,
    textStyle,
    subTextStyle,
    iconStyle,
}) => {
    const handleSelect = (key: string) => {
        if (multiSelect) {
            onSelect(key);
        } else {
            onSelect(selectedKeys[0] === key ? '' : key);
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {options.map((option) => (
                <SelectionButton
                    key={option.key}
                    option={option}
                    isSelected={selectedKeys.includes(option.key)}
                    onSelect={handleSelect}
                    containerStyle={buttonStyle}
                    textStyle={textStyle}
                    subTextStyle={subTextStyle}
                    iconStyle={iconStyle}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spaces.MD,
        borderRadius: Spaces.SM,
        borderWidth: 0,
        marginBottom: Spaces.MD,
        opacity: 0.9,
    },
    iconContainer: {
        marginRight: Spaces.SM,
    },
    textContainer: {
        flex: 1,
    },
    subText: {
        marginTop: Spaces.XS,
        marginHorizontal: Spaces.LG,
    },
});
