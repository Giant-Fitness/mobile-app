// components/progress/WeightOverviewChartCard.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { UserWeightMeasurement } from '@/types';
import { Spaces } from '@/constants/Spaces';
import { Path, Svg, Circle } from 'react-native-svg';
import { format } from 'date-fns';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '../base/ThemedText';
import { darkenColor, lightenColor } from '@/utils/colorUtils';

type WeightOverviewChartCardProps = {
    values: UserWeightMeasurement[];
    onPress: () => void;
    isLoading?: boolean;
    style?: any; // Allow container styling to be passed
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

type Point = {
    x: number;
    y: number;
    weight: number;
};

const PADDING_VERTICAL = 4; // Padding for top and bottom of chart

export const WeightOverviewChartCard: React.FC<WeightOverviewChartCardProps> = ({ values, onPress, isLoading = false, style = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { processedData, dateRange, averageWeight, points } = useMemo(() => {
        if (!values?.length) {
            return { processedData: '', dateRange: '', averageWeight: 0, points: [] };
        }

        // Filter and sort data
        const validData = values
            .filter((v) => typeof v.Weight === 'number' && !isNaN(v.Weight))
            .sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

        const recentData = validData.slice(0, 7).reverse();

        if (recentData.length < 2) {
            return {
                processedData: '',
                dateRange: 'Not enough data',
                averageWeight: recentData[0]?.Weight || 0,
                points: [],
            };
        }

        const avg = recentData.reduce((sum, v) => sum + v.Weight, 0) / recentData.length;

        const startDate = format(new Date(recentData[0].MeasurementTimestamp), 'MMM d');
        const endDate = format(new Date(recentData[recentData.length - 1].MeasurementTimestamp), 'MMM d');

        // Calculate weight range with padding
        const minWeight = Math.min(...recentData.map((d) => d.Weight));
        const maxWeight = Math.max(...recentData.map((d) => d.Weight));
        const weightPadding = (maxWeight - minWeight) * 0.5;
        const adjustedMinWeight = Math.max(0, minWeight - weightPadding);
        const adjustedMaxWeight = maxWeight + weightPadding;
        const weightRange = adjustedMaxWeight - adjustedMinWeight;

        if (weightRange === 0) {
            const midY = 20; // Middle of viewBox height (40/2)
            return {
                processedData: `M 0 ${midY} L 100 ${midY}`,
                dateRange: `${startDate} - ${endDate}`,
                averageWeight: avg,
                points: recentData.map((d, i) => ({
                    x: (i / (recentData.length - 1)) * 100,
                    y: midY,
                    weight: d.Weight,
                })),
            };
        }

        // Create points mapping to SVG coordinates
        const chartPoints = recentData.map((d, i) => {
            const x = (i / (recentData.length - 1)) * 100;
            // Map weight to y coordinate between PADDING_VERTICAL and (40 - PADDING_VERTICAL)
            const y = 40 - PADDING_VERTICAL - ((d.Weight - adjustedMinWeight) / weightRange) * (40 - 2 * PADDING_VERTICAL);
            return { x, y, weight: d.Weight };
        });

        // Create smooth curve path
        let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;

        for (let i = 1; i < chartPoints.length; i++) {
            const x1 = chartPoints[i - 1].x + (chartPoints[i].x - chartPoints[i - 1].x) / 3;
            const x2 = chartPoints[i].x - (chartPoints[i].x - chartPoints[i - 1].x) / 3;
            path += ` C ${x1} ${chartPoints[i - 1].y}, ${x2} ${chartPoints[i].y}, ${chartPoints[i].x} ${chartPoints[i].y}`;
        }

        return {
            processedData: path,
            dateRange: `${startDate} - ${endDate}`,
            averageWeight: avg,
            points: chartPoints,
        };
    }, [values]);

    if (isLoading) {
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }, style]} onPress={onPress} activeOpacity={0.9}>
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

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.5) }, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.textContainer}>
                <ThemedText type='title' style={[styles.title]}>
                    Weight Trend
                </ThemedText>
                <ThemedText type='body' style={[styles.subtitle, { color: themeColors.subText }]}>
                    {dateRange}
                </ThemedText>
            </View>
            <View style={[styles.chartContainer, style.chartContainer]}>
                {processedData && (
                    <Svg width='100%' height='100%' viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
                        <Path d={processedData} stroke={themeColors.purpleSolid} strokeWidth={0.9} fill='none' />
                        {points.map((point, index) => (
                            <Circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                stroke={themeColors.purpleSolid}
                                strokeWidth='0.9'
                                r='1.5'
                                fill={themeColors.purpleTransparent}
                            />
                        ))}
                    </Svg>
                )}
            </View>
            <View
                style={[
                    styles.divider,
                    {
                        borderBottomColor: themeColors.systemBorderColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                ]}
            />
            <View style={styles.footerContainer}>
                <ThemedText type='overline' style={[styles.value, { color: themeColors.subText }]}>
                    {averageWeight.toFixed(1)} kg (average)
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
});
