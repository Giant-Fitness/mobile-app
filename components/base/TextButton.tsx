// components/base/TextButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

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
        borderRadius: spacing.xl,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    text: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
});
