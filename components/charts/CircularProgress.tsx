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
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const radius = (size - Math.max(strokeWidth * 2, 6)) / 2;
    const isFullCircle = arcAngle >= 360;
    const isOverGoal = current > goal;

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
    let goalProgress, overageProgress, goalRotateAngle;

    if (isFullCircle && isOverGoal) {
        const totalPercentage = (current / goal) * 100;

        // If over 200%, just show a fully filled circle
        if (totalPercentage >= 200) {
            goalProgress = {
                strokeDashoffset: 0, // Full circle
                strokeColor: color,
            };
            overageProgress = null;
            goalRotateAngle = rotateAngle;
        } else {
            // Between 100% and 200%
            const overagePercentage = totalPercentage - 100;
            const cappedOveragePercentage = Math.min(overagePercentage, 100);
            const remainingGoalPercentage = 100 - cappedOveragePercentage;

            // Overage progress: show overage starting from 0° (12 o'clock)
            overageProgress = {
                strokeDashoffset: circumference - (circumference * cappedOveragePercentage) / 100,
                strokeColor: color,
                opacity: 0.4,
            };

            // Main progress: show remaining goal percentage, rotated to start after overage
            const overageAngle = (cappedOveragePercentage / 100) * 360;
            goalRotateAngle = rotateAngle + overageAngle;

            goalProgress = {
                strokeDashoffset: circumference - (circumference * remainingGoalPercentage) / 100,
                strokeColor: color,
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
        goalRotateAngle = rotateAngle;
    }

    return (
        <View style={[styles.circularContainer, { width: size, height: size }]}>
            <Svg width={size} height={size} style={showContent ? styles.circularSvg : undefined}>
                {/* Background */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={themeColors.backgroundSecondary}
                    strokeWidth={strokeWidth}
                    fill='transparent'
                    strokeDasharray={dashArray}
                    strokeLinecap='round'
                    transform={`rotate(${rotateAngle} ${size / 2} ${size / 2})`}
                />

                {/* Overage Progress (only for full circles when over goal) - render first */}
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

                {/* Goal Progress */}
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
                    transform={`rotate(${goalRotateAngle} ${size / 2} ${size / 2})`}
                />
            </Svg>
            {showContent && <View style={styles.circularContent}>{children}</View>}
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
        marginTop: -Spaces.MD,
    },
});
