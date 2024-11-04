import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { WeightChart } from '@/components/progress/WeightChart';
import { AppDispatch, RootState } from '@/store/store';
import { TimeRange, TIME_RANGES, aggregateData, calculateMovingAverage, getTimeWindow, getTimeRangeLabel } from '@/utils/weight';
import { UserWeightMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';

const RangeSelector = ({ selectedRange, onRangeChange, style }: { selectedRange: TimeRange; onRangeChange: (range: TimeRange) => void; style?: any }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.rangeSelector, style]}>
            {Object.keys(TIME_RANGES).map((range) => (
                <ThemedView
                    key={range}
                    style={[
                        styles.rangePill,
                        {
                            backgroundColor: range === selectedRange ? themeColors.containerHighlight : themeColors.background,
                        },
                    ]}
                    onTouchEnd={() => onRangeChange(range as TimeRange)}
                >
                    <ThemedText
                        type='body'
                        style={[styles.rangeText, { color: range === selectedRange ? themeColors.highlightContainerText : themeColors.subText }]}
                    >
                        {range}
                    </ThemedText>
                </ThemedView>
            ))}
        </View>
    );
};

export default function WeightTrackingScreen() {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1W');
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleDataPointPress = (measurement: UserWeightMeasurement) => {
        console.log('Navigate to measurement:', measurement);
        // navigation.navigate('BodyMeasurementLog', { date: measurement.MeasurementTimestamp });
    };

    const {
        aggregatedData,
        effectiveTimeRange,
        currentWeight,
        weightChange,
        changePercent,
        averageWeight,
        startWeight,
        yAxisRange,
        movingAverages,
        allTimeChange,
        allTimePercent,
        allTimeStart,
    } = useMemo(() => {
        if (!userWeightMeasurements.length) {
            return {
                aggregatedData: [],
                effectiveTimeRange: '',
                currentWeight: 0,
                weightChange: 0,
                changePercent: 0,
                averageWeight: 0,
                startWeight: 0,
                yAxisRange: { min: 0, max: 100 },
                movingAverages: [],
                allTimeChange: 0,
                allTimePercent: 0,
                allTimeStart: 0,
            };
        }

        // Get time window and aggregated data
        const timeWindow = getTimeWindow(selectedTimeRange);
        const aggregated = aggregateData(userWeightMeasurements, selectedTimeRange);

        // Calculate statistics for selected time range
        const weights = aggregated.map((d) => d.weight);
        const avg = weights.reduce((a, b) => a + b) / weights.length;
        const change = aggregated[aggregated.length - 1].weight - aggregated[0].weight;
        const percent = (change / aggregated[0].weight) * 100;

        // Calculate all-time statistics - Create a new array before sorting
        const allData = [...userWeightMeasurements].sort((a, b) => new Date(a.MeasurementTimestamp).getTime() - new Date(b.MeasurementTimestamp).getTime());
        const allTimeChange = allData[allData.length - 1].Weight - allData[0].Weight;
        const allTimePercent = (allTimeChange / allData[0].Weight) * 100;

        // Calculate Y-axis range with padding
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = Math.max(range * 0.1, 1); // At least 1kg padding

        return {
            aggregatedData: aggregated,
            effectiveTimeRange: getTimeRangeLabel(aggregated[0].timestamp, aggregated[aggregated.length - 1].timestamp),
            currentWeight: aggregated[aggregated.length - 1].weight,
            weightChange: change,
            changePercent: percent,
            averageWeight: avg,
            startWeight: aggregated[0].weight,
            yAxisRange: {
                min: Math.floor(minWeight - padding),
                max: Math.ceil(maxWeight + padding),
            },
            movingAverages: calculateMovingAverage(aggregated, selectedTimeRange),
            allTimeChange: allTimeChange,
            allTimePercent: allTimePercent,
            allTimeStart: allData[0].Weight,
        };
    }, [userWeightMeasurements, selectedTimeRange]);

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Weight Tracking' />

            <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { borderColor: themeColors.purpleSolid }]} />
                            <ThemedText type='bodyXSmall'>Weight</ThemedText>
                        </View>
                        <View style={[styles.legendItem, { marginLeft: Spaces.MD }]}>
                            <View style={[styles.legendLine, { backgroundColor: lightenColor(themeColors.purpleSolid, 0.6) }]} />
                            <ThemedText type='bodyXSmall'>Trend Line</ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.insightsContainer}>
                    <View style={styles.insightItem}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                            Average
                        </ThemedText>
                        <ThemedText type='titleXLarge'>{averageWeight.toFixed(1)} kg</ThemedText>
                    </View>
                    <View style={[styles.insightItem, { marginLeft: Spaces.XXXL }]}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                            Change
                        </ThemedText>
                        <ThemedText type='titleXLarge' style={{ color: weightChange >= 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3) }}>
                            {weightChange > 0 ? '+' : ''}
                            {weightChange.toFixed(1)} kg
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <WeightChart
                        data={aggregatedData}
                        timeRange={selectedTimeRange}
                        yAxisRange={yAxisRange}
                        movingAverages={movingAverages}
                        effectiveTimeRange={effectiveTimeRange}
                        onDataPointPress={handleDataPointPress}
                    />
                </View>

                <RangeSelector selectedRange={selectedTimeRange} onRangeChange={setSelectedTimeRange} style={styles.rangeSelector} />

                {/* <ThemedText type='titleLarge' style={{ marginTop: Spaces.MD, marginBottom: Spaces.SM, paddingLeft: Spaces.LG }}>
                    Insights
                </ThemedText>
                <View style={[styles.analyticsContainer, { backgroundColor: themeColors.purpleTransparent }]}>
                    <View style={styles.analyticsGrid}>
                        <View style={styles.analyticsItem}>
                            <ThemedView style={styles.weightChangeContainer}>
                                <ThemedText
                                    type='titleXLarge'
                                    style={[
                                        styles.weightChangeText,
                                        {
                                            color: allTimeChange >= 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                        },
                                    ]}
                                >
                                    {allTimeChange > 0 ? '+' : ''}
                                    {allTimeChange.toFixed(1)}
                                </ThemedText>
                                <ThemedText type='overline' style={styles.kgText}>
                                    kg
                                </ThemedText>
                            </ThemedView>
                            <ThemedText type='overline' style={styles.totalChangeLabel}>
                                Total Change
                            </ThemedText>
                        </View>
                    </View>
                </View> */}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spaces.XL,
    },
    header: {
        padding: Spaces.LG,
        paddingTop: Sizes.bottomSpaceMedium,
    },
    legendContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: Spaces.MD,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: Spaces.SM,
        height: Spaces.SM,
        borderRadius: Spaces.XS,
        borderWidth: 1.5,
        marginRight: Spaces.XS,
    },
    legendLine: {
        width: Spaces.MD,
        height: Spaces.XXS,
        marginRight: Spaces.XS,
    },
    insightsContainer: {
        flexDirection: 'row',
        paddingLeft: Spaces.LG,
        paddingBottom: Spaces.SM,
    },
    insightItem: {},
    chartContainer: {},
    rangeSelector: {
        flexDirection: 'row',
        padding: Spaces.MD,
        justifyContent: 'space-between',
    },
    rangePill: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.MD,
        minWidth: 48,
        alignItems: 'center',
    },
    rangeText: {
        fontSize: 12,
    },
    analyticsContainer: {
        marginHorizontal: Spaces.LG,
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.LG,
        borderRadius: Spaces.MD, // Create pill shape for the container
    },
    analyticsGrid: {
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    analyticsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Align weight change to the right
    },
    weightChangeContainer: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        alignItems: 'center',
    },
    weightChangeText: {
        fontSize: 24, // Increase size for visibility
    },
    kgText: {
        fontSize: 12,
        textAlign: 'center',
    },
    totalChangeLabel: {
        marginLeft: Spaces.SM, // Align Total Change label next to the weight change
    },
});
