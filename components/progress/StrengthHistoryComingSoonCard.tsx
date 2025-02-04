// components/progress/StrengthHistoryComingSoonCard.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Path, Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { lightenColor } from '@/utils/colorUtils';

interface StrengthHistoryComingSoonCardProps {
    onPress?: () => void;
    style?: any;
}

const BarbellIllustration = ({ color }: { color: string }) => (
    <Svg width='100%' height='100%' viewBox='0 0 100 50' preserveAspectRatio='xMidYMid meet'>
        <Defs>
            <LinearGradient id='plateGradient' x1='0' y1='0' x2='1' y2='1'>
                <Stop offset='0' stopColor={color} stopOpacity='0.3' />
                <Stop offset='1' stopColor={color} stopOpacity='0.1' />
            </LinearGradient>
        </Defs>
        {/* Barbell bar */}
        <Path d='M 25 25 L 75 25' stroke={color} strokeWidth='2' strokeLinecap='round' />
        {/* Plates on left */}
        <Rect x='20' y='15' width='5' height='20' fill='url(#plateGradient)' rx='1' />
        <Rect x='15' y='17' width='5' height='16' fill='url(#plateGradient)' rx='1' />
        {/* Plates on right */}
        <Rect x='75' y='15' width='5' height='20' fill='url(#plateGradient)' rx='1' />
        <Rect x='80' y='17' width='5' height='16' fill='url(#plateGradient)' rx='1' />
    </Svg>
);

export const StrengthHistoryComingSoonCard: React.FC<StrengthHistoryComingSoonCardProps> = ({ onPress = () => {}, style = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.5),
                    borderColor: lightenColor(themeColors.tangerineSolid, 0.9),
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={1}
        >
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateContent}>
                    <View style={[styles.comingSoonBadge, { backgroundColor: lightenColor(themeColors.tangerineSolid, 0.2) }]}>
                        <ThemedText type='button' style={[styles.badgeText, { color: themeColors.white }]}>
                            Strength Tracking
                        </ThemedText>
                    </View>
                    <ThemedText type='bodySmall' style={[styles.emptyStateDescription, { color: themeColors.subText }]}>
                        Watch your strength grow over time with detailed tracking of your lifts.
                    </ThemedText>
                </View>
                <View style={styles.chartContainer}>
                    <BarbellIllustration color={lightenColor(themeColors.tangerineSolid, 0.4)} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingTop: Spaces.LG,
        alignItems: 'flex-start',
        width: '100%',
        borderWidth: 1,
    },
    emptyStateContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: Spaces.SM,
    },
    emptyStateContent: {
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
    },
    emptyStateTitle: {
        marginBottom: Spaces.SM,
        textAlign: 'center',
    },
    emptyStateDescription: {
        textAlign: 'center',
        paddingHorizontal: 0,
    },
    comingSoonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.LG,
        marginTop: Spaces.SM,
    },
    badgeText: {
        fontWeight: '600',
    },
    chartContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Spaces.XXS,
    },
});
