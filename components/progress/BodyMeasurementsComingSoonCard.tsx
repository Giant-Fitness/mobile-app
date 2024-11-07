// components/progress/BodyMeasurementsComingSoonCard.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightenColor } from '@/utils/colorUtils';
import { Path, Svg, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BodyMeasurementsComingSoonCardProps {
    onPress?: () => void;
    style?: any;
}

const EmptyStateChart = ({ color }: { color: string }) => (
    <Svg width='100%' height='100%' viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
        <Defs>
            <LinearGradient id='emptyGradient' x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={color} stopOpacity='0.2' />
                <Stop offset='1' stopColor={color} stopOpacity='0.05' />
            </LinearGradient>
        </Defs>
        <Path d='M 0 25 Q 25 25, 50 15 T 100 25' stroke={color} strokeWidth='0.9' strokeDasharray='2,2' fill='none' opacity='0.5' />
        <Path d='M 0 25 Q 25 25, 50 15 T 100 25 L 100 38 L 0 38 Z' fill='url(#emptyGradient)' />
    </Svg>
);

export const BodyMeasurementsComingSoonCard: React.FC<BodyMeasurementsComingSoonCardProps> = ({ onPress = () => {}, style = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.blueTransparent }, style]} onPress={onPress} activeOpacity={1}>
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateContent}>
                    <View style={styles.iconContainer} />
                    <ThemedText type='title' style={styles.emptyStateTitle}>
                        Body Measurements
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.emptyStateDescription, { color: themeColors.subText }]}>
                        Track your body measurements and photos regularly to witness your transformation.
                    </ThemedText>
                    <View style={[styles.comingSoonBadge, { backgroundColor: themeColors.blueSolid }]}>
                        <ThemedText type='button' style={[styles.badgeText, { color: themeColors.white }]}>
                            Coming Soon
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.chartContainer}>
                    <EmptyStateChart color={themeColors.blueSolid} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        alignItems: 'flex-start',
        width: '100%',
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
    iconContainer: {
        width: Spaces.LG,
        height: Spaces.LG,
        borderRadius: Spaces.LG,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateTitle: {
        marginBottom: Spaces.SM,
        textAlign: 'center',
    },
    emptyStateDescription: {
        textAlign: 'center',
        marginBottom: Spaces.MD,
        paddingHorizontal: 0,
    },
    comingSoonBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.SM,
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
