// components/base/ThemedText.tsx

import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

// typescript typings for props
export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'body' | 'bodyBold' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'subtitle' | 'caption' | 'link' | 'button' | 'overline';
};

// Styles for different text types using specific Inter fonts
const styles = StyleSheet.create({
    body: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'InterRegular',
    },
    bodyBold: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'InterBold',
    },
    bodyMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'InterMedium',
    },
    bodySmall: {
        fontSize: 12,
        lineHeight: 24,
        fontFamily: 'InterRegular',
    },
    titleLarge: {
        fontSize: 24,
        fontFamily: 'InterSemiBold',
        lineHeight: 40,
    },
    titleMedium: {
        fontSize: 24,
        fontFamily: 'InterSemiBold',
        lineHeight: 32,
    },
    titleSmall: {
        fontSize: 16,
        fontFamily: 'InterSemiBold',
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'InterRegular',
        lineHeight: 26,
    },
    caption: {
        fontSize: 12,
        fontFamily: 'InterMedium',
        lineHeight: 16,
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
        lineHeight: 24,
    },
    overlineTransformed: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        textTransform: 'uppercase',
        lineHeight: 16,
    },
    overline: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        lineHeight: 16,
    },
    italic: {
        fontSize: 16,
        fontFamily: 'InterItalic',
        lineHeight: 24,
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
