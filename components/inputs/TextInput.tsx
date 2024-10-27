// components/inputs/TextInput.tsx

import React from 'react';
import { StyleSheet, TextInput as RNTextInput, ViewStyle, TextInputProps as RNTextInputProps } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';

interface TextInputProps extends RNTextInputProps {
    style?: ViewStyle;
}

export function TextInput({ style, ...props }: TextInputProps) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.systemBorderColor }, style]}>
            <RNTextInput {...props} style={[{ color: themeColors.text }, styles.input]} placeholderTextColor={themeColors.subText} />
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
