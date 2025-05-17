// components/progress/SleepTrendCard.tsx

import React from 'react';
import { format } from 'date-fns';
import { TrendCard } from './TrendCard';
import { UserSleepMeasurement } from '@/types';

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

export const SleepTrendCard: React.FC<SleepTrendCardProps> = ({ values, onPress, onLogSleep, isLoading, style }) => {
    return (
        <TrendCard
            data={values}
            onPress={onPress}
            onLogData={onLogSleep}
            isLoading={isLoading}
            style={style}
            title='Sleep'
            themeColor='blueSolid'
            themeTransparentColor='blueTransparent'
            lightenBackground={false}
            formatAvgValue={formatAverageSleep}
            processData={processSleepData}
        />
    );
};
