// components/progress/WeightTrendCard.tsx

import React from 'react';
import { format } from 'date-fns';
import { TrendCard } from './TrendCard';
import { UserWeightMeasurement } from '@/types';
import { formatWeightForDisplay } from '@/utils/unitConversion';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

type WeightTrendCardProps = {
    values: UserWeightMeasurement[];
    onPress: () => void;
    onLogWeight: () => void;
    isLoading?: boolean;
    style?: any;
};

const formatAverageWeight = (weight: number, bodyWeightPreference: 'kgs' | 'lbs'): string => {
    return formatWeightForDisplay(weight, bodyWeightPreference) + ' (avg)';
};

const processWeightData = (values: UserWeightMeasurement[]) => {
    if (!values?.length) {
        return { processedData: [], dateRange: '', average: 0 };
    }

    const validData = values
        .filter((v) => typeof v.Weight === 'number' && !isNaN(v.Weight))
        .sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

    const recentData = validData.slice(0, 7).reverse();

    if (recentData.length < 2) {
        return {
            processedData: [],
            dateRange: 'Not enough data',
            average: recentData[0]?.Weight || 0,
        };
    }

    // Calculate average using stored kg values for accuracy
    const avg = recentData.reduce((sum, v) => sum + v.Weight, 0) / recentData.length;

    const startDate = format(new Date(recentData[0].MeasurementTimestamp), 'MMM d');
    const endDate = format(new Date(recentData[recentData.length - 1].MeasurementTimestamp), 'MMM d');

    // Use kg values for calculating graph dimensions
    const minWeight = Math.min(...recentData.map((d) => d.Weight));
    const maxWeight = Math.max(...recentData.map((d) => d.Weight));
    const weightPadding = (maxWeight - minWeight) * 0.5;
    const adjustedMinWeight = Math.max(0, minWeight - weightPadding);
    const adjustedMaxWeight = maxWeight + weightPadding;
    const weightRange = adjustedMaxWeight - adjustedMinWeight;

    const processedData = recentData.map((d, i) => ({
        x: (i / (recentData.length - 1)) * 100,
        y: 40 - 4 - ((d.Weight - adjustedMinWeight) / weightRange) * (40 - 8),
        value: d.Weight, // Store original kg value
    }));

    return {
        processedData,
        dateRange: `${startDate} - ${endDate}`,
        average: avg,
    };
};

export const WeightTrendCard: React.FC<WeightTrendCardProps> = ({ values, onPress, onLogWeight, isLoading, style }) => {
    const bodyWeightPreference = useSelector((state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits as 'kgs' | 'lbs') || 'kgs');

    return (
        <TrendCard
            data={values}
            onPress={onPress}
            onLogData={onLogWeight}
            isLoading={isLoading}
            style={style}
            title='Weight Trend'
            themeColor='purpleSolid'
            themeTransparentColor='purpleTransparent'
            valueKey='Weight'
            formatAvgValue={(value) => formatAverageWeight(value, bodyWeightPreference)}
            processData={processWeightData}
        />
    );
};
