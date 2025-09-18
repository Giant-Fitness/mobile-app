// components/inputs/TextInputBox.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { forwardRef, useState } from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface TextInputBoxProps extends Omit<RNTextInputProps, 'style'> {
    style?: ViewStyle;
    textStyle?: TextStyle;
    containerStyle?: ViewStyle;
}

export const TextInputBox = forwardRef<RNTextInput, TextInputBoxProps>(({ style, textStyle, containerStyle, onFocus, onBlur, ...props }, ref) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const containerStyles = [
        styles.container,
        {
            backgroundColor: isFocused ? themeColors.background : themeColors.backgroundSecondary,
            borderColor: isFocused ? themeColors.text : 'transparent',
            borderWidth: 1,
        },
        containerStyle,
        style,
    ];

    return (
        <ThemedView style={containerStyles}>
            <RNTextInput
                ref={ref}
                {...props}
                style={[{ color: themeColors.text }, styles.input, textStyle]}
                placeholderTextColor={themeColors.subText}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </ThemedView>
    );
});

TextInputBox.displayName = 'TextInputBox';

const styles = StyleSheet.create({
    container: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    input: {
        padding: Spaces.MD,
    },
});
