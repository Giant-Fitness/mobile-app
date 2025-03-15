// app/(app)/progress/body-measurements-tracking.tsx

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
import { WaistChart } from '@/components/progress/WaistChart';
import { AppDispatch, RootState } from '@/store/store';
import { TimeRange, aggregateData, calculateMovingAverage, getTimeRangeLabel, getAvailableTimeRanges, getInitialTimeRange } from '@/utils/charts';
import { UserBodyMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { Icon } from '@/components/base/Icon';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { updateBodyMeasurementAsync, deleteBodyMeasurementAsync, logBodyMeasurementAsync } from '@/store/user/thunks';
import { router } from 'expo-router';
import { formatMeasurementForDisplay, cmToInches } from '@/utils/unitConversion';

const getWaistChange = (currentWaist: number, previousWaist: number | null) => {
    if (previousWaist === null) return null;
    const change = currentWaist - previousWaist;
    return change !== 0 ? change.toFixed(1) : null;
};

export default function BodyMeasurementsTrackingScreen() {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1W');
    const [availableRanges, setAvailableRanges] = useState<ReturnType<typeof getAvailableTimeRanges>>([]);
    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { userBodyMeasurements } = useSelector((state: RootState) => state.user);
    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [isAddingBodyMeasurement, setIsAddingBodyMeasurement] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserBodyMeasurement | null>(null);
    const measurementUnit = useSelector(
        (state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits as 'cms' | 'inches') || 'cms',
    );
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (userBodyMeasurements.length) {
            const ranges = getAvailableTimeRanges(userBodyMeasurements);
            setAvailableRanges(ranges);
            setSelectedTimeRange(getInitialTimeRange(userBodyMeasurements));
        }
    }, [userBodyMeasurements]);

    // Handlers for body measurements modifications
    const handleBodyMeasurementUpdate = async (measurements: Record<string, number>) => {
        if (!selectedMeasurement) return;

        try {
            await dispatch(
                updateBodyMeasurementAsync({
                    timestamp: selectedMeasurement.MeasurementTimestamp,
                    measurements: measurements,
                }),
            ).unwrap();
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to update body measurement:', error);
        }
    };

    const handleBodyMeasurementAdd = async (measurements: Record<string, number>, date: Date) => {
        try {
            await dispatch(
                logBodyMeasurementAsync({
                    measurements: measurements,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingBodyMeasurement(false);
        } catch (error) {
            console.error('Failed to log body measurement:', error);
        }
    };

    const handleBodyMeasurementDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to delete body measurement:', error);
        }
    };

    const handleTilePress = (measurement: UserBodyMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsBodyMeasurementsSheetVisible(true);
    };

    const handleDataPointPress = (measurement: UserBodyMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsBodyMeasurementsSheetVisible(true);
    };

    const handleAddBodyMeasurement = () => {
        setSelectedMeasurement(null); // Ensure we're not in edit mode
        setIsAddingBodyMeasurement(true);
        setIsBodyMeasurementsSheetVisible(true);
    };

    const handleSheetClose = () => {
        setIsBodyMeasurementsSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingBodyMeasurement(false);
    };

    const getExistingData = (date: Date) => {
        return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    // Filter and process body measurements data to match chart format
    const processedBodyMeasurements = useMemo(() => {
        return userBodyMeasurements
            .filter((m) => m.waist !== undefined)
            .sort((a, b) => new Date(a.MeasurementTimestamp).getTime() - new Date(b.MeasurementTimestamp).getTime());
    }, [userBodyMeasurements]);

    const { aggregatedData, effectiveTimeRange, waistChange, averageWaist, yAxisRange, movingAverages } = useMemo(() => {
        if (!processedBodyMeasurements.length) {
            return {
                aggregatedData: [],
                effectiveTimeRange: '',
                waistChange: 0,
                averageWaist: 0,
                yAxisRange: { min: 0, max: 100 },
                movingAverages: [],
            };
        }

        const aggregated = aggregateData(processedBodyMeasurements, selectedTimeRange);

        // Map the waist values from the aggregated data
        const waistValues = aggregated.map((d) => d.waist ?? 0);

        const avg = waistValues.length > 0 ? waistValues.reduce((a, b) => a + b, 0) / waistValues.length : 0;
        const change = waistValues.length > 1 ? (aggregated[aggregated.length - 1]?.waist ?? 0) - (aggregated[0]?.waist ?? 0) : 0;

        const minWaist = Math.min(...waistValues);
        const maxWaist = Math.max(...waistValues);
        const range = maxWaist - minWaist;
        const paddingFactor = range > 20 ? 0.03 : 0.05; // 3% or 5% padding depending on range
        const padding = Math.max(range * paddingFactor, 0.3); // Minimum padding of 0.3 units

        return {
            aggregatedData: aggregated,
            effectiveTimeRange: aggregated.length > 0 ? getTimeRangeLabel(aggregated[0].timestamp, aggregated[aggregated.length - 1].timestamp) : '',
            waistChange: change,
            averageWaist: avg,
            yAxisRange: {
                min: Math.max(0, Math.floor(minWaist - padding)),
                max: Math.ceil(maxWaist + padding),
            },
            movingAverages: aggregated.length > 0 ? calculateMovingAverage(aggregated, selectedTimeRange) : [],
        };
    }, [processedBodyMeasurements, selectedTimeRange]);

    const groupedData = useMemo(() => {
        if (!userBodyMeasurements.length) return [];

        const now = new Date();
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const filteredMeasurements = userBodyMeasurements
            .filter((m) => m.waist !== undefined)
            .filter((measurement) => {
                const date = new Date(measurement.MeasurementTimestamp);
                return date >= twoMonthsAgo;
            });

        filteredMeasurements.sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

        const groups: { title: string; data: UserBodyMeasurement[] }[] = [];
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
    }, [userBodyMeasurements]);

    const renderListHeader = () => (
        <View>
            <View style={styles.header}>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { borderColor: themeColors.tangerineSolid }]} />
                        <ThemedText type='bodyXSmall'>Waist</ThemedText>
                    </View>
                    <View style={[styles.legendItem, { marginLeft: Spaces.MD }]}>
                        <View style={[styles.legendLine, { backgroundColor: lightenColor(themeColors.tangerineSolid, 0.6) }]} />
                        <ThemedText type='bodyXSmall'>Trend Line</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.insightsContainer}>
                <View style={styles.insightItem}>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                        Average
                    </ThemedText>
                    <ThemedText type='titleXLarge'>{formatMeasurementForDisplay(averageWaist, measurementUnit)}</ThemedText>
                </View>
                <View style={[styles.insightItem, { marginLeft: Spaces.XXXL }]}>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                        Change
                    </ThemedText>
                    <ThemedText
                        type='titleXLarge'
                        style={{
                            color: waistChange > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                        }}
                    >
                        {waistChange > 0 ? '+' : ''}
                        {formatMeasurementForDisplay(waistChange, measurementUnit)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <WaistChart
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

            <TouchableOpacity style={styles.dataButton} onPress={() => router.push('/(app)/progress/all-waist-data')} activeOpacity={0.9}>
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

    const renderDataItem = ({ item, section, index }: { item: UserBodyMeasurement; section: any; index: number }) => {
        if (item.waist === undefined) return null;

        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const previousWaist = index < section.data.length - 1 ? section.data[index + 1].waist : null;
        const waistChange = getWaistChange(item.waist || 0, previousWaist);

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.5) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type='caption'>
                        {dayOfWeek}, {`${month} ${day}`}
                    </ThemedText>
                    <ThemedText type='title' style={styles.waistText}>
                        {formatMeasurementForDisplay(item.waist || 0, measurementUnit)}
                    </ThemedText>
                </View>
                {waistChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type='bodySmall'
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(waistChange) > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {parseFloat(waistChange) > 0 ? '+' : ''}
                            {measurementUnit === 'inches' ? `${cmToInches(parseFloat(waistChange)).toFixed(1)} in` : `${waistChange} cm`}
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
                title='Waist Tracking'
                menuIcon='plus'
                onMenuPress={handleAddBodyMeasurement}
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

            <BodyMeasurementsLoggingSheet
                visible={isBodyMeasurementsSheetVisible}
                onClose={handleSheetClose}
                onSubmit={isAddingBodyMeasurement ? handleBodyMeasurementAdd : handleBodyMeasurementUpdate}
                onDelete={handleBodyMeasurementDelete}
                isLoading={false}
                getExistingData={getExistingData}
                initialDate={selectedMeasurement ? new Date(selectedMeasurement.MeasurementTimestamp) : undefined}
                isEditing={!!selectedMeasurement}
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
    waistText: {
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
