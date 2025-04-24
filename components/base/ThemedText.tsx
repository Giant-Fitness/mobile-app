// components/base/ThemedText.tsx

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { moderateScale } from '@/utils/scaling'; // Use the customized moderateScale
import { Sizes } from '@/constants/Sizes';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?:
        | 'body'
        | 'titleLarge'
        | 'title'
        | 'subtitle'
        | 'caption'
        | 'link'
        | 'button'
        | 'overline'
        | 'italic'
        | 'buttonSmall'
        | 'titleXLarge'
        | 'headline'
        | 'headlineLarge'
        | 'bodyXSmall'
        | 'bodyMedium'
        | 'bodySmall'
        | 'overlineTransformed'
        | 'greeting';
};

// Styles for different text types using specific Inter fonts with adjusted scaling
const styles = StyleSheet.create({
    body: {
        fontSize: Sizes.fontSizeDefault,
        lineHeight: Sizes.fontSizeDefault * 1.5,
        fontFamily: 'InterRegular',
    },
    bodyMedium: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontFamily: 'InterMedium',
    },
    bodySmall: {
        fontSize: moderateScale(13),
        lineHeight: moderateScale(20),
        fontFamily: 'InterRegular',
    },
    bodyXSmall: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
        fontFamily: 'InterRegular',
    },
    titleLarge: {
        fontSize: moderateScale(18),
        lineHeight: moderateScale(27),
        fontFamily: 'NunitoBold',
    },
    titleXLarge: {
        fontSize: moderateScale(21),
        lineHeight: moderateScale(32),
        fontFamily: 'NunitoBold',
    },
    headline: {
        fontSize: moderateScale(24),
        lineHeight: moderateScale(36),
        fontFamily: 'MontserratAlternatesBold',
    },
    headlineLarge: {
        fontSize: moderateScale(32),
        lineHeight: moderateScale(48),
        fontFamily: 'MontserratBold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontFamily: 'NunitoBold',
    },
    subtitle: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontFamily: 'NunitoMedium',
    },
    caption: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
        fontFamily: 'NunitoMedium',
    },
    link: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontFamily: 'NunitoMedium',
    },
    button: {
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
        fontFamily: 'InterSemiBold',
    },
    buttonSmall: {
        fontSize: moderateScale(13),
        lineHeight: moderateScale(20),
        fontFamily: 'InterMedium',
    },
    overlineTransformed: {
        fontSize: moderateScale(13),
        lineHeight: moderateScale(20),
        fontFamily: 'InterMedium',
        textTransform: 'uppercase',
    },
    overline: {
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
        fontFamily: 'InterMedium',
    },
    italic: {
        fontSize: moderateScale(13),
        lineHeight: moderateScale(18),
        fontFamily: 'InterItalic',
    },
    greeting: {
        fontSize: moderateScale(24),
        lineHeight: moderateScale(30),
        fontFamily: 'ComfortaaBold',
    },
});

// ThemedText component definition remains the same, leveraging these styles
export function ThemedText({ style, lightColor, darkColor, type = 'body', ...rest }: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return (
        <Text
            allowFontScaling={false}
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
