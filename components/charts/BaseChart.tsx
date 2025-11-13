// components/charts/BaseChart.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TimeRange, TimeRangeOption } from '@/utils/charts';
import { lightenColor } from '@/utils/colorUtils';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { format } from 'date-fns';
import { LineChart } from 'react-native-gifted-charts';

const CHART_CONTAINER_HEIGHT = 350;

export type Point = {
    x: number;
    y: number;
    value: number;
    timestamp: Date;
    originalData: any;
};

type ThemeColorKey = keyof (typeof Colors)['light'];

type BaseChartProps = {
    data: any[];
    timeRange: TimeRange;
    availableRanges: TimeRangeOption[];
    onRangeChange: (range: TimeRange) => void;
    yAxisRange: { min: number; max: number };
    movingAverages: number[];
    effectiveTimeRange: string;
    onDataPointPress?: (measurement: any) => void;
    style?: any;
    themeColor: ThemeColorKey;
    themeTransparentColor: ThemeColorKey;
    getValue: (point: any) => number;
    formatValue: (value: number) => string;
    formatYAxisLabel?: (value: number) => string;
    getGridLineValues?: (min: number, max: number) => number[];
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
    const [showTooltip, setShowTooltip] = useState<string | null>(null);

    return (
        <View style={[styles.rangeSelector, style]}>
            {availableRanges.map(({ range, disabled, disabledReason }) => (
                <TouchableOpacity
                    key={range}
                    style={[
                        styles.rangePill,
                        disabled && styles.disabledRangePill,
                        {
                            backgroundColor: range === selectedRange ? themeColors.containerHighlight : themeColors.background,
                            borderWidth: disabled ? 1 : 0,
                            borderColor: disabled ? lightenColor(themeColors.subText, 0.8) : 'transparent',
                        },
                    ]}
                    onPress={() => {
                        if (disabled) {
                            setShowTooltip(range);
                            setTimeout(() => setShowTooltip(null), 2000);
                        } else {
                            onRangeChange(range);
                        }
                    }}
                    disabled={false}
                >
                    <ThemedText
                        type='body'
                        style={[
                            styles.rangeText,
                            {
                                color: disabled
                                    ? lightenColor(themeColors.subText, 0.6)
                                    : range === selectedRange
                                      ? themeColors.highlightContainerText
                                      : themeColors.subText,
                            },
                        ]}
                    >
                        {range}
                    </ThemedText>

                    {showTooltip === range && disabled && (
                        <View style={styles.disabledTooltip}>
                            <ThemedText type='caption' style={styles.tooltipText}>
                                {disabledReason}
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const EmptyStateChart = ({
    themeColors,
    themeColor,
    dataCount,
}: {
    themeColors: any;
    themeColor: ThemeColorKey;
    dataCount: number;
}) => {
    const getMessage = () => {
        if (dataCount === 0) {
            return {
                title: 'Start Tracking',
                subtitle: 'Add your first measurement to begin tracking progress',
            };
        } else if (dataCount === 1) {
            return {
                title: 'Add More Data',
                subtitle: 'Add another measurement to see trends and patterns',
            };
        } else {
            return {
                title: 'Need More Data',
                subtitle: 'Add more measurements for this time period',
            };
        }
    };

    const { title, subtitle } = getMessage();

    return (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyMessageContainer}>
                <ThemedText type='bodyMedium' style={styles.emptyTitle}>
                    {title}
                </ThemedText>
                <ThemedText type='bodySmall' style={[styles.emptyMessage, { color: lightenColor(themeColors[themeColor], 0.3) }]}>
                    {subtitle}
                </ThemedText>
            </View>
        </View>
    );
};

export const BaseChart: React.FC<BaseChartProps> = ({
    data,
    timeRange,
    availableRanges,
    onRangeChange,
    yAxisRange,
    movingAverages,
    effectiveTimeRange,
    onDataPointPress,
    style,
    themeColor,
    getValue,
    formatValue,
    formatYAxisLabel = (value) => value.toFixed(1),
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(data.length > 0 ? data.length - 1 : null);

    const screenWidth = Dimensions.get('window').width;
    const hasEnoughData = data.length >= 2;

    // Transform data for gifted-charts
    const chartData = data.map((point, index) => {
        const value = getValue(point);
        return {
            value: value,
            label: '',
            dataPointText: formatValue(value),
            onPress: () => {
                setSelectedIndex(index);
                if (onDataPointPress) {
                    onDataPointPress(point.originalData);
                }
            },
            // Store original data for reference
            _originalData: point.originalData,
            _timestamp: point.timestamp,
        };
    });

    // Transform moving average data
    const movingAverageData =
        movingAverages.length > 0
            ? movingAverages.map((avg) => ({
                  value: avg,
              }))
            : undefined;

    if (!hasEnoughData) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.chartContainer}>
                    <EmptyStateChart themeColors={themeColors} themeColor={themeColor} dataCount={data.length} />
                </View>

                <RangeSelector selectedRange={timeRange} onRangeChange={onRangeChange} availableRanges={availableRanges} style={styles.rangeSelector} />
            </View>
        );
    }

    const selectedPoint = selectedIndex !== null && selectedIndex < data.length ? data[selectedIndex] : data[data.length - 1];

    return (
        <View style={[styles.container, style, { backgroundColor: themeColors.background }]}>
            <View style={styles.chartContainer}>
                <View style={styles.header}>
                    <ThemedText type='bodySmall' style={[styles.timeRangeLabel, { color: themeColors.subText }]}>
                        {effectiveTimeRange}
                    </ThemedText>

                    {selectedPoint && (
                        <View style={styles.tooltipContainer}>
                            <ThemedText type='caption' style={[styles.tooltipDate, { color: themeColors.subText }]}>
                                {format(selectedPoint.timestamp, 'MMM d, yyyy')}
                            </ThemedText>
                            <ThemedText type='bodyMedium' style={[styles.tooltipValue, { color: themeColors.text }]}>
                                {formatValue(getValue(selectedPoint))}
                            </ThemedText>
                        </View>
                    )}
                </View>

                <LineChart
                    data={chartData}
                    data2={movingAverageData}
                    width={screenWidth - Spaces.MD * 2 - 40}
                    height={220}
                    spacing={(screenWidth - Spaces.MD * 2 - 40) / Math.max(chartData.length - 1, 1)}
                    initialSpacing={20}
                    endSpacing={20}
                    maxValue={yAxisRange.max}
                    mostNegativeValue={yAxisRange.min}
                    noOfSections={4}
                    yAxisTextStyle={{
                        color: themeColors.subText,
                        fontSize: 11,
                    }}
                    formatYLabel={(label: string) => formatYAxisLabel(parseFloat(label))}
                    xAxisColor={lightenColor(themeColors.subText, 0.7)}
                    yAxisColor={lightenColor(themeColors.subText, 0.7)}
                    color={themeColors[themeColor]}
                    thickness={2.5}
                    curved
                    curvature={0.2}
                    hideDataPoints={false}
                    dataPointsColor={themeColors[themeColor]}
                    dataPointsRadius={4}
                    dataPointsWidth={2}
                    focusEnabled={true}
                    showStripOnFocus={true}
                    stripColor={themeColors[themeColor]}
                    stripHeight={220}
                    stripOpacity={0.3}
                    stripWidth={1}
                    unFocusOnPressOut={false}
                    delayBeforeUnFocus={2000}
                    onFocus={(item: any, index: number) => {
                        setSelectedIndex(index);
                    }}
                    color2={lightenColor(themeColors[themeColor], 0.5)}
                    thickness2={1.5}
                    hideDataPoints2={true}
                    rulesType='solid'
                    rulesColor={lightenColor(themeColors.subText, 0.8)}
                    rulesThickness={0.5}
                    animateOnDataChange
                    animationDuration={500}
                    areaChart
                    startFillColor={themeColors[themeColor]}
                    startOpacity={0.2}
                    endOpacity={0.01}
                    yAxisOffset={0}
                    hideOrigin={false}
                />
            </View>

            <RangeSelector selectedRange={timeRange} onRangeChange={onRangeChange} availableRanges={availableRanges} style={styles.rangeSelector} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: CHART_CONTAINER_HEIGHT,
    },
    chartContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: Spaces.MD,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spaces.SM,
        paddingHorizontal: Spaces.MD,
    },
    timeRangeLabel: {
        textAlign: 'left',
        marginBottom: Spaces.XS,
    },
    tooltipContainer: {
        marginTop: Spaces.XS,
    },
    tooltipDate: {
        fontSize: 12,
        marginBottom: 2,
    },
    tooltipValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptyStateContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessageContainer: {
        alignItems: 'center',
        paddingHorizontal: Spaces.LG,
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    emptyMessage: {
        textAlign: 'center',
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
    disabledTooltip: {
        position: 'absolute',
        top: -30,
        left: '50%',
        transform: [{ translateX: -50 }],
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        minWidth: 100,
    },
    tooltipText: {
        color: 'white',
        fontSize: 10,
        textAlign: 'center',
    },
});

export default BaseChart;
