// components/progress/SleepChart.tsx

import React from 'react';
import { BaseChart } from '../charts/BaseChart';
import { AggregatedData, TimeRange, TimeRangeOption } from '@/utils/charts';
import { UserSleepMeasurement } from '@/types';

type SleepChartProps = {
    data: AggregatedData[];
    timeRange: TimeRange;
    availableRanges: TimeRangeOption[];
    onRangeChange: (range: TimeRange) => void;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: UserSleepMeasurement) => void;
    style?: any;
};

const formatMinutesToHourMin = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) {
        return `${mins}m`;
    }
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h${mins}m`;
};

const getSleepGridLineValues = (min: number, max: number): number[] => {
    // Define possible intervals in minutes
    const intervals = [60, 120, 180, 240];

    // Find appropriate interval that won't create too many lines
    let interval = intervals[0];
    for (const possibleInterval of intervals) {
        const roundedMin = Math.floor(min / possibleInterval) * possibleInterval;
        const roundedMax = Math.ceil(max / possibleInterval) * possibleInterval;
        const numLines = Math.floor((roundedMax - roundedMin) / possibleInterval) + 1;

        if (numLines <= 6) {
            interval = possibleInterval;
            break;
        }
    }

    // Round min and max to nearest interval
    const roundedMin = Math.floor(min / interval) * interval;
    const roundedMax = Math.ceil(max / interval) * interval;

    // Generate values
    const values: number[] = [];
    for (let value = roundedMin; value <= roundedMax; value += interval) {
        values.push(value);
    }

    return values;
};

export const SleepChart: React.FC<SleepChartProps> = (props) => {
    return (
        <BaseChart
            {...props}
            themeColor='blueSolid'
            themeTransparentColor='blueTransparent'
            getValue={(point) => point.durationInMinutes ?? 0}
            formatValue={(value) => formatMinutesToHourMin(value)}
            formatYAxisLabel={formatMinutesToHourMin}
            getGridLineValues={getSleepGridLineValues}
        />
    );
};
