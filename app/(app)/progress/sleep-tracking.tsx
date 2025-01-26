//getAvailableTimeRanges, getInitalTimeRanges, aggregateData, 

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
import { UserSleepMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { Icon } from '@/components/base/Icon';
import { SleepLoggingSheet } from '@/components/sleep/SleepLoggingSheet';
import { logSleepMeasurementAsync } from '@/store/user/thunks';
import { router } from 'expo-router';

const getSleepChange = (currentSleep: number, previousSleep: number | null) => {
    if (previousSleep === null) return null;
    const change = currentSleep - previousSleep;
    return change !== 0 ? change.toFixed(1) : null;
};

export default function SleepTrackingScreen() {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1W');
    const [availableRanges, setAvailableRanges] = useState<ReturnType<typeof getAvailableTimeRanges>>([]);
    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { userSleepMeasurements } = useSelector((state: RootState) => state.user);
    const [isSleepSheetVisible, setIsSleepSheetVisible] = useState(false);
    const [isAddingSleep, setIsAddingSleep] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserSleepMeasurement | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (userSleepMeasurements.length) {
            const ranges = getAvailableTimeRanges(userSleepMeasurements);
            setAvailableRanges(ranges);
            setSelectedTimeRange(getInitialTimeRange(userSleepMeasurements));
        }
    }, [userSleepMeasurements]);

    const handleSleepAdd = async (duration: number, date: Date) => {
        try {
            await dispatch(
                logSleepMeasurementAsync({
                    durationInMinutes: duration,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingSleep(false);
        } catch (error) {
            console.error('Failed to log sleep:', error);
        }
    };

    const handleTilePress = (measurement: UserSleepMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsSleepSheetVisible(true);
    };

    const handleSheetClose = () => {
        setIsSleepSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingSleep(false);
    };

    const getExistingData = (date: Date) => {
        return userSleepMeasurements.find(
            (m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString(),
        );
    };

    const { aggregatedData, effectiveTimeRange, sleepChange, averageSleep, yAxisRange, movingAverages } = useMemo(() => {
        if (!userSleepMeasurements.length) {
            return {
                aggregatedData: [],
                effectiveTimeRange: '',
                sleepChange: 0,
                averageSleep: 0,
                yAxisRange: { min: 0, max: 100 },
                movingAverages: [],
            };
        }

        const aggregated = aggregateData(userSleepMeasurements, selectedTimeRange);
        const durations = aggregated.map((d) => d.weight);
        const avg = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
        const change = durations.length > 1 ? aggregated[aggregated.length - 1].weight - aggregated[0].weight : 0;
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        const range = maxDuration - minDuration;
        const padding = Math.max(range * 0.1, 1);

        return {
            aggregatedData: aggregated,
            effectiveTimeRange: aggregated.length > 0 ? getTimeRangeLabel(aggregated[0].timestamp, aggregated[aggregated.length - 1].timestamp) : '',
            sleepChange: change,
            averageSleep: avg,
            yAxisRange: {
                min: durations.length > 0 ? Math.floor(minDuration - padding) : 0,
                max: durations.length > 0 ? Math.ceil(maxDuration + padding) : 100,
            },
            movingAverages: aggregated.length > 0 ? calculateMovingAverage(aggregated, selectedTimeRange) : [],
        };
    }, [userSleepMeasurements, selectedTimeRange]);

    const groupedData = useMemo(() => {
        if (!userSleepMeasurements.length) return [];

        const now = new Date();
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const filteredMeasurements = userSleepMeasurements.filter((measurement) => {
            const date = new Date(measurement.MeasurementTimestamp);
            return date >= twoMonthsAgo && date <= now;
        });

        filteredMeasurements.sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

        const groups: { title: string; data: UserSleepMeasurement[] }[] = [];
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
    }, [userSleepMeasurements]);

    const renderListHeader = () => (
        <View>
            <View style={styles.header}>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { borderColor: themeColors.blueSolid }]} />
                        <ThemedText type="bodyXSmall">Sleep</ThemedText>
                    </View>
                    <View style={[styles.legendItem, { marginLeft: Spaces.MD }]}>
                        <View style={[styles.legendLine, { backgroundColor: lightenColor(themeColors.blueSolid, 0.6) }]} />
                        <ThemedText type="bodyXSmall">Trend Line</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.insightsContainer}>
                <View style={styles.insightItem}>
                    <ThemedText type="bodySmall" style={[{ color: themeColors.subText }]}>Average Sleep</ThemedText>
                    <ThemedText type="titleXLarge">{averageSleep.toFixed(1)} minutes</ThemedText>
                </View>
                <View style={[styles.insightItem, { marginLeft: Spaces.XXXL }]}>
                    <ThemedText type="bodySmall" style={[{ color: themeColors.subText }]}>Change</ThemedText>
                    <ThemedText
                        type="titleXLarge"
                        style={{ color: sleepChange > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3) }}
                    >
                        {sleepChange > 0 ? '+' : ''}
                        {sleepChange.toFixed(1)} minutes
                    </ThemedText>
                </View>
            </View>
{/* 
            <View style={styles.chartContainer}>
                <WeightChart
                    data={aggregatedData}
                    timeRange={selectedTimeRange}
                    availableRanges={availableRanges}
                    onRangeChange={setSelectedTimeRange}
                    yAxisRange={yAxisRange}
                    movingAverages={movingAverages}
                    effectiveTimeRange={effectiveTimeRange}
                    onDataPointPress={handleTilePress}
                />
            </View> */}

            <TouchableOpacity style={styles.dataButton} onPress={() => router.push('/(app)/progress/all-weight-data')} activeOpacity={0.9}>
                <ThemedText type="titleXLarge">Data</ThemedText>
                <Icon name="chevron-forward" style={styles.dataChevron} color={themeColors.text} />
            </TouchableOpacity>
        </View>
    );

    const renderDataSectionHeader = ({ section }: { section: { title: string } }) => (
        <ThemedText type="title" style={styles.sectionHeader}>{section.title}</ThemedText>
    );

    const renderDataItem = ({ item, section, index }: { item: UserSleepMeasurement; section: any; index: number }) => {
        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const previousSleep = index < section.data.length - 1 ? section.data[index + 1].DurationInMinutes : null;
        const sleepChange = getSleepChange(item.DurationInMinutes, previousSleep);

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.blueTransparent, 0.5) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type="caption">
                        {dayOfWeek}, {`${month} ${day}`}
                    </ThemedText>
                    <ThemedText type="title" style={styles.sleepText}>{item.DurationInMinutes} minutes</ThemedText>
                </View>
                {sleepChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type="bodySmall"
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(sleepChange) > 0
                                        ? themeColors.maroonSolid
                                        : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {parseFloat(sleepChange) > 0 ? '+' : ''}
                            {sleepChange} minutes
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
                title="Sleep Tracking"
                menuIcon="plus"
                onMenuPress={() => setIsAddingSleep(true)}
            />

            <SectionList
                sections={groupedData}
                keyExtractor={(item) => item.MeasurementTimestamp}
                renderSectionHeader={renderDataSectionHeader}
                renderItem={renderDataItem}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={() => (
                    <ThemedText type="bodyMedium" style={styles.emptyText}>No data available.</ThemedText>
                )}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                    scrollY.value = event.nativeEvent.contentOffset.y;
                }}
            />

            <SleepLoggingSheet
                visible={isSleepSheetVisible}
                onClose={handleSheetClose}
                onSubmit={handleSleepAdd}
                initialSleep={selectedMeasurement?.DurationInMinutes}
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
    sleepText: {
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
