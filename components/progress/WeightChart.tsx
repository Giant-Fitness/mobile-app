import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Path, Svg, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { format } from 'date-fns';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spaces } from '@/constants/Spaces';
import { AggregatedData, TimeRange } from '@/utils/weight';
import { UserWeightMeasurement } from '@/types';
import { ThemedText } from '@/components/base/ThemedText';
import { darkenColor, lightenColor } from '@/utils/colorUtils';

const CHART_PADDING = {
    top: 48,
    right: 35,
    bottom: 10,
    left: 5,
};
const NUM_HORIZONTAL_LINES = 3;
const TOOLTIP_HEIGHT = 50;
const TOOLTIP_WIDTH = 120;
const TOOLTIP_PADDING = 8;
const TOOLTIP_ARROW_SIZE = 0;
const TOOLTIP_OFFSET_Y = 20;

type Point = {
    x: number;
    y: number;
    weight: number;
    timestamp: Date;
    originalData: UserWeightMeasurement;
};

type WeightChartProps = {
    data: AggregatedData[];
    timeRange: TimeRange;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: UserWeightMeasurement) => void;
    style?: any;
};

export const WeightChart: React.FC<WeightChartProps> = ({ data, timeRange, yAxisRange, movingAverages, effectiveTimeRange, onDataPointPress, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - Spaces.MD * 2;
    const chartHeight = 300;
    const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    const plotHeight = chartHeight - CHART_PADDING.top - CHART_PADDING.bottom;

    // Generate grid lines
    const gridLines = React.useMemo(() => {
        const range = yAxisRange.max - yAxisRange.min;
        const step = range / (NUM_HORIZONTAL_LINES - 1);
        return Array.from({ length: NUM_HORIZONTAL_LINES }, (_, i) => {
            const weight = yAxisRange.max - step * i;
            const y = CHART_PADDING.top + i * (plotHeight / (NUM_HORIZONTAL_LINES - 1));
            return { weight, y };
        });
    }, [yAxisRange, plotHeight]);

    // Scale data points to chart dimensions
    const points = React.useMemo(() => {
        if (!data.length) return [];

        const timeStart = data[0].timestamp.getTime();
        const timeEnd = data[data.length - 1].timestamp.getTime();
        const timeRange = timeEnd - timeStart;

        return data.map((point) => ({
            x: CHART_PADDING.left + ((point.timestamp.getTime() - timeStart) / timeRange) * plotWidth,
            y: CHART_PADDING.top + ((yAxisRange.max - point.weight) / (yAxisRange.max - yAxisRange.min)) * plotHeight,
            weight: point.weight,
            timestamp: point.timestamp,
            originalData: point.originalData,
        }));
    }, [data, plotWidth, plotHeight, yAxisRange]);

    // Generate smooth path
    const generateSmoothPath = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const x1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
            const x2 = points[i].x - (points[i].x - points[i - 1].x) / 3;
            path += ` C ${x1} ${points[i - 1].y}, ${x2} ${points[i].y}, ${points[i].x} ${points[i].y}`;
        }

        return path;
    };

    const renderTooltip = () => {
        if (!selectedPoint) return null;

        const tooltipY = TOOLTIP_OFFSET_Y;
        const tooltipX = Math.max(CHART_PADDING.left, Math.min(selectedPoint.x - TOOLTIP_WIDTH / 2, chartWidth - TOOLTIP_WIDTH - CHART_PADDING.right));

        return (
            <G>
                {/* Vertical dotted line */}
                <Line
                    x1={selectedPoint.x}
                    y1={tooltipY + TOOLTIP_HEIGHT + TOOLTIP_ARROW_SIZE}
                    x2={selectedPoint.x}
                    y2={chartHeight - CHART_PADDING.bottom}
                    stroke={themeColors.purpleSolid}
                    strokeWidth={0.8}
                    strokeDasharray='4,8'
                />

                {/* Tooltip background */}
                <Path
                    d={`
                        M ${tooltipX} ${tooltipY}
                        h ${TOOLTIP_WIDTH}
                        v ${TOOLTIP_HEIGHT}
                        h ${-TOOLTIP_WIDTH}
                        Z
                    `}
                    fill={themeColors.purpleTransparent}
                />

                {/* Tooltip content */}
                <SvgText x={tooltipX + TOOLTIP_WIDTH / 2 - 12} y={tooltipY + TOOLTIP_PADDING + 12} fill={themeColors.subText} fontSize={12} textAnchor='middle'>
                    {format(selectedPoint.timestamp, 'MMM d, yyyy')}
                </SvgText>
                <SvgText x={tooltipX + TOOLTIP_WIDTH / 2 - 32} y={tooltipY + TOOLTIP_PADDING + 32} fill={themeColors.text} fontSize={14} textAnchor='middle'>
                    {selectedPoint.weight.toFixed(1)} kg
                </SvgText>

                {/* Manual Chevron */}
                {/* <Path
                    d={`M ${tooltipX + TOOLTIP_WIDTH - 15} ${tooltipY + TOOLTIP_PADDING + 20} 
                       L ${tooltipX + TOOLTIP_WIDTH - 10} ${tooltipY + TOOLTIP_PADDING + 25} 
                       L ${tooltipX + TOOLTIP_WIDTH - 15} ${tooltipY + TOOLTIP_PADDING + 30}`}
                    stroke={themeColors.text}
                    strokeWidth={1}
                    fill="none"
                /> */}
            </G>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={() => setSelectedPoint(null)}>
            <View style={[styles.container, style, { backgroundColor: themeColors.background }]}>
                <ThemedText type='bodySmall' style={[styles.timeRangeLabel, { color: themeColors.subText }]}>
                    {effectiveTimeRange}
                </ThemedText>

                <View style={styles.chartContainer}>
                    <Svg width={chartWidth} height={chartHeight}>
                        {/* Grid lines */}
                        {gridLines.map(({ y, weight }, index) => (
                            <React.Fragment key={index}>
                                <Line
                                    x1={CHART_PADDING.left}
                                    y1={y}
                                    x2={chartWidth - CHART_PADDING.right}
                                    y2={y}
                                    stroke={lightenColor(themeColors.subText, 0.6)}
                                    strokeWidth={0.5}
                                    strokeDasharray='8,1'
                                />
                                <SvgText x={chartWidth - CHART_PADDING.right + 10} y={y + 4} fill={themeColors.subText} fontSize={12}>
                                    {weight.toFixed(1)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {/* Weight line */}
                        <Path d={generateSmoothPath(points)} stroke={themeColors.purpleSolid} strokeWidth={2} fill='none' />

                        {/* Moving average line */}
                        {movingAverages.length > 0 && (
                            <Path
                                d={generateSmoothPath(
                                    points.map((point, i) => ({
                                        x: point.x,
                                        y: CHART_PADDING.top + ((yAxisRange.max - movingAverages[i]) / (yAxisRange.max - yAxisRange.min)) * plotHeight,
                                    })),
                                )}
                                stroke={lightenColor(themeColors.purpleSolid, 0.6)}
                                strokeWidth={1.5}
                                fill='none'
                            />
                        )}

                        {/* Data points */}
                        {points.map((point, index) => (
                            <G key={index}>
                                <Circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={10}
                                    fill='transparent'
                                    onPress={() => setSelectedPoint(selectedPoint?.x === point.x ? null : point)}
                                />
                                <Circle cx={point.x} cy={point.y} r={3} stroke={themeColors.purpleSolid} strokeWidth={1.5} fill={themeColors.background} />
                            </G>
                        ))}

                        {/* Tooltip */}
                        {renderTooltip()}
                    </Svg>

                    {/* Overlay for Tooltip Action */}
                    {selectedPoint && (
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: TOOLTIP_OFFSET_Y,
                                left: Math.max(
                                    CHART_PADDING.left,
                                    Math.min(selectedPoint.x - TOOLTIP_WIDTH / 2, chartWidth - TOOLTIP_WIDTH - CHART_PADDING.right),
                                ),
                                width: TOOLTIP_WIDTH,
                                height: TOOLTIP_HEIGHT,
                            }}
                            onPress={() => onDataPointPress?.(selectedPoint.originalData)}
                        />
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300, // Increased to accommodate time range label
    },
    timeRangeLabel: {
        textAlign: 'left',
        paddingLeft: Spaces.LG,
    },
    chartContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
