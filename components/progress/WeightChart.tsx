// components/progress/WeightChart.tsx

import React from 'react';
import { BaseChart } from '../charts/BaseChart';
import { AggregatedData, TimeRange, TimeRangeOption } from '@/utils/weight';
import { UserWeightMeasurement } from '@/types';

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

export const WeightChart: React.FC<WeightChartProps> = (props) => {
    return (
        <BaseChart
            {...props}
            themeColor='purpleSolid'
            themeTransparentColor='purpleTransparent'
            getValue={(point) => point.weight}
            formatValue={(value) => `${value.toFixed(1)} kg`}
        />
    );
};
