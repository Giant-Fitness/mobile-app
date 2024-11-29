// components/progress/WeightChart.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Path, Svg, Circle, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { format } from 'date-fns';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spaces } from '@/constants/Spaces';
import { AggregatedData, TimeRange, TimeRangeOption } from '@/utils/weight';
import { UserWeightMeasurement } from '@/types';
import { ThemedText } from '@/components/base/ThemedText';
import { lightenColor } from '@/utils/colorUtils';
import { ThemedView } from '@/components/base/ThemedView';

const CHART_PADDING = {
    top: 48,
    right: 36,
    bottom: 10,
    left: 5,
};
const NUM_HORIZONTAL_LINES = 3;
const TOOLTIP_HEIGHT = 50;
const TOOLTIP_WIDTH = 120;
const TOOLTIP_PADDING = 8;
const TOOLTIP_ARROW_SIZE = 0;
const TOOLTIP_OFFSET_Y = 20;
const CHART_HEIGHT = 300;
const CHART_CONTAINER_HEIGHT = CHART_HEIGHT + 50;

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
    availableRanges: TimeRangeOption[];
    onRangeChange: (range: TimeRange) => void;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: UserWeightMeasurement) => void;
    style?: any;
};

type TimeRangeOptionType = {
    range: TimeRange;
    disabled?: boolean; // Add this line if 'disabled' is not already defined
};

const RangeSelector = ({
    selectedRange,
    onRangeChange,
    availableRanges,
    style,
}: {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
    availableRanges: TimeRangeOption[];
    style?: any;
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.rangeSelector, style]}>
            {availableRanges.map(({ range, disabled }: TimeRangeOptionType) => (
                <ThemedView
                    key={range}
                    style={[
                        styles.rangePill,
                        disabled && styles.disabledRangePill,
                        {
                            backgroundColor: range === selectedRange ? themeColors.containerHighlight : themeColors.background,
                        },
                    ]}
                    onTouchEnd={() => !disabled && onRangeChange(range)}
                >
                    <ThemedText
                        type='body'
                        style={[
                            styles.rangeText,
                            {
                                color: range === selectedRange ? themeColors.highlightContainerText : themeColors.subText,
                            },
                        ]}
                    >
                        {range}
                    </ThemedText>
                </ThemedView>
            ))}
        </View>
    );
};

const EmptyStateChart = ({
    themeColors,
    width,
    height,
    padding,
}: {
    themeColors: any; // Replace 'any' with the actual type if known
    width: number;
    height: number;
    padding: { top: number; right: number; bottom: number; left: number };
}) => (
    <Svg width={width} height={height} preserveAspectRatio='xMidYMid meet'>
        <Defs>
            <LinearGradient id='emptyGradient' x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={themeColors.purpleSolid} stopOpacity='0.2' />
                <Stop offset='1' stopColor={themeColors.purpleSolid} stopOpacity='0.05' />
            </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
            const y = ((i + 1) * (height - padding.top - padding.bottom)) / 5 + padding.top;
            return (
                <Line
                    key={i}
                    x1={padding.left}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke={lightenColor(themeColors.subText, 0.8)}
                    strokeWidth={0.5}
                    strokeDasharray='4,4'
                />
            );
        })}

        {/* Stylized trend line */}
        <Path
            d={`M ${padding.left} ${height / 2} 
                C ${width * 0.25} ${height / 2}, 
                  ${width * 0.25} ${height * 0.3}, 
                  ${width * 0.5} ${height * 0.3} 
                C ${width * 0.75} ${height * 0.3}, 
                  ${width * 0.75} ${height / 2}, 
                  ${width} ${height / 2}`}
            stroke={themeColors.purpleSolid}
            strokeWidth='1'
            strokeDasharray='2,2'
            fill='none'
            opacity='0.5'
        />

        {/* Gradient area */}
        <Path
            d={`M ${padding.left} ${height / 2} 
                C ${width * 0.25} ${height / 2}, 
                  ${width * 0.25} ${height * 0.3}, 
                  ${width * 0.5} ${height * 0.3} 
                C ${width * 0.75} ${height * 0.3}, 
                  ${width * 0.75} ${height / 2}, 
                  ${width} ${height / 2}
                L ${width} ${height - padding.bottom}
                L ${padding.left} ${height - padding.bottom} Z`}
            fill='url(#emptyGradient)'
        />
    </Svg>
);

export const WeightChart: React.FC<WeightChartProps> = ({
    data,
    timeRange,
    availableRanges,
    onRangeChange,
    yAxisRange,
    movingAverages,
    effectiveTimeRange,
    onDataPointPress,
    style,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - Spaces.MD * 2;
    const chartHeight = 300;
    const hasEnoughData = data.length >= 2;

    const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    const plotHeight = chartHeight - CHART_PADDING.top - CHART_PADDING.bottom;

    useEffect(() => {
        if (data.length > 0) {
            const lastPoint = points[points.length - 1];
            setSelectedPoint(lastPoint);
        }
    }, [data]);

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
        if (data.length === 1) {
            // Center single point
            const point = data[0];
            return [
                {
                    x: chartWidth / 2,
                    y: CHART_PADDING.top + plotHeight / 2,
                    weight: point.weight,
                    timestamp: point.timestamp,
                    originalData: point.originalData,
                },
            ];
        }

        const timeStart = data[0].timestamp.getTime();
        const timeEnd = data[data.length - 1].timestamp.getTime();
        const timeRange = Math.max(timeEnd - timeStart, 1); // Prevent division by zero

        return data.map((point) => ({
            x: CHART_PADDING.left + ((point.timestamp.getTime() - timeStart) / timeRange) * plotWidth,
            y: CHART_PADDING.top + ((yAxisRange.max - point.weight) / (yAxisRange.max - yAxisRange.min)) * plotHeight,
            weight: point.weight,
            timestamp: point.timestamp,
            originalData: point.originalData,
        }));
    }, [data, plotWidth, plotHeight, yAxisRange, chartWidth]);

    // Generate smooth path
    const generateSmoothPath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return '';
        if (points.length === 1) {
            // For single point, draw a small horizontal line
            const x = points[0].x;
            const y = points[0].y;
            return `M ${x - 20} ${y} L ${x + 20} ${y}`;
        }

        let path = `M ${points[0].x} ${points[0].y}`;

        if (points.length === 2) {
            // For two points, draw a straight line
            return `${path} L ${points[1].x} ${points[1].y}`;
        }

        // Regular smooth path for 3+ points
        for (let i = 1; i < points.length; i++) {
            const xDiff = points[i].x - points[i - 1].x;
            const controlPointDistance = Math.min(xDiff / 3, 20);
            const x1 = points[i - 1].x + controlPointDistance;
            const x2 = points[i].x - controlPointDistance;
            path += ` C ${x1} ${points[i - 1].y}, ${x2} ${points[i].y}, ${points[i].x} ${points[i].y}`;
        }

        return path;
    };

    // Add message for insufficient data
    if (!hasEnoughData) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.chartContainer}>
                    <EmptyStateChart themeColors={themeColors} width={chartWidth} height={CHART_HEIGHT} padding={CHART_PADDING} />

                    <View style={styles.emptyMessageContainer}>
                        {data.length === 0 ? (
                            <>
                                <ThemedText type='title' style={styles.emptyTitle}>
                                    Track Your Progress
                                </ThemedText>
                                <ThemedText type='bodySmall' style={[styles.emptyMessage, { color: lightenColor(themeColors.purpleSolid, 0.3) }]}>
                                    Add measurements to see your progress over time
                                </ThemedText>
                            </>
                        ) : (
                            <ThemedText type='bodyMedium' style={[styles.emptyMessage, { color: lightenColor(themeColors.purpleSolid, 0.3) }]}>
                                Add more measurements to see trends
                            </ThemedText>
                        )}
                    </View>

                    {data.length === 1 && points.length === 1 && (
                        <Circle cx={points[0].x} cy={points[0].y} r={3} stroke={themeColors.purpleSolid} strokeWidth={1.5} fill={themeColors.background} />
                    )}
                </View>

                <RangeSelector selectedRange={timeRange} onRangeChange={onRangeChange} availableRanges={availableRanges} style={styles.rangeSelector} />
            </View>
        );
    }

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
                <SvgText x={tooltipX + TOOLTIP_WIDTH / 2} y={tooltipY + TOOLTIP_PADDING + 12} fill={themeColors.subText} fontSize={12} textAnchor='middle'>
                    {format(selectedPoint.timestamp, 'MMM d, yyyy')}
                </SvgText>
                <SvgText x={tooltipX + TOOLTIP_WIDTH / 2} y={tooltipY + TOOLTIP_PADDING + 32} fill={themeColors.text} fontSize={14} textAnchor='middle'>
                    {selectedPoint.weight.toFixed(1)} kg
                </SvgText>
            </G>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={() => setSelectedPoint(null)}>
            <View style={[styles.container, style, { backgroundColor: themeColors.background }]}>
                <View style={styles.chartContainer}>
                    <ThemedText type='bodySmall' style={[styles.timeRangeLabel, { color: themeColors.subText }]}>
                        {effectiveTimeRange}
                    </ThemedText>

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
                                <Circle cx={point.x} cy={point.y} r={10} fill={themeColors.purpleSolid} opacity={0.05} />
                                <Circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={25}
                                    fill='transparent'
                                    onPress={() => setSelectedPoint(selectedPoint?.x === point.x ? null : point)}
                                />

                                <Circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={3}
                                    stroke={themeColors.purpleSolid}
                                    strokeWidth={1.5}
                                    fill={themeColors.purpleTransparent}
                                />
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

                <RangeSelector selectedRange={timeRange} onRangeChange={onRangeChange} availableRanges={availableRanges} style={styles.rangeSelector} />
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        height: CHART_CONTAINER_HEIGHT, // Fixed total height
    },
    chartContainer: {
        position: 'relative',
        width: '100%',
        height: CHART_HEIGHT, // Fixed chart height
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessageContainer: {
        position: 'absolute',
        top: '60%',
        left: 0,
        right: 0,
        transform: [{ translateY: 0 }],
        alignItems: 'center',
        paddingHorizontal: Spaces.LG,
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        paddingHorizontal: Spaces.XL,
    },
    rangeSelector: {
        flexDirection: 'row',
        padding: Spaces.MD,
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: -Spaces.LG,
        left: 0,
        right: 0,
    },
    rangePill: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.MD,
        minWidth: 48,
        alignItems: 'center',
    },
    disabledRangePill: {
        opacity: 0.4,
    },
    rangeText: {
        fontSize: 12,
    },
    timeRangeLabel: {
        textAlign: 'left',
        paddingLeft: Spaces.LG,
    },
});
