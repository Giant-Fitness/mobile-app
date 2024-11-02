// components/quotes/TrainingQuote.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { HighlightedTip } from '@/components/alerts/HighlightedTip';
import { Quote } from '@/types';

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
                    <HighlightedTip iconName='star' tipText='The finish line is here, one last push!' />
                </View>
            ) : (
                <View style={[styles.quoteContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.tipText }]}>
                        {quote.QuoteText}
                    </ThemedText>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    quoteContainer: {
        paddingTop: Spaces.XL,
        paddingBottom: Spaces.MD,
        paddingHorizontal: Spaces.XL,
        marginBottom: Spaces.LG,
    },
    quoteText: {
        textAlign: 'center',
        paddingBottom: Spaces.SM,
    },
    tipContainer: {
        marginHorizontal: Spaces.SM,
        marginTop: Spaces.XL,
        marginBottom: Spaces.LG,
    },
});
