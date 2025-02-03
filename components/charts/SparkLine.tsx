// components/charts/SparkLine.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Path, Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const PADDING_VERTICAL = 4;

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

    if (!data.length) return null;

    if (data.length === 1) {
        const midY = 20;
        const x = 50; // Center point
        return (
            <Svg width={width} height={height} viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
                <Path d={`M ${x - 20} ${midY} L ${x + 20} ${midY}`} stroke={color} strokeWidth={strokeWidth} fill='none' />
                <Circle cx={x} cy={midY} stroke={color} strokeWidth={strokeWidth} r={dotRadius} fill={dotFillColor || themeColors.background} />
            </Svg>
        );
    }

    // Generate smooth path
    let path = `M ${data[0].x} ${data[0].y}`;
    for (let i = 1; i < data.length; i++) {
        const xDiff = data[i].x - data[i - 1].x;
        const controlPointDistance = Math.min(xDiff / 3, 20);
        const x1 = data[i - 1].x + controlPointDistance;
        const x2 = data[i].x - controlPointDistance;
        path += ` C ${x1} ${data[i - 1].y}, ${x2} ${data[i].y}, ${data[i].x} ${data[i].y}`;
    }

    return (
        <View style={[styles.container, style]}>
            <Svg width={width} height={height} viewBox='0 0 100 38' preserveAspectRatio='xMidYMid meet'>
                <Path d={path} stroke={color} strokeWidth={strokeWidth} fill='none' />
                {data.map((point, index) => (
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
