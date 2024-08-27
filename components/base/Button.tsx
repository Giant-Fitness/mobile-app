// components/base/Button.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';
import { ThemedText } from '@/components/base/ThemedText';

type ButtonProps = {
    onPress: () => void;
    text?: string;
    iconName?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ViewStyle>;
};

export const Button: React.FC<ButtonProps> = ({ onPress, text, iconName, style, textStyle, iconStyle }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }, style]} onPress={onPress}>
            {iconName && <Icon name={iconName} style={[styles.icon, iconStyle]} />}
            {text && <ThemedText style={[styles.text, textStyle, {color: themeColors.white }]}>{text}</ThemedText>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    icon: {
        marginRight: 8,
    },
});
