// components/cards/TrendCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { SparkLine, EmptySparkLine } from '../charts/SparkLine';
import { ThemedText } from '../base/ThemedText';
import { lightenColor } from '@/utils/colorUtils';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';

type ThemeColorKey = keyof typeof Colors['light'];

type TrendCardProps = {
    title: string;
    subtitle: string;
    data: any[];
    onPress: () => void;
    onLogData: () => void;
    isLoading?: boolean;
    style?: any;
    themeColor: ThemeColorKey;
    themeTransparentColor: ThemeColorKey;
    emptyStateTitle: string;
    emptyStateDescription: string;
    formatValue: (value: number) => string;
    processData: (data: any[]) => {
        processedData: { x: number; y: number; value: number }[];
        dateRange: string;
        average: number;
    };
    renderSingleDataPoint: (data: any, onPress: () => void, themeColors: any) => React.ReactNode;
};

const ShimmerEffect = ({ style }: { style: any }) => {
    const translateX = useSharedValue(-100);

    React.useEffect(() => {
        translateX.value = withRepeat(withSequence(withTiming(-100), withTiming(100, { duration: 1000 }), withTiming(-100)), -1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.shimmerContainer, style, { overflow: 'hidden' }]}>
            <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
    );
};

export const TrendCard: React.FC<TrendCardProps> = ({
    title,
    subtitle,
    data,
    onPress,
    onLogData,
    isLoading = false,
    style = {},
    themeColor,
    themeTransparentColor,
    emptyStateTitle,
    emptyStateDescription,
    formatValue,
    processData,
    renderSingleDataPoint,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        if (data?.length === 1) {
            const measurementDate = new Date(data[0].MeasurementTimestamp);
            const today = new Date();
            const isToday = measurementDate.toDateString() === today.toDateString();
            if (isToday) return;
        }

        if (!data?.length || data.length < 2) {
            onLogData();
        } else {
            onPress();
        }
    };

    if (isLoading) {
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }, style]} onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.textContainer}>
                    <ShimmerEffect style={{ height: 20 }} />
                    <View style={{ height: 8 }} />
                    <ShimmerEffect style={{ height: 16 }} />
                </View>
                <View style={[styles.chartContainer, style.chartContainer]}>
                    <ShimmerEffect style={{ height: '100%' }} />
                </View>
                <View style={styles.footerContainer}>
                    <ShimmerEffect style={{ height: 20, width: '30%' }} />
                    <Icon name='chevron-forward' color={themeColors.subText} />
                </View>
            </TouchableOpacity>
        );
    }

    if (!data?.length) {
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: themeColors[themeTransparentColor], borderColor: lightenColor(themeColors[themeColor], 0.9) }, style]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateContent}>
                        <View style={[styles.iconContainer]} />
                        <ThemedText type='title' style={styles.emptyStateTitle}>
                            {emptyStateTitle}
                        </ThemedText>
                        <ThemedText type='bodySmall' style={[styles.emptyStateDescription, { color: themeColors.subText }]}>
                            {emptyStateDescription}
                        </ThemedText>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: themeColors[themeColor] }]} onPress={handlePress} activeOpacity={0.8}>
                            <Icon name='plus' size={18} color={themeColors.white} style={styles.addIcon} />
                            <ThemedText type='button' style={[styles.buttonText, { color: themeColors.white }]}>
                                Add First Measurement
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.chartContainer}>
                        <EmptySparkLine color={themeColors[themeColor]} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    if (data.length === 1) {
        return (
            <View
                style={[styles.card, { backgroundColor: themeColors[themeTransparentColor], borderColor: lightenColor(themeColors[themeColor], 0.9) }, style]}
            >
                {renderSingleDataPoint(data[0], handlePress, themeColors)}
            </View>
        );
    }

    const { processedData, dateRange, average } = processData(data);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: themeColors[themeTransparentColor], borderColor: lightenColor(themeColors[themeColor], 0.9) }, style]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.textContainer}>
                <ThemedText type='title' style={styles.title}>
                    {title}
                </ThemedText>
                <ThemedText type='body' style={[styles.subtitle, { color: themeColors.subText }]}>
                    {dateRange}
                </ThemedText>
            </View>
            <View style={[styles.chartContainer, style.chartContainer]}>
                <SparkLine data={processedData} color={themeColors[themeColor]} dotFillColor={themeColors[themeTransparentColor]} />
            </View>
            <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor, borderBottomWidth: StyleSheet.hairlineWidth }]} />
            <View style={styles.footerContainer}>
                <ThemedText type='overline' style={[styles.value, { color: themeColors.subText }]}>
                    {formatValue(average)}
                </ThemedText>
                <Icon name='chevron-forward' color={themeColors.subText} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.SM,
        padding: Spaces.MD,
        alignItems: 'flex-start',
        width: '100%',
        borderWidth: 1,
    },
    chartContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Spaces.XXS,
    },
    textContainer: {
        width: '100%',
    },
    title: {},
    subtitle: {},
    value: {},
    footerContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shimmerContainer: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
    },
    divider: {
        marginBottom: Spaces.MD,
        width: '100%',
        alignSelf: 'center',
    },
    emptyStateContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.SM,
        marginTop: Spaces.SM,
    },
    addIcon: {
        marginRight: Spaces.XXS,
    },
    buttonText: {
        fontWeight: '600',
    },
    contentWrapper: {
        width: '100%',
    },
});
