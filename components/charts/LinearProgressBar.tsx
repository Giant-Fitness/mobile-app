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
}

export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ current, goal, color, backgroundColor, height = 16, fullHeight = false }) => {
    const progress = goal > 0 ? Math.min(current / goal, 1) : 0;

    // Use full height or smaller height based on fullHeight prop
    const fillHeight = fullHeight ? height : height * 0.3;
    const topOffset = fullHeight ? 0 : (height - fillHeight) / 2;

    return (
        <View style={[styles.progressBarContainer, { height, backgroundColor }]}>
            <View
                style={[
                    styles.progressBarFill,
                    {
                        width: `${progress * 100}%`,
                        backgroundColor: color,
                        height: fillHeight,
                        top: topOffset,
                        borderRadius: fullHeight ? Spaces.XXS : Spaces.XXS,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    progressBarContainer: {
        borderRadius: Spaces.XXS,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
    },
    progressBarFill: {
        borderRadius: Spaces.XXS,
        position: 'absolute',
        left: 0,
    },
});
