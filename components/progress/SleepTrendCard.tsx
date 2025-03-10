// components/progress/SleepTrendCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { TrendCard } from './TrendCard';
import { UserSleepMeasurement } from '@/types';
import { Spaces } from '@/constants/Spaces';

type SleepTrendCardProps = {
    values: UserSleepMeasurement[];
    onPress: () => void;
    onLogSleep: () => void;
    isLoading?: boolean;
    style?: any;
};

const formatSleepDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};

const formatAverageSleep = (minutes: number): string => {
    return formatSleepDuration(minutes) + ' (average)';
};

const processSleepData = (values: UserSleepMeasurement[]) => {
    if (!values?.length) {
        return { processedData: [], dateRange: '', average: 0 };
    }

    const validData = values
        .filter((v) => typeof v.DurationInMinutes === 'number' && !isNaN(v.DurationInMinutes))
        .sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

    const recentData = validData.slice(0, 7).reverse();

    if (recentData.length < 2) {
        return {
            processedData: [],
            dateRange: 'Not enough data',
            average: recentData[0]?.DurationInMinutes || 0,
        };
    }

    const avg = recentData.reduce((sum, v) => sum + v.DurationInMinutes, 0) / recentData.length;
    const startDate = format(new Date(recentData[0].MeasurementTimestamp), 'MMM d');
    const endDate = format(new Date(recentData[recentData.length - 1].MeasurementTimestamp), 'MMM d');

    const minSleep = Math.min(...recentData.map((d) => d.DurationInMinutes));
    const maxSleep = Math.max(...recentData.map((d) => d.DurationInMinutes));
    const sleepPadding = (maxSleep - minSleep) * 0.5;
    const adjustedMinSleep = Math.max(0, minSleep - sleepPadding);
    const adjustedMaxSleep = maxSleep + sleepPadding;
    const sleepRange = adjustedMaxSleep - adjustedMinSleep || 1;

    const processedData = recentData.map((d, i) => ({
        x: (i / (recentData.length - 1)) * 100,
        y: 40 - 4 - ((d.DurationInMinutes - adjustedMinSleep) / sleepRange) * (40 - 8),
        value: d.DurationInMinutes,
    }));

    return {
        processedData,
        dateRange: `${startDate} - ${endDate}`,
        average: avg,
    };
};

const SingleSleepDataPoint = ({ measurement, onPress, themeColors }: { measurement: UserSleepMeasurement; onPress: () => void; themeColors: any }) => {
    const measurementDate = new Date(measurement.MeasurementTimestamp);
    const today = new Date();
    const isToday = measurementDate.toDateString() === today.toDateString();
    const formattedDate = format(measurementDate, 'MMM d, yyyy');

    const content = (
        <View style={styles.singleDataContainer}>
            <View style={styles.singleDataContent}>
                <View style={styles.firstMeasurementContainer}>
                    <ThemedText type='bodyMedium' style={styles.firstMeasurementLabel}>
                        {isToday ? "Today's Measurement" : 'First Measurement'}
                    </ThemedText>
                    <ThemedText type='titleLarge' style={[styles.sleepValue, { color: themeColors.blueSolid }]}>
                        {formatSleepDuration(measurement.DurationInMinutes)}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.dateText, { color: themeColors.subText }]}>
                        {formattedDate}
                    </ThemedText>
                </View>
                {isToday ? (
                    <View style={styles.messageContainer}>
                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Great start! Come back tomorrow to log your next measurement.
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={[styles.addNextButton, { backgroundColor: themeColors.blueSolid }]} onPress={onPress} activeOpacity={0.8}>
                            <Icon name='plus' size={18} color={themeColors.white} style={styles.addIcon} />
                            <ThemedText type='button' style={[styles.buttonText, { color: themeColors.white }]}>
                                Add Next Measurement
                            </ThemedText>
                        </TouchableOpacity>
                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Add another measurement
                        </ThemedText>
                    </>
                )}
            </View>
        </View>
    );

    return isToday ? (
        content
    ) : (
        <TouchableOpacity style={styles.contentWrapper} onPress={onPress} activeOpacity={0.8}>
            {content}
        </TouchableOpacity>
    );
};

export const SleepTrendCard: React.FC<SleepTrendCardProps> = ({ values, onPress, onLogSleep, isLoading, style }) => {
    return (
        <TrendCard
            data={values}
            onPress={onPress}
            onLogData={onLogSleep}
            isLoading={isLoading}
            style={style}
            title='Sleep Trend'
            themeColor='blueSolid'
            themeTransparentColor='blueTransparent'
            emptyStateTitle='Track Your Sleep Journey'
            emptyStateDescription='Track your sleep regularly to start getting more personalized training advice.'
            formatValue={formatAverageSleep}
            processData={processSleepData}
            renderSingleDataPoint={SingleSleepDataPoint}
        />
    );
};

const styles = StyleSheet.create({
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
    sleepValue: {
        fontSize: 28,
        fontWeight: '600',
        paddingTop: Spaces.MD,
        marginBottom: Spaces.XXS,
    },
    dateText: {
        marginBottom: Spaces.SM,
    },
    messageContainer: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.MD,
        width: '100%',
    },
    helperText: {
        textAlign: 'center',
        marginTop: Spaces.XXS,
    },
    addNextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.SM,
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
