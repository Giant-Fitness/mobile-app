// components/charts/SparkLine.tsx

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type Point = {
    x: number;
    y: number;
    value: number;
};

type SparkLineProps = {
    data: Point[];
    color: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
    dotRadius?: number;
    dotFillColor?: string;
    style?: any;
};

export const SinglePointSparkLine = ({ color, value, dotFillColor }: { color: string; value?: number; dotFillColor?: string }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const chartData = [
        { value: value || 50, hideDataPoint: false },
        { value: value || 50, hideDataPoint: true },
    ];

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={100}
                height={38}
                curved
                hideYAxisText
                hideAxesAndRules
                hideDataPoints={false}
                dataPointsColor={color}
                dataPointsRadius={3}
                dataPointsWidth={1.5}
                color={color}
                thickness={1}
                startFillColor={color}
                startOpacity={0.2}
                endOpacity={0.05}
                areaChart
                hideOrigin
                spacing={50}
                initialSpacing={0}
            />
        </View>
    );
};

export const EmptySparkLine = ({ color }: { color: string }) => {
    const chartData = [
        { value: 30 },
        { value: 15 },
        { value: 30 },
    ];

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={100}
                height={38}
                curved
                hideYAxisText
                hideAxesAndRules
                hideDataPoints
                color={color}
                thickness={1}
                startFillColor={color}
                startOpacity={0.2}
                endOpacity={0.05}
                areaChart
                hideOrigin
                spacing={40}
                initialSpacing={10}
                dashGap={2}
                dashWidth={2}
            />
        </View>
    );
};

export const SparkLine: React.FC<SparkLineProps> = ({
    data,
    color,
    width = 100,
    height = 38,
    strokeWidth = 1.3,
    dotRadius = 2.5,
    dotFillColor,
    style,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    if (!data || !data.length) return null;

    // Validate y-coordinates and handle edge cases
    const validData = data.map((point) => {
        return {
            value: isNaN(point.y) || point.y === null || point.y === undefined ? 20 : point.y,
        };
    });

    if (validData.length === 1) {
        return <SinglePointSparkLine color={color} value={validData[0].value} dotFillColor={dotFillColor} />;
    }

    // Check if all y values are the same
    const allSameY = validData.every((point) => point.value === validData[0].value);

    if (allSameY) {
        // Draw a straight horizontal line with points
        return (
            <View style={[styles.container, style]}>
                <LineChart
                    data={validData}
                    width={typeof width === 'number' ? width : 100}
                    height={typeof height === 'number' ? height : 38}
                    curved={false}
                    hideYAxisText
                    hideAxesAndRules
                    hideDataPoints={false}
                    dataPointsColor={color}
                    dataPointsRadius={dotRadius}
                    dataPointsWidth={strokeWidth}
                    color={color}
                    thickness={strokeWidth}
                    hideOrigin
                    spacing={80 / Math.max(validData.length - 1, 1)}
                    initialSpacing={10}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <LineChart
                data={validData}
                width={typeof width === 'number' ? width : 100}
                height={typeof height === 'number' ? height : 38}
                curved
                curvature={0.3}
                hideYAxisText
                hideAxesAndRules
                hideDataPoints={false}
                dataPointsColor={color}
                dataPointsRadius={dotRadius}
                dataPointsWidth={strokeWidth}
                color={color}
                thickness={strokeWidth}
                startFillColor={color}
                startOpacity={0.15}
                endOpacity={0.02}
                areaChart
                hideOrigin
                spacing={80 / Math.max(validData.length - 1, 1)}
                initialSpacing={10}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
});
