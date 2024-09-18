// components/programs/ProgramDayRowCard.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { spacing } from '@/utils/spacing';
import { ProgramDay } from '@/types/types';
import { moderateScale } from '@/utils/scaling';

interface ProgramDayRowCardProps {
    day: ProgramDay;
    onPress: () => void;
    isCompleted: boolean;
    isCurrentDay: boolean;
}

export const ProgramDayRowCard: React.FC<ProgramDayRowCardProps> = ({ day, onPress, isCompleted, isCurrentDay }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Styles for the day ID container
    const dayIdContainerStyle = {
        ...styles.dayIdContainer,
        backgroundColor: themeColors.backgroundSecondary,
    };

    // Styles for completed days
    const containerStyle = [
        styles.container,
        isCompleted && styles.completedContainer,
        isCurrentDay && [styles.currentContainer, { borderColor: themeColors.accent, backgroundColor: themeColors.tipBackground }],
    ];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={1} style={containerStyle}>
            <View style={[dayIdContainerStyle, isCurrentDay && [{ backgroundColor: themeColors.accent }]]}>
                <ThemedText
                    type='buttonSmall'
                    style={[
                        styles.dayIdText,
                        isCompleted && [{ color: themeColors.subText, textDecorationLine: 'line-through' }],
                        isCurrentDay && { color: themeColors.background },
                    ]}
                >
                    {day.DayId}
                </ThemedText>
            </View>
            <ThemedText
                type='buttonSmall'
                style={[styles.dayTitle, isCurrentDay && [{ color: themeColors.tipText }], isCompleted && { textDecorationLine: 'line-through' }]}
            >
                {day.DayTitle}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: 'transparent',
        marginTop: -StyleSheet.hairlineWidth,
        opacity: 1,
    },
    completedContainer: {
        opacity: 0.5,
    },
    dayIdContainer: {
        width: spacing.xxl,
        height: spacing.xl,
        borderBottomRightRadius: spacing.md,
        borderTopRightRadius: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    dayTitle: {
        flex: 1,
    },
    currentContainer: {
        opacity: 1,
    },
    checkIcon: {
        marginRight: spacing.sm,
    },
});
