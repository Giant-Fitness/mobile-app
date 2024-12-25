// app/(app)/progress/weight-tracking.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, SectionList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
import { TimeRange, aggregateData, calculateMovingAverage, getTimeRangeLabel, getAvailableTimeRanges, getInitialTimeRange } from '@/utils/weight';
import { UserWeightMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { Icon } from '@/components/base/Icon';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { updateWeightMeasurementAsync, deleteWeightMeasurementAsync, logWeightMeasurementAsync } from '@/store/user/thunks';
import { router } from 'expo-router';
import { kgToPounds } from '@/utils/weightConversion';

const getWeightChange = (currentWeight: number, previousWeight: number | null) => {
    if (previousWeight === null) return null;
    const change = currentWeight - previousWeight;
    return change !== 0 ? change.toFixed(1) : null;
};

export default function WeightTrackingScreen() {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1W');
    const [availableRanges, setAvailableRanges] = useState<ReturnType<typeof getAvailableTimeRanges>>([]);
    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);
    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isAddingWeight, setIsAddingWeight] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserWeightMeasurement | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);


    useEffect(() => {
        if (userWeightMeasurements.length) {
            const ranges = getAvailableTimeRanges(userWeightMeasurements);
            setAvailableRanges(ranges);
            setSelectedTimeRange(getInitialTimeRange(userWeightMeasurements));
        }
    }, [userWeightMeasurements]);

    // Add handlers for weight modifications
    const handleWeightUpdate = async (weight: number) => {
        if (!selectedMeasurement) return;

        try {
            await dispatch(
                updateWeightMeasurementAsync({
                    timestamp: selectedMeasurement.MeasurementTimestamp,
                    weight: weight,
                }),
            ).unwrap();
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to update weight:', error);
        }
    };

    // Add the handleWeightAdd function
    const handleWeightAdd = async (weight: number, date: Date) => {
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingWeight(false);
        } catch (error) {
            console.error('Failed to log weight:', error);
        }
    };

    const handleWeightDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
            setIsWeightSheetVisible(false);
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to delete weight:', error);
        }
    };

    // Update the handleTilePress function
    const handleTilePress = (measurement: UserWeightMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsWeightSheetVisible(true);
    };

    // Update the handleDataPointPress function
    const handleDataPointPress = (measurement: UserWeightMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsWeightSheetVisible(true);
    };

    const handleAddWeight = () => {
        setSelectedMeasurement(null); // Ensure we're not in edit mode
        setIsAddingWeight(true);
        setIsWeightSheetVisible(true);
    };

    // Add this close handler
    const handleSheetClose = () => {
        setIsWeightSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingWeight(false);
    };

    const getExistingData = (date: Date) => {
        return userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const { aggregatedData, effectiveTimeRange, weightChange, averageWeight, yAxisRange, movingAverages } = useMemo(() => {
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

        const aggregated = aggregateData(userWeightMeasurements, selectedTimeRange);

        const weights = aggregated.map((d) => d.weight);
        const avg = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
        const change = weights.length > 1 ? aggregated[aggregated.length - 1].weight - aggregated[0].weight : 0;
        const percent = aggregated.length > 0 ? (change / aggregated[0].weight) * 100 : 0;

        const allData = [...userWeightMeasurements].sort((a, b) => new Date(a.MeasurementTimestamp).getTime() - new Date(b.MeasurementTimestamp).getTime());
        const allTimeChange = allData[allData.length - 1].Weight - allData[0].Weight;
        const allTimePercent = (allTimeChange / allData[0].Weight) * 100;

        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = Math.max(range * 0.1, 1);


        return {
            aggregatedData: aggregated,
            effectiveTimeRange: aggregated.length > 0 ? getTimeRangeLabel(aggregated[0].timestamp, aggregated[aggregated.length - 1].timestamp) : '',
            currentWeight: aggregated.length > 0 ? aggregated[aggregated.length - 1].weight : 0,
            weightChange: change,
            changePercent: percent,
            averageWeight: avg,
            startWeight: aggregated.length > 0 ? aggregated[0].weight : 0,
            yAxisRange: {
                min: weights.length > 0 ? Math.floor(minWeight - padding) : 0,
                max: weights.length > 0 ? Math.ceil(maxWeight + padding) : 100,
            },
            movingAverages: aggregated.length > 0 ? calculateMovingAverage(aggregated, selectedTimeRange) : [],
            allTimeChange: allTimeChange,
            allTimePercent: allTimePercent,
            allTimeStart: allData[0]?.Weight || 0,
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

        filteredMeasurements.sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

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
                    <ThemedText type='titleXLarge'>{(bodyWeightPreference === 'pounds') ? `${kgToPounds(averageWeight)}lbs` : `${averageWeight.toFixed(1)}kg` }</ThemedText>
                    
                </View>
                <View style={[styles.insightItem, { marginLeft: Spaces.XXXL }]}>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                        Change
                    </ThemedText>
                    <ThemedText type='titleXLarge' style={{ color: weightChange > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3) }}>
                        {weightChange > 0 ? '+' : ''}
                        {(bodyWeightPreference === 'pounds') ? `${kgToPounds(weightChange)} lbs` : `${weightChange.toFixed(1)}kg`}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <WeightChart
                    data={aggregatedData}
                    timeRange={selectedTimeRange}
                    availableRanges={availableRanges}
                    onRangeChange={setSelectedTimeRange}
                    yAxisRange={yAxisRange}
                    movingAverages={movingAverages}
                    effectiveTimeRange={effectiveTimeRange}
                    onDataPointPress={handleDataPointPress}
                />
            </View>

            <TouchableOpacity style={styles.dataButton} onPress={() => router.push('/(app)/progress/all-weight-data')} activeOpacity={0.9}>
                <ThemedText type='titleXLarge'>Data</ThemedText>
                <Icon name='chevron-forward' style={styles.dataChevron} color={themeColors.text} />
            </TouchableOpacity>
        </View>
    );

    const renderDataSectionHeader = ({ section }: { section: { title: string } }) => (
        <ThemedText type='title' style={styles.sectionHeader}>
            {section.title}
        </ThemedText>
    );

    const renderDataItem = ({ item, section, index }: { item: UserWeightMeasurement; section: any; index: number }) => {
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
                    <ThemedText type='title' style={styles.weightText}>
                        {(bodyWeightPreference === 'pounds') ? `${kgToPounds(item.Weight)}lbs` : `${item.Weight.toFixed(1)}kg`}
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
                            {parseFloat(weightChange) > 0 ? '+' : ''}
                            {(bodyWeightPreference === 'pounds') ? `${kgToPounds(parseFloat(weightChange)).toString()}lbs` : `${weightChange}kg`  }
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Weight Tracking'
                menuIcon='plus'
                onMenuPress={handleAddWeight}
            />

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

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={handleSheetClose}
                onSubmit={isAddingWeight ? handleWeightAdd : handleWeightUpdate}
                onDelete={handleWeightDelete}
                initialWeight={selectedMeasurement?.Weight}
                initialDate={selectedMeasurement ? new Date(selectedMeasurement.MeasurementTimestamp) : undefined}
                isEditing={!!selectedMeasurement}
                getExistingData={getExistingData}
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
