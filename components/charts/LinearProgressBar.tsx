// components/charts/LinearProgressBar.tsx

import { Spaces } from '@/constants/Spaces';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface LinearProgressBarProps {
    current: number;
    goal: number;
    color: string;
    backgroundColor: string;
    height?: number;
    fullHeight?: boolean;
    overageColor?: string; // Optional custom overage color
}

export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
    current,
    goal,
    color,
    backgroundColor,
    height = 16,
    fullHeight = false,
    overageColor,
}) => {
    const isOverGoal = current > goal;
    const totalPercentage = goal > 0 ? (current / goal) * 100 : 0;

    // Use custom overage color or fall back to main color
    const overColor = overageColor || color;

    // Use full height or smaller height based on fullHeight prop
    const fillHeight = fullHeight ? height : height * 0.3;
    const topOffset = fullHeight ? 0 : (height - fillHeight) / 2;
    const borderRadiusValue = fullHeight ? Spaces.XXS : Spaces.XXS;

    // Calculate progress values
    let goalProgress, overageProgress;

    if (isOverGoal) {
        // If over 200%, just show a fully filled bar with overage color
        if (totalPercentage >= 200) {
            goalProgress = {
                width: '100%',
                backgroundColor: overageColor ? overColor : color,
            };
            overageProgress = null;
        } else {
            // Between 100% and 200%
            const overagePercentage = totalPercentage - 100;
            const cappedOveragePercentage = Math.min(overagePercentage, 100);
            const remainingGoalPercentage = 100 - cappedOveragePercentage;

            // Main progress: show remaining goal percentage
            goalProgress = {
                width: `${remainingGoalPercentage}%`,
                backgroundColor: color,
            };

            // Overage progress: use overage color if specified, otherwise use main color with opacity
            overageProgress = {
                width: `${cappedOveragePercentage}%`,
                backgroundColor: overColor,
                opacity: overageColor ? 1 : 0.5, // Full opacity if custom overage color, otherwise transparent
                left: `${remainingGoalPercentage}%`, // Position after the goal progress
            };
        }
    } else {
        // Normal progress (not over goal)
        const percentage = Math.min(totalPercentage, 100);
        goalProgress = {
            width: `${percentage}%`,
            backgroundColor: color,
        };
        overageProgress = null;
    }

    return (
        <View style={[styles.progressBarContainer, { height, backgroundColor, borderRadius: borderRadiusValue }]}>
            {/* Goal Progress */}
            <View
                style={[
                    styles.progressBarFill,
                    {
                        width: goalProgress.width as any,
                        backgroundColor: goalProgress.backgroundColor,
                        height: fillHeight,
                        top: topOffset,
                        borderRadius: borderRadiusValue,
                    },
                ]}
            />

            {/* Overage Progress (only when over goal) */}
            {overageProgress && (
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            width: overageProgress.width as any,
                            backgroundColor: overageProgress.backgroundColor,
                            height: fillHeight,
                            top: topOffset,
                            left: overageProgress.left as any,
                            opacity: overageProgress.opacity,
                            borderRadius: borderRadiusValue,
                        },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    progressBarContainer: {
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
    },
    progressBarFill: {
        position: 'absolute',
        top: 0,
    },
});
