// components/charts/CircularProgress.tsx

import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
    current: number;
    goal: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    arcAngle?: number; // 360 for full circle, less for arc (e.g., 270)
    showContent?: boolean;
    children?: React.ReactNode;
    overageColor?: string; // Optional custom overage color
    backgroundColor?: string; // Optional custom background color
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    current,
    goal,
    color,
    size = 30,
    strokeWidth = 3,
    arcAngle = 360,
    showContent = false,
    children,
    overageColor,
    backgroundColor,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const radius = (size - Math.max(strokeWidth * 2, 6)) / 2;
    const isFullCircle = arcAngle >= 360;
    const isOverGoal = current > goal;

    // Use custom colors or fall back to defaults
    const bgColor = backgroundColor || themeColors.backgroundSecondary;
    const overColor = overageColor || color; // Default to main color if no overage color specified

    let circumference, rotateAngle;

    if (isFullCircle) {
        circumference = 2 * Math.PI * radius;
        rotateAngle = -90;
    } else {
        const arcLength = 2 * Math.PI * radius * (arcAngle / 360);
        circumference = arcLength;
        rotateAngle = 270 - arcAngle / 2;
    }

    const dashArray = isFullCircle ? circumference : `${circumference} ${2 * Math.PI * radius}`;

    // Calculate progress values
    let goalProgress, overageProgress;

    if (isFullCircle && isOverGoal) {
        const totalPercentage = (current / goal) * 100;

        // If over 200%, just show a fully filled circle
        if (totalPercentage >= 200) {
            goalProgress = {
                strokeDashoffset: 0, // Full circle
                strokeColor: overageColor ? overColor : color, // Use overage color if specified
            };
            overageProgress = null;
        } else {
            // Between 100% and 200%
            const overagePercentage = totalPercentage - 100;

            // Main progress: always show 100% when over goal
            goalProgress = {
                strokeDashoffset: 0, // Full circle for main progress
                strokeColor: color,
            };

            // Overage progress: start from beginning and extend to show overage amount
            // This will be rendered first, so the beginning will be hidden under main progress
            // but the end will be visible extending beyond the main progress
            overageProgress = {
                strokeDashoffset: circumference - (circumference * overagePercentage) / 100,
                strokeColor: overColor,
                opacity: overageColor ? 1 : 0.7, // Slightly more opaque for better visibility
            };
        }
    } else {
        // Normal progress (not over goal, or arc)
        const percentage = Math.min((current / goal) * 100, 100);
        goalProgress = {
            strokeDashoffset: circumference - (circumference * percentage) / 100,
            strokeColor: color,
        };
        overageProgress = null;
    }

    return (
        <View style={[styles.circularContainer, { width: size, height: size }]}>
            <Svg width={size} height={size} style={showContent ? styles.circularSvg : undefined}>
                {/* Background */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    fill='transparent'
                    strokeDasharray={dashArray}
                    strokeLinecap='round'
                    transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                />

                {/* Goal Progress - render on top to hide beginning of overage */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={goalProgress.strokeColor}
                    strokeWidth={strokeWidth}
                    fill='transparent'
                    strokeDasharray={dashArray}
                    strokeDashoffset={goalProgress.strokeDashoffset}
                    strokeLinecap='round'
                    transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                />

                {/* Overage Progress */}
                {overageProgress && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={overageProgress.strokeColor}
                        strokeWidth={strokeWidth}
                        fill='transparent'
                        strokeDasharray={dashArray}
                        strokeDashoffset={overageProgress.strokeDashoffset}
                        strokeLinecap='round'
                        opacity={overageProgress.opacity}
                        transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                    />
                )}
            </Svg>
            {showContent && <View style={[styles.circularContent, { marginTop: isFullCircle ? 0 : -Spaces.MD }]}>{children}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    // Circular progress
    circularContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circularSvg: {
        position: 'absolute',
    },
    circularContent: {
        alignItems: 'center',
    },
});
