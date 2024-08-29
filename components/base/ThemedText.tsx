// components/base/ThemedText.tsx

import React from 'react';
import { Text, type TextProps, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'body' | 'titleLarge' | 'title' | 'subtitle' | 'caption' | 'link' | 'button' | 'overline';
};

// Adjust font size slightly smaller on Android
const fontSizeAdjustment = Platform.select({
    ios: 1,  // No adjustment for iOS
    android: 0.95,  // Adjust fonts down by 5% for Android
});

const styles = StyleSheet.create({
    body: {
        fontSize: 14 * fontSizeAdjustment,
        lineHeight: 21 * fontSizeAdjustment,
        fontFamily: 'InterRegular',
    },
    bodyMedium: {
        fontSize: 16 * fontSizeAdjustment,
        lineHeight: 24 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
    },
    bodySmall: {
        fontSize: 13 * fontSizeAdjustment,
        lineHeight: 20 * fontSizeAdjustment,
        fontFamily: 'InterRegular',
    },
    bodyXSmall: {
        fontSize: 12 * fontSizeAdjustment,
        lineHeight: 18 * fontSizeAdjustment,
        fontFamily: 'InterRegular',
    },
    titleLarge: {
        fontSize: 18 * fontSizeAdjustment,
        fontFamily: 'InterSemiBold',
        lineHeight: 27 * fontSizeAdjustment,
    },
    titleXLarge: {
        fontSize: 21 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        lineHeight: 32 * fontSizeAdjustment,
    },
    titleXXLarge: {
        fontSize: 24 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        lineHeight: 36 * fontSizeAdjustment,
    },
    title: {
        fontSize: 16 * fontSizeAdjustment,
        fontFamily: 'InterSemiBold',
        lineHeight: 24 * fontSizeAdjustment,
    },
    subtitle: {
        fontSize: 18 * fontSizeAdjustment,
        fontFamily: 'InterRegular',
        lineHeight: 27 * fontSizeAdjustment,
    },
    caption: {
        fontSize: 12 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        lineHeight: 18 * fontSizeAdjustment,
    },
    link: {
        fontSize: 16 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        lineHeight: 24 * fontSizeAdjustment,
    },
    button: {
        fontSize: 18 * fontSizeAdjustment,
        fontFamily: 'InterBold',
        lineHeight: 24 * fontSizeAdjustment,
    },
    buttonSmall: {
        fontSize: 13 * fontSizeAdjustment,
        fontFamily: 'InterRegular',
        lineHeight: 20 * fontSizeAdjustment,
    },
    overlineTransformed: {
        fontSize: 13 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        textTransform: 'uppercase',
        lineHeight: 20 * fontSizeAdjustment,
    },
    overline: {
        fontSize: 13 * fontSizeAdjustment,
        fontFamily: 'InterMedium',
        lineHeight: 20 * fontSizeAdjustment,
    },
    italic: {
        fontSize: 12 * fontSizeAdjustment,
        fontFamily: 'InterItalic',
        lineHeight: 18 * fontSizeAdjustment,
    },
});

export function ThemedText({ style, lightColor, darkColor, type = 'body', ...rest }: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return (
        <Text
            style={[
                styles.body, // Default style
                styles[type] || {}, // Apply type-specific styles if any
                { color }, // Apply dynamic color
                style, // Apply custom styles passed as props
            ]}
            {...rest}
        />
    );
}
