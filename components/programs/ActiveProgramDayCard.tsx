// components/programs/ActiveDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { Icon } from '@/components/icons/Icon';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { ProgramDay } from '@/store/types';

type ActiveProgramDayCardProps = {
    day: ProgramDay;
};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = ({ day }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <TopImageInfoCard
            image={{ uri: day.PhotoUrl }}
            title={day.WorkoutDayTitle}
            subtitle={`Week ${day.Week} Day ${day.Day}`}
            extraContent={
                day.RestDay ? (
                    // Display content specific to a rest day
                    <ThemedView style={[styles.attributeRow, { marginLeft: 0, marginTop: -spacing.xxs }]}>
                        <Icon name='bed' size={moderateScale(18)} color={themeColors.highlightContainerText} />
                        {/*                        <ThemedText type='body' style={[styles.attributeText, { color: themeColors.subTextSecondary, marginLeft: spacing.sm }]}>
                            {day.Notes ? day.Notes : 'Take it easy today! Focus on recovery and hydration.'}
                        </ThemedText>*/}
                        <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                    </ThemedView>
                ) : (
                    // Display content specific to a workout day
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                        <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, paddingRight: spacing.md }]}>
                            {`${day.Time} mins`}
                        </ThemedText>
                        <Icon name='dumbbell' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                        <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, marginLeft: spacing.xs }]}>
                            {day.EquipmentCategory}
                        </ThemedText>
                        <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                    </ThemedView>
                )
            }
            titleStyle={{ color: themeColors.highlightContainerText }}
            subtitleStyle={{ color: themeColors.subTextSecondary }}
        />
    );
};

const styles = StyleSheet.create({
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: spacing.xs,
        fontSize: moderateScale(13),
        lineHeight: spacing.md, // Ensures the text is aligned with the icon
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});
