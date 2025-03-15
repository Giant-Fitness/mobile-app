// components/progress/BodyMeasurementsTrendCard.tsx

import React from 'react';
import { format } from 'date-fns';
import { TrendCard } from './TrendCard';
import { UserBodyMeasurement } from '@/types';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { formatMeasurementForDisplay } from '@/utils/unitConversion';

type BodyMeasurementsTrendCardProps = {
    values: UserBodyMeasurement[];
    onPress: () => void;
    onLogBodyMeasurements: () => void;
    isLoading?: boolean;
    style?: any;
};

const formatAverageWaistMeasurement = (waist: number, measurementUnit: 'cms' | 'inches'): string => {
    return `${formatMeasurementForDisplay(waist, measurementUnit)} (average)`;
};

const processBodyMeasurementsData = (values: UserBodyMeasurement[]) => {
    if (!values?.length) {
        return { processedData: [], dateRange: '', average: 0 };
    }

    // Only process measurements that have waist data
    const validData = values
        .filter((v) => typeof v.waist === 'number' && !isNaN(v.waist))
        .sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

    const recentData = validData.slice(0, 7).reverse();

    if (recentData.length < 2) {
        return {
            processedData: [],
            dateRange: 'Not enough data',
            average: recentData[0]?.waist || 0,
        };
    }

    // Calculate average
    const avg = recentData.reduce((sum, v) => sum + (v.waist || 0), 0) / recentData.length;

    const startDate = format(new Date(recentData[0].MeasurementTimestamp), 'MMM d');
    const endDate = format(new Date(recentData[recentData.length - 1].MeasurementTimestamp), 'MMM d');

    // Calculate min/max for graph scaling
    const minWaist = Math.min(...recentData.map((d) => d.waist || 0));
    const maxWaist = Math.max(...recentData.map((d) => d.waist || 0));
    const waistPadding = (maxWaist - minWaist) * 0.5;
    const adjustedMinWaist = Math.max(0, minWaist - waistPadding);
    const adjustedMaxWaist = maxWaist + waistPadding;
    const waistRange = adjustedMaxWaist - adjustedMinWaist;

    const processedData = recentData.map((d, i) => ({
        x: (i / (recentData.length - 1)) * 100,
        y: 40 - 4 - (((d.waist || 0) - adjustedMinWaist) / waistRange) * (40 - 8),
        value: d.waist || 0,
    }));

    return {
        processedData,
        dateRange: `${startDate} - ${endDate}`,
        average: avg,
    };
};

export const BodyMeasurementsTrendCard: React.FC<BodyMeasurementsTrendCardProps> = ({ values, onPress, onLogBodyMeasurements, isLoading, style }) => {
    const measurementUnit = useSelector(
        (state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits as 'cms' | 'inches') || 'cms',
    );

    return (
        <TrendCard
            data={values}
            onPress={onPress}
            onLogData={onLogBodyMeasurements}
            isLoading={isLoading}
            style={style}
            title='Waist Trend'
            themeColor='tangerineSolid'
            themeTransparentColor='tangerineTransparent'
            formatAvgValue={(value) => formatAverageWaistMeasurement(value, measurementUnit)}
            processData={processBodyMeasurementsData}
        />
    );
};
