// components/progress/WeightOverviewChartCard.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { UserWeightMeasurement } from '@/types';
import { Spaces } from '@/constants/Spaces';
import { Path, Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { format } from 'date-fns';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '../base/ThemedText';
import { lightenColor } from '@/utils/colorUtils';
import { useSelector } from 'react-redux';
import { kgToPounds } from '@/utils/weightConversion';
import { RootState } from '@/store/store';

type WeightOverviewChartCardProps = {
    values: UserWeightMeasurement[];
    onPress: () => void;
    onLogWeight: () => void;
    isLoading?: boolean;
    style?: any;
};

const EmptyStateChart = ({ color }: { color: string }) => (
    <Svg width='100%' height='100%' viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
        <Defs>
            <LinearGradient id='emptyGradient' x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={color} stopOpacity='0.2' />
                <Stop offset='1' stopColor={color} stopOpacity='0.05' />
            </LinearGradient>
        </Defs>
        <Path d='M 0 30 C 25 30, 25 15, 50 15 C 75 15, 75 30, 100 30' stroke={color} strokeWidth='0.9' strokeDasharray='2,2' fill='none' opacity='0.5' />
        <Path d='M 0 30 C 25 30, 25 15, 50 15 C 75 15, 75 30, 100 30 L 100 38 L 0 38 Z' fill='url(#emptyGradient)' />
    </Svg>
);

const SingleDataPointState = ({ measurement, onPress, themeColors }: { measurement: UserWeightMeasurement; onPress: () => void; themeColors: any }) => {
    const measurementDate = new Date(measurement.MeasurementTimestamp);
    const today = new Date();
    const isToday = measurementDate.toDateString() === today.toDateString();
    const formattedDate = format(measurementDate, 'MMM d, yyyy');
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);


    // Create the content without the touchable wrapper
    const content = (
        <View style={styles.singleDataContainer}>
            <View style={styles.singleDataContent}>
                <View style={styles.firstMeasurementContainer}>
                    <ThemedText type='bodyMedium' style={styles.firstMeasurementLabel}>
                        {isToday ? "Today's Measurement" : 'First Measurement'}
                    </ThemedText>
                    <ThemedText type='titleLarge' style={[styles.weightValue, { color: themeColors.purpleSolid }]}>
                    {bodyWeightPreference === 'pounds'
                        ? `${kgToPounds(measurement.Weight)} lbs`  
                        : `${measurement.Weight.toFixed(1)} kg`}              
                </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.dateText, { color: themeColors.subText }]}>
                        {formattedDate}
                    </ThemedText>
                </View>

                {isToday ? (
                    <View style={[styles.messageContainer]}>
                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Great start! Come back tomorrow to log your next measurement and start tracking your progress.
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={[styles.addNextButton, { backgroundColor: themeColors.purpleSolid }]} onPress={onPress} activeOpacity={0.8}>
                            <Icon name='plus' size={18} color={themeColors.white} style={styles.addIcon} />
                            <ThemedText type='button' style={[styles.buttonText, { color: themeColors.white }]}>
                                Add Next Measurement
                            </ThemedText>
                        </TouchableOpacity>

                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Add another measurement to start tracking your progress
                        </ThemedText>
                    </>
                )}
            </View>
        </View>
    );

    // For today's measurement, return content without TouchableOpacity
    if (isToday) {
        return content;
    }

    // For past measurements, wrap in TouchableOpacity
    return (
        <TouchableOpacity style={styles.contentWrapper} onPress={onPress} activeOpacity={0.8}>
            {content}
        </TouchableOpacity>
    );
};

const EmptyState = ({ onPress, themeColors }: { onPress: () => void; themeColors: any }) => (
    <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
            <View style={[styles.iconContainer]} />
            <ThemedText type='title' style={styles.emptyStateTitle}>
                Track Your Weight Journey
            </ThemedText>
            <ThemedText type='bodySmall' style={[styles.emptyStateDescription, { color: themeColors.subText }]}>
                Track your weight regularly to see your journey take shape with charts that keep you motivated and informed.
            </ThemedText>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: themeColors.purpleSolid }]} onPress={onPress} activeOpacity={0.8}>
                <Icon name='plus' size={18} color={themeColors.white} style={styles.addIcon} />
                <ThemedText type='button' style={[styles.buttonText, { color: themeColors.white }]}>
                    Add First Measurement
                </ThemedText>
            </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
            <EmptyStateChart color={themeColors.purpleSolid} />
        </View>
    </View>
);

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

const PADDING_VERTICAL = 4;

export const WeightOverviewChartCard: React.FC<WeightOverviewChartCardProps> = ({ values, onPress, onLogWeight, isLoading = false, style = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);

    const handlePress = () => {
        // Check if we have a measurement from today
        if (values?.length === 1) {
            const measurementDate = new Date(values[0].MeasurementTimestamp);
            const today = new Date();
            const isToday = measurementDate.toDateString() === today.toDateString();

            // If it's today's measurement, don't do anything
            if (isToday) {
                return;
            }
        }

        // Regular logic for other cases
        if (!values?.length || values.length < 2) {
            onLogWeight();
        } else {
            onPress();
        }
    };

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

    if (!values?.length) {
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.3), borderColor: lightenColor(themeColors.purpleSolid, 0.9) },
                    style,
                ]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <EmptyState onPress={handlePress} themeColors={themeColors} />
            </TouchableOpacity>
        );
    }

    if (values.length === 1) {
        return (
            <View
                style={[
                    styles.card,
                    { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.3), borderColor: lightenColor(themeColors.purpleSolid, 0.9) },
                    style,
                ]}
            >
                <SingleDataPointState measurement={values[0]} onPress={handlePress} themeColors={themeColors} />
            </View>
        );
    }

    // Regular chart view for 2+ measurements
    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.3), borderColor: lightenColor(themeColors.purpleSolid, 0.9) },
                style,
            ]}
            onPress={handlePress}
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
                {(bodyWeightPreference === 'pounds') ? `${kgToPounds(averageWeight)} lbs` : `${averageWeight.toFixed(1)} kg`} (average)
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
    singleDataContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
    },
    singleDataContent: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: Spaces.SM,
    },
    firstMeasurementContainer: {
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    firstMeasurementLabel: {
        marginBottom: Spaces.XXS,
    },
    weightValue: {
        fontSize: 28,
        fontWeight: '600',
        paddingTop: Spaces.MD,
        marginBottom: Spaces.XXS,
    },
    dateText: {
        marginBottom: Spaces.SM,
    },
    dividerContainer: {
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    verticalDivider: {
        width: 1,
        height: 24,
        marginBottom: Spaces.XXS,
    },
    dividerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    addNextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.SM,
    },
    helperText: {
        textAlign: 'center',
        marginTop: Spaces.XXS,
    },
    messageContainer: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.MD,
        width: '100%',
    },
    contentWrapper: {
        width: '100%',
    },
});
