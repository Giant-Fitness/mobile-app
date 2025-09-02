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
}

export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ current, goal, color, backgroundColor, height = 16 }) => {
    const progress = goal > 0 ? Math.min(current / goal, 1) : 0;
    const fillHeight = height * 0.3; // smaller than the container height
    const topOffset = (height - fillHeight) / 2; // Center vertically

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
    },
    progressBarFill: {
        borderRadius: Spaces.XXS,
        position: 'absolute',
        left: 0,
    },
});
