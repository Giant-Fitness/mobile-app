// components/programs/ProgressBar.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { spacing } from '@/utils/spacing';

type ProgressBarProps = {
    parts: number; // Total number of parts/weeks
    currentPart: number; // Current week
    completedParts: number; // Number of completed weeks
    containerWidth: number; // Width of the parent container
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ parts = 8, currentPart = 0, completedParts = 0, containerWidth }) => {
    const margin = spacing.xs; // Margin between pills
    const totalMarginSpace = margin * (parts - 1); // Total space taken by margins
    const partWidth = Math.floor((containerWidth - totalMarginSpace) / parts); // Adjusted part width
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <ThemedView style={[styles.container, { width: containerWidth }]}>
            {Array.from({ length: parts }).map((_, index) => {
                let backgroundColor;
                if (index < completedParts) {
                    backgroundColor = themeColors.primary;
                } else if (index === currentPart - 1) {
                    backgroundColor = themeColors.accent;
                } else {
                    backgroundColor = themeColors.secondary;
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
        height: spacing.xs,
    },
    part: {
        height: '100%',
        borderRadius: spacing.xxs,
    },
});
