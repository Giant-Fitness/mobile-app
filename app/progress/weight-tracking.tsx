// app/progress/weight-tracking.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, SectionList } from 'react-native';
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
import { Icon } from '@/components/base/Icon';

const RangeSelector = ({ selectedRange, onRangeChange, style }) => {
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

const getWeightChange = (currentWeight: number, previousWeight: number | null) => {
    if (previousWeight === null) return null;
    const change = currentWeight - previousWeight;
    return change !== 0 ? change.toFixed(1) : null;
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

        const timeWindow = getTimeWindow(selectedTimeRange);
        const aggregated = aggregateData(userWeightMeasurements, selectedTimeRange);

        const weights = aggregated.map((d) => d.weight);
        const avg = weights.reduce((a, b) => a + b) / weights.length;
        const change = aggregated[aggregated.length - 1].weight - aggregated[0].weight;
        const percent = (change / aggregated[0].weight) * 100;

        const allData = [...userWeightMeasurements].sort((a, b) => new Date(a.MeasurementTimestamp).getTime() - new Date(b.MeasurementTimestamp).getTime());
        const allTimeChange = allData[allData.length - 1].Weight - allData[0].Weight;
        const allTimePercent = (allTimeChange / allData[0].Weight) * 100;

        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = Math.max(range * 0.1, 1);

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

    const groupedData = useMemo(() => {
        if (!userWeightMeasurements.length) return [];

        const now = new Date();
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const filteredMeasurements = userWeightMeasurements.filter((measurement) => {
            const date = new Date(measurement.MeasurementTimestamp);
            return date >= twoMonthsAgo && date <= now;
        });

        filteredMeasurements.sort((a, b) => new Date(b.MeasurementTimestamp) - new Date(a.MeasurementTimestamp));

        const groups: { title: string; data: UserWeightMeasurement[] }[] = [];
        filteredMeasurements.forEach((measurement) => {
            const date = new Date(measurement.MeasurementTimestamp);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            const existingGroup = groups.find((group) => group.title === monthYear);
            if (existingGroup) {
                existingGroup.data.push(measurement);
            } else {
                groups.push({ title: monthYear, data: [measurement] });
            }
        });

        return groups;
    }, [userWeightMeasurements]);

    const renderListHeader = () => (
        <View>
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
                    <ThemedText type='titleXLarge' style={{ color: weightChange > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3) }}>
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

            <TouchableOpacity style={styles.dataButton} onPress={() => navigation.navigate('progress/all-weight-data')} activeOpacity={0.9}>
                <ThemedText type='titleXLarge'>Data</ThemedText>
                <Icon name='chevron-forward' style={styles.dataChevron} color={themeColors.text} />
            </TouchableOpacity>
        </View>
    );

    const renderDataSectionHeader = ({ section }) => (
        <ThemedText type='title' style={styles.sectionHeader}>
            {section.title}
        </ThemedText>
    );

    const handleTilePress = (measurement: UserWeightMeasurement) => {
        console.log('Navigate to measurement:', measurement);
    };

    const renderDataItem = ({ item, section, index }) => {
        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const previousWeight = index < section.data.length - 1 ? section.data[index + 1].Weight : null;
        const weightChange = getWeightChange(item.Weight, previousWeight);

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.5) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type='caption'>
                        {dayOfWeek}, {`${month} ${day}`}
                    </ThemedText>
                    <ThemedText type='titleMedium' style={styles.weightText}>
                        {item.Weight.toFixed(1)} kg
                    </ThemedText>
                </View>
                {weightChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type='bodySmall'
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(weightChange) > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {weightChange > 0 ? '+' : ''}
                            {weightChange} kg
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Weight Tracking' />

            <SectionList
                sections={groupedData}
                keyExtractor={(item) => item.MeasurementTimestamp}
                renderSectionHeader={renderDataSectionHeader}
                renderItem={renderDataItem}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={() => (
                    <ThemedText type='bodyMedium' style={styles.emptyText}>
                        No data available.
                    </ThemedText>
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                    scrollY.value = event.nativeEvent.contentOffset.y;
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spaces.SM,
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
    listContent: {
        paddingBottom: Spaces.XL,
    },
    sectionHeader: {
        marginTop: Spaces.MD,
        marginLeft: Spaces.MD,
    },
    tile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginVertical: Spaces.XS,
        marginHorizontal: Spaces.MD,
        borderRadius: Spaces.SM,
    },
    tileLeft: {
        flex: 1,
    },
    tileRight: {
        marginLeft: Spaces.MD,
    },
    weightText: {
        marginTop: Spaces.XS,
        fontWeight: '600',
    },
    changeText: {
        fontWeight: '500',
    },
    dataButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingRight: Spaces.MD,
        marginTop: Spaces.XL,
        marginHorizontal: Spaces.MD,
    },
    dataChevron: {
        marginLeft: Spaces.XS,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Spaces.SM,
        color: Colors.light.subText,
    },
});
