// components/base/TextButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { ThemedTextProps } from '@/components/base/ThemedText'; // Add this import

type TextButtonProps = {
    onPress: () => void;
    text?: string;
    iconName?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ViewStyle>;
    textType?: ThemedTextProps['type'];
};

export const TextButton: React.FC<TextButtonProps> = ({ onPress, text, style, textStyle, textType }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.buttonPrimary }, style]} onPress={onPress} activeOpacity={1}>
            <ThemedText type={textType} style={[styles.text, { color: themeColors.buttonPrimaryText }, textStyle]}>
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
        borderRadius: spacing.xl,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: moderateScale(14),
    },
});
