// components/quotes/TrainingQuote.tsx

import { HighlightedTip } from '@/components/alerts/HighlightedTip';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Quote } from '@/types';
import { darkenColor } from '@/utils/colorUtils';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type TrainingQuoteProps = {
    quote: Quote;
    isLastDay: boolean;
};

export const TrainingQuote: React.FC<TrainingQuoteProps> = ({ quote, isLastDay }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <>
            {isLastDay ? (
                <View style={styles.tipContainer}>
                    <HighlightedTip
                        containerStyle={{ backgroundColor: themeColors.tealTransparent }}
                        textColor={darkenColor(themeColors.tealSolid, 0.3)}
                        iconName='star'
                        tipText='The finish line is here, one last push!'
                    />
                </View>
            ) : (
                <View style={[styles.quoteContainer, { backgroundColor: themeColors.tealTransparent }]}>
                    <ThemedText type='bodySmall' style={[styles.quoteText, { color: darkenColor(themeColors.tealSolid, 0.3) }]}>
                        {quote.QuoteText}
                    </ThemedText>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    quoteContainer: {
        ...Platform.select({
            ios: {
                marginTop: Spaces.LG,
            },
            android: {
                marginTop: Spaces.SM,
            },
        }),
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.MD,
        paddingHorizontal: Spaces.XL,
        marginHorizontal: Spaces.LG,
        borderRadius: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    quoteText: {
        textAlign: 'center',
    },
    tipContainer: {
        marginHorizontal: Spaces.SM,
        ...Platform.select({
            ios: {
                marginTop: Spaces.LG,
            },
            android: {
                marginTop: Spaces.SM,
            },
        }),
        marginBottom: Spaces.LG,
    },
});
