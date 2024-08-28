// components/base/ThemedText.tsx

import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

// typescript typings for props
export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'body' | 'titleLarge' | 'title' | 'subtitle' | 'caption' | 'link' | 'button' | 'overline';
};

// Styles for different text types using specific Inter fonts
const styles = StyleSheet.create({
    body: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: 'InterRegular',
    },
    bodyMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'InterMedium',
    },
    bodySmall: {
        fontSize: 13,
        lineHeight: 20,
        fontFamily: 'InterRegular',
    },
    bodyXSmall: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: 'InterRegular',
    },
    titleLarge: {
        fontSize: 18,
        fontFamily: 'InterSemiBold',
        lineHeight: 27,
    },
    titleXLarge: {
        fontSize: 21,
        fontFamily: 'InterMedium',
        lineHeight: 32,
    },
    titleXXLarge: {
        fontSize: 24,
        fontFamily: 'InterMedium',
        lineHeight: 36,
    },
    title: {
        fontSize: 16,
        fontFamily: 'InterSemiBold',
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'InterRegular',
        lineHeight: 27,
    },
    caption: {
        fontSize: 12,
        fontFamily: 'InterMedium',
        lineHeight: 18,
    },
    link: {
        fontSize: 16,
        fontFamily: 'InterMedium',
        lineHeight: 24,
    },
    button: {
        fontSize: 18,
        fontFamily: 'InterBold',
        lineHeight: 24,
    },
    buttonSmall: {
        fontSize: 13,
        fontFamily: 'InterRegular',
        lineHeight: 20,
    },
    overlineTransformed: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        textTransform: 'uppercase',
        lineHeight: 20,
    },
    overline: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        lineHeight: 20,
    },
    italic: {
        fontSize: 12,
        fontFamily: 'InterItalic',
        lineHeight: 18,
    },
});

// ThemedText component definition remains the same, leveraging these styles
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
