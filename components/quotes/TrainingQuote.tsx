// components/quotes/TrainingQuote.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Quote } from '@/types';
import { darkenColor } from '@/utils/colorUtils';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type TrainingQuoteProps = {
    quote: Quote;
    isLastDay: boolean;
    isRestDay?: boolean;
};

export const TrainingQuote: React.FC<TrainingQuoteProps> = ({ quote, isLastDay, isRestDay = false }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const getQuoteText = () => {
        if (isLastDay) {
            return 'The finish line is here, one last push!';
        }
        return quote.QuoteText;
    };

    const getBackgroundColor = () => {
        if (isLastDay) {
            return themeColors.tangerineTransparent;
        }
        if (isRestDay) {
            return themeColors.slateBlueTransparent;
        }
        return themeColors.tangerineTransparent;
    };

    const getTextColor = () => {
        if (isLastDay) {
            return darkenColor(themeColors.tangerineSolid, 0.2);
        }
        if (isRestDay) {
            return darkenColor(themeColors.slateBlue, 0.2);
        }
        return darkenColor(themeColors.tangerineSolid, 0.2);
    };

    const getTintColor = () => {
        if (isLastDay) {
            return themeColors.tangerineSolid;
        }
        if (isRestDay) {
            return themeColors.slateBlue;
        }
        return themeColors.tangerineSolid;
    };

    const getBackgroundImage = () => {
        if (isLastDay) {
            return require('@/assets/images/flag.png');
        }
        if (isRestDay) {
            return require('@/assets/images/night.png');
        }
        return require('@/assets/images/bolt.png');
    };

    return (
        <ThemedView style={[{ backgroundColor: themeColors.background }]}>
            <View style={[styles.contentWrapper, { backgroundColor: getBackgroundColor() }]}>
                <View style={styles.content}>
                    <ThemedText
                        type='bodySmall'
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                            },
                        ]}
                    >
                        {getQuoteText()}
                    </ThemedText>
                </View>
                <Image
                    source={getBackgroundImage()}
                    style={[
                        styles.backgroundImage,
                        {
                            opacity: 0.5,
                            tintColor: getTintColor(),
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: Spaces.SM,
    },
    content: {
        padding: Spaces.LG,
        paddingRight: Spaces.XL,
        flex: 1,
        zIndex: 1,
    },
    text: {
        maxWidth: '90%',
    },
    backgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.MD,
        width: 200,
        height: '50%',
    },
});
