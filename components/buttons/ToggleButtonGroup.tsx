// components/buttons/ToggleButtonGroup.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

interface ToggleOption {
    key: string;
    label: string;
}

interface ToggleButtonGroupProps {
    options: ToggleOption[];
    selectedKey: string;
    onSelect: (key: string) => void;
    containerStyle?: ViewStyle;
    buttonStyle?: ViewStyle;
    textStyle?: TextStyle;
    haptic?: HapticFeedbackTypes | keyof typeof HapticFeedbackTypes | 'none';
    size?: 'SM' | 'MD';
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
    options,
    selectedKey,
    onSelect,
    containerStyle,
    buttonStyle,
    textStyle,
    haptic = 'selection',
    size = 'MD',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const getButtonStyle = (isSelected: boolean) => {
        const baseStyle = size === 'SM' ? styles.buttonSM : styles.buttonMD;

        return [
            baseStyle,
            {
                backgroundColor: isSelected ? themeColors.buttonPrimary : themeColors.backgroundSecondary,
            },
            buttonStyle,
        ];
    };

    const getTextColor = (isSelected: boolean) => {
        return isSelected ? themeColors.background : themeColors.subText;
    };

    const getTextType = () => {
        return size === 'SM' ? 'bodyXSmall' : 'bodySmall';
    };

    const getContainerStyle = () => {
        return [
            styles.outerContainer,
            {
                backgroundColor: themeColors.backgroundSecondary,
            },
            containerStyle,
        ];
    };

    return (
        <View style={getContainerStyle()}>
            <View style={styles.innerContainer}>
                {options.map((option) => {
                    const isSelected = selectedKey === option.key;

                    return (
                        <TouchableOpacity
                            key={option.key}
                            style={[getButtonStyle(isSelected), styles.button]}
                            onPress={() => {
                                if (haptic !== 'none') {
                                    trigger(haptic);
                                }
                                onSelect(option.key);
                            }}
                            activeOpacity={0.8}
                        >
                            <ThemedText type={getTextType()} style={[{ color: getTextColor(isSelected), textAlign: 'center' }, textStyle]}>
                                {option.label}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        borderRadius: Spaces.SM,
        padding: Spaces.XXS,
    },
    innerContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    buttonMD: {
        flex: 1,
        paddingVertical: Spaces.XS,
        paddingHorizontal: Spaces.SM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSM: {
        flex: 1,
        paddingVertical: Spaces.XXS,
        paddingHorizontal: Spaces.SM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderRadius: Spaces.SM,
    },
});
