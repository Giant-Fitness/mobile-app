// components/programs/ProgressBar.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type ProgressBarProps = {
    parts: number; // Total number of parts/weeks
    currentPart: number; // Current week
    completedParts: number; // Number of completed weeks
    containerWidth: number; // Width of the parent container
};

const ProgressBar: React.FC<ProgressBarProps> = ({ parts = 8, currentPart = 0, completedParts = 0, containerWidth }) => {
    const margin = 4; // Margin between pills
    const totalMarginSpace = margin * (parts - 1); // Total space taken by margins
    const partWidth = Math.floor((containerWidth - totalMarginSpace) / parts); // Adjusted part width
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, { width: containerWidth }]}>
            {Array.from({ length: parts }).map((_, index) => {
                let backgroundColor;
                if (index < completedParts) {
                    backgroundColor = themeColors.primary;
                } else if (index === currentPart - 1) {
                    backgroundColor = themeColors.accent;
                } else {
                    backgroundColor = themeColors.lightGray;
                }

                return (
                    <ThemedView
                        key={index}
                        style={[
                            styles.part,
                            {
                                width: partWidth,
                                backgroundColor,
                                marginRight: index === parts - 1 ? 0 : margin, // Remove margin for the last pill
                            },
                        ]}
                    />
                );
            })}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 4,
    },
    part: {
        height: '100%',
        borderRadius: 1,
    },
});

export default ProgressBar;
