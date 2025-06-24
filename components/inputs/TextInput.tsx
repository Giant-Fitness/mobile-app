// components/inputs/TextInput.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface TextInputProps extends RNTextInputProps {
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function TextInput({ style, textStyle, ...props }: TextInputProps) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.systemBorderColor }, style]}>
            <RNTextInput {...props} style={[{ color: themeColors.text }, styles.input, textStyle]} placeholderTextColor={themeColors.subText} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    input: {
        padding: Spaces.MD,
    },
});
