// components/base/TextButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';
import { ThemedText } from '@/components/base/ThemedText';

type TextButtonProps = {
    onPress: () => void;
    text?: string;
    iconName?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ViewStyle>;
    textType?: string;
};

export const TextButton: React.FC<TextButtonProps> = ({ onPress, text, style, textStyle, textType }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }, style]} onPress={onPress} activeOpacity={1}>
            <ThemedText type={textType} style={[styles.text, textStyle, { color: themeColors.background }]}>
                {text}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
