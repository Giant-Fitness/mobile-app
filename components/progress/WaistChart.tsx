import { RootState } from '@/store/store';
import { AggregatedData, TimeRange, TimeRangeOption } from '@/utils/charts';
import { cmToInches } from '@/utils/unitConversion';
import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { BaseChart } from '../charts/BaseChart';

type WaistChartProps = {
    data: AggregatedData[];
    timeRange: TimeRange;
    availableRanges: TimeRangeOption[];
    onRangeChange: (range: TimeRange) => void;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: any) => void;
    style?: any;
};

export const WaistChart: React.FC<WaistChartProps> = ({ data, yAxisRange, movingAverages, ...props }) => {
    const measurementUnit = useSelector(
        (state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits as 'cms' | 'inches') || 'cms',
    );

    // Convert everything to the display unit (cm or inches) before giving to BaseChart
    const convertedData = useMemo(() => {
        if (measurementUnit === 'inches') {
            return data.map((point) => ({
                ...point,
                waist: point.waist, // Keep original cm value
            }));
        }
        return data;
    }, [data, measurementUnit]);

    // Convert axis range to display unit
    const convertedAxisRange = useMemo(() => {
        if (measurementUnit === 'inches') {
            return {
                min: cmToInches(yAxisRange.min),
                max: cmToInches(yAxisRange.max),
            };
        }
        return yAxisRange;
    }, [yAxisRange, measurementUnit]);

    // Convert moving averages to display unit
    const convertedMovingAverages = useMemo(() => {
        if (measurementUnit === 'inches') {
            return movingAverages.map((avg) => cmToInches(avg));
        }
        return movingAverages;
    }, [movingAverages, measurementUnit]);

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
            themeColor='tangerineSolid'
            themeTransparentColor='tangerineTransparent'
            getValue={(point) => (measurementUnit === 'inches' ? cmToInches(point.waist || 0) : point.waist || 0)}
            formatValue={(value) => (measurementUnit === 'inches' ? `${value.toFixed(1)} in` : `${value.toFixed(1)} cm`)}
            formatYAxisLabel={(value) => value.toFixed(1)}
            getGridLineValues={getGridLineValues}
        />
    );
};
