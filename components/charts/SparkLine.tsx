// components/charts/SparkLine.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Path, Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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

    // Position the dot in the center horizontally
    const centerX = 50;

    // Calculate y position based on value if provided (otherwise center vertically)
    // For demonstration, let's assume values typically range from 0-100
    // We'll invert the y-axis so higher values appear higher on the chart
    const y = value !== undefined ? Math.max(5, Math.min(35, 35 - (value / 100) * 30)) : 20;

    return (
        <Svg width='100%' height='100%' viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
            <Defs>
                <LinearGradient id='singlePointGradient' x1='0' y1='0' x2='0' y2='1'>
                    <Stop offset='0' stopColor={color} stopOpacity='0.3' />
                    <Stop offset='1' stopColor={color} stopOpacity='0.05' />
                </LinearGradient>
            </Defs>

            {/* Horizontal reference line */}
            <Path d='M 10 20 L 90 20' stroke={color} strokeWidth='0.5' strokeDasharray='1,1.5' fill='none' opacity='0.4' />

            {/* Center dot with pulse circle */}
            <Circle cx={centerX} cy={y} r='3' fill={dotFillColor || themeColors.background} stroke={color} strokeWidth='1.2' />

            {/* Value indicator line */}
            <Path d={`M ${centerX} 38 L ${centerX} ${y + 3}`} stroke={color} strokeWidth='0.6' strokeDasharray='1.5,1' opacity='0.5' />

            {/* Subtle background gradient */}
            <Path d='M 0 38 L 100 38 L 100 20 C 75 20, 75 20, 50 20 C 25 20, 25 20, 0 20 Z' fill='url(#singlePointGradient)' opacity='0.5' />
        </Svg>
    );
};

export const EmptySparkLine = ({ color }: { color: string }) => (
    <Svg width='100%' height='100%' viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
        <Defs>
            <LinearGradient id='emptyGradient' x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={color} stopOpacity='0.2' />
                <Stop offset='1' stopColor={color} stopOpacity='0.05' />
            </LinearGradient>
        </Defs>
        <Path d='M 0 30 C 25 30, 25 15, 50 15 C 75 15, 75 30, 100 30' stroke={color} strokeWidth='0.9' strokeDasharray='2,2' fill='none' opacity='0.5' />
        <Path d='M 0 30 C 25 30, 25 15, 50 15 C 75 15, 75 30, 100 30 L 100 38 L 0 38 Z' fill='url(#emptyGradient)' />
    </Svg>
);

export const SparkLine: React.FC<SparkLineProps> = ({
    data,
    color,
    width = '100%',
    height = '100%',
    strokeWidth = 0.9,
    dotRadius = 1.5,
    dotFillColor,
    style,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    if (!data || !data.length) return null;

    // Validate y-coordinates and handle edge cases
    const validData = data.map((point) => {
        // If y is NaN, null, or undefined, use a default y value (middle of the chart)
        return {
            ...point,
            y: isNaN(point.y) || point.y === null || point.y === undefined ? 20 : point.y,
        };
    });

    // Add padding to accommodate the circle radius
    const padding = dotRadius + strokeWidth;

    if (validData.length === 1) {
        const midY = 20;
        const x = 50; // Center point
        return (
            <Svg width={width} height={height} viewBox={`-${padding} -${padding} ${100 + padding * 2} ${38 + padding * 2}`} preserveAspectRatio='xMidYMid meet'>
                <Path d={`M ${x - 20} ${midY} L ${x + 20} ${midY}`} stroke={color} strokeWidth={strokeWidth} fill='none' />
                <Circle cx={x} cy={midY} stroke={color} strokeWidth={strokeWidth} r={dotRadius} fill={dotFillColor || themeColors.background} />
            </Svg>
        );
    }

    // Check if all y values are the same
    const allSameY = validData.every((point) => point.y === validData[0].y);

    if (allSameY) {
        // Draw a straight horizontal line
        const midY = validData[0].y;
        return (
            <View style={[styles.container, style]}>
                <Svg
                    width={width}
                    height={height}
                    viewBox={`-${padding} -${padding} ${100 + padding * 2} ${38 + padding * 2}`}
                    preserveAspectRatio='xMidYMid meet'
                >
                    <Path d={`M 0 ${midY} L 100 ${midY}`} stroke={color} strokeWidth={strokeWidth} fill='none' />
                    {validData.map((point, index) => (
                        <Circle
                            key={index}
                            cx={point.x}
                            cy={midY}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            r={dotRadius}
                            fill={dotFillColor || themeColors.background}
                        />
                    ))}
                </Svg>
            </View>
        );
    }

    // Generate smooth path
    let path = `M ${validData[0].x} ${validData[0].y}`;
    for (let i = 1; i < validData.length; i++) {
        const xDiff = validData[i].x - validData[i - 1].x;
        const controlPointDistance = Math.min(xDiff / 3, 20);
        const x1 = validData[i - 1].x + controlPointDistance;
        const x2 = validData[i].x - controlPointDistance;
        path += ` C ${x1} ${validData[i - 1].y}, ${x2} ${validData[i].y}, ${validData[i].x} ${validData[i].y}`;
    }

    return (
        <View style={[styles.container, style]}>
            <Svg width={width} height={height} viewBox={`-${padding} -${padding} ${100 + padding * 2} ${38 + padding * 2}`} preserveAspectRatio='xMidYMid meet'>
                <Path d={path} stroke={color} strokeWidth={strokeWidth} fill='none' />
                {validData.map((point, index) => (
                    <Circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        r={dotRadius}
                        fill={dotFillColor || themeColors.background}
                    />
                ))}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
});
