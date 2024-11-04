import { startOfWeek, startOfMonth, subDays, subMonths, subYears, endOfWeek, endOfMonth, isSameDay, lastDayOfWeek, lastDayOfMonth, format } from 'date-fns';
import { UserWeightMeasurement } from '@/types';

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All';

export const TIME_RANGES = {
    '1W': { days: 7, label: '1 Week' },
    '1M': { days: 30, label: '1 Month' },
    '3M': { days: 90, label: '3 Months' },
    '6M': { days: 180, label: '6 Months' },
    '1Y': { days: 365, label: '1 Year' },
    All: { days: Infinity, label: 'All Time' },
};

export type AggregatedData = {
    timestamp: Date;
    weight: number;
    originalData: UserWeightMeasurement;
};

export const getTimeRangeLabel = (firstDate: Date, lastDate: Date): string => {
    const sameYear = firstDate.getFullYear() === lastDate.getFullYear();
    const formatDate = (date: Date, includeYear: boolean) => format(date, includeYear ? 'MMM d, yyyy' : 'MMM d');

    return sameYear ? `${formatDate(firstDate, false)} - ${formatDate(lastDate, true)}` : `${formatDate(firstDate, true)} - ${formatDate(lastDate, true)}`;
};

export const getTimeWindow = (timeRange: TimeRange, now: Date = new Date()) => {
    switch (timeRange) {
        case '1W':
            return {
                start: subDays(now, 7),
                end: now,
            };
        case '1M':
            return {
                start: subMonths(now, 1),
                end: now,
            };
        case '3M':
            return {
                start: subMonths(now, 3),
                end: now,
            };
        case '6M':
            return {
                start: subMonths(now, 6),
                end: now,
            };
        case '1Y':
            return {
                start: subYears(now, 1),
                end: now,
            };
        case 'All':
            return {
                start: new Date(0), // Beginning of time
                end: now,
            };
    }
};

export const aggregateData = (data: UserWeightMeasurement[], timeRange: TimeRange): AggregatedData[] => {
    if (!data.length) return [];

    const now = new Date();
    const { start, end } = getTimeWindow(timeRange, now);

    // Filter data for time range
    const filteredData = data.filter((m) => {
        const date = new Date(m.MeasurementTimestamp);
        return date >= start && date <= end;
    });

    // Sort by timestamp
    const sortedData = [...filteredData].sort((a, b) => new Date(a.MeasurementTimestamp).getTime() - new Date(b.MeasurementTimestamp).getTime());

    // Different aggregation strategies based on time range
    switch (timeRange) {
        case '1W':
        case '1M':
            // Show all data points
            return sortedData.map((measurement) => ({
                timestamp: new Date(measurement.MeasurementTimestamp),
                weight: measurement.Weight,
                originalData: measurement,
            }));

        case '3M':
        case '6M': {
            // Show last day of each week
            const weeklyData = new Map<string, UserWeightMeasurement>();

            sortedData.forEach((measurement) => {
                const date = new Date(measurement.MeasurementTimestamp);
                const weekStart = startOfWeek(date).toISOString();
                const lastDay = lastDayOfWeek(date);

                const existingMeasurement = weeklyData.get(weekStart);
                if (
                    !existingMeasurement ||
                    isSameDay(date, lastDay) ||
                    new Date(measurement.MeasurementTimestamp) > new Date(existingMeasurement.MeasurementTimestamp)
                ) {
                    weeklyData.set(weekStart, measurement);
                }
            });

            return Array.from(weeklyData.values())
                .map((measurement) => ({
                    timestamp: new Date(measurement.MeasurementTimestamp),
                    weight: measurement.Weight,
                    originalData: measurement,
                }))
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }

        case '1Y':
        case 'All': {
            // Show last day of each month
            const monthlyData = new Map<string, UserWeightMeasurement>();

            sortedData.forEach((measurement) => {
                const date = new Date(measurement.MeasurementTimestamp);
                const monthStart = startOfMonth(date).toISOString();
                const lastDay = lastDayOfMonth(date);

                const existingMeasurement = monthlyData.get(monthStart);
                if (
                    !existingMeasurement ||
                    isSameDay(date, lastDay) ||
                    new Date(measurement.MeasurementTimestamp) > new Date(existingMeasurement.MeasurementTimestamp)
                ) {
                    monthlyData.set(monthStart, measurement);
                }
            });

            return Array.from(monthlyData.values())
                .map((measurement) => ({
                    timestamp: new Date(measurement.MeasurementTimestamp),
                    weight: measurement.Weight,
                    originalData: measurement,
                }))
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
    }
};

export const calculateMovingAverage = (data: AggregatedData[], timeRange: TimeRange): number[] => {
    if (data.length < 2) return [];

    // Define window size based on time range and data density
    let windowSize: number;
    switch (timeRange) {
        case '1W':
            windowSize = Math.min(3, Math.floor(data.length / 2));
            break;
        case '1M':
            windowSize = Math.min(7, Math.floor(data.length / 3));
            break;
        case '3M':
        case '6M':
            windowSize = Math.min(4, Math.floor(data.length / 4));
            break;
        case '1Y':
        case 'All':
            windowSize = Math.min(3, Math.floor(data.length / 4));
            break;
    }

    // Ensure window size is at least 2
    windowSize = Math.max(2, windowSize);

    const ma: number[] = [];
    for (let i = 0; i < data.length; i++) {
        const startIdx = Math.max(0, i - Math.floor(windowSize / 2));
        const endIdx = Math.min(data.length, startIdx + windowSize);
        const window = data.slice(startIdx, endIdx);
        const avg = window.reduce((sum, point) => sum + point.weight, 0) / window.length;
        ma.push(avg);
    }

    return ma;
};
