// components/progress/WeightChart.tsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BaseChart } from '../charts/BaseChart';
import { AggregatedData, TimeRange, TimeRangeOption } from '@/utils/charts';
import { UserWeightMeasurement } from '@/types';
import { RootState } from '@/store/store';
import { kgToPounds } from '@/utils/weightConversion';

type WeightChartProps = {
    data: AggregatedData[];
    timeRange: TimeRange;
    availableRanges: TimeRangeOption[];
    onRangeChange: (range: TimeRange) => void;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: UserWeightMeasurement) => void;
    style?: any;
};

export const WeightChart: React.FC<WeightChartProps> = ({ data, yAxisRange, movingAverages, ...props }) => {
    const bodyWeightPreference = useSelector((state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits as 'kgs' | 'lbs') || 'kgs');

    // Convert everything to the display unit (kg or lbs) before giving to BaseChart
    const convertedData = useMemo(() => {
        if (bodyWeightPreference === 'lbs') {
            return data.map((point) => ({
                ...point,
                weight: point.weight, // Keep original kg value
            }));
        }
        return data;
    }, [data, bodyWeightPreference]);

    // Convert axis range to display unit
    const convertedAxisRange = useMemo(() => {
        if (bodyWeightPreference === 'lbs') {
            return {
                min: kgToPounds(yAxisRange.min),
                max: kgToPounds(yAxisRange.max),
            };
        }
        return yAxisRange;
    }, [yAxisRange, bodyWeightPreference]);

    // Keep moving averages in kg
    const convertedMovingAverages = useMemo(() => {
        if (bodyWeightPreference === 'lbs') {
            return movingAverages.map((avg) => kgToPounds(avg));
        }
        return movingAverages;
    }, [movingAverages, bodyWeightPreference]);

    const getGridLineValues = (min: number, max: number) => {
        const range = max - min;
        const step = range / 4;
        const roundedStep = Math.ceil(step);
        return Array.from({ length: 5 }, (_, i) => {
            const value = max - roundedStep * i;
            return Math.round(value * 10) / 10;
        });
    };

    return (
        <BaseChart
            {...props}
            data={convertedData}
            yAxisRange={convertedAxisRange}
            movingAverages={convertedMovingAverages}
            themeColor='purpleSolid'
            themeTransparentColor='purpleTransparent'
            getValue={(point) => (bodyWeightPreference === 'lbs' ? kgToPounds(point.weight) : point.weight)}
            formatValue={(value) => (bodyWeightPreference === 'lbs' ? `${value.toFixed(1)} lbs` : `${value.toFixed(1)} kg`)}
            formatYAxisLabel={(value) => value.toFixed(1)}
            getGridLineValues={getGridLineValues}
        />
    );
};
