// components/programs/ProgramWeekList.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { Collapsible } from '@/components/layout/Collapsible';
import { ProgramDayRowCard } from '@/components/programs/ProgramDayRowCard';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ProgramDay } from '@/types';
import { getWeekNumber } from '@/utils/calendar';
import React from 'react';
import { StyleSheet } from 'react-native';

interface ProgramWeekListProps {
    currentMonthWeeks: ProgramDay[][];
    userCurrentWeekNumber: number | null;
    userCurrentDayNumber: number | null;
    completedDays: string[];
    navigateToProgramDay: (dayId: string) => void;
}

export const ProgramWeekList: React.FC<ProgramWeekListProps> = ({
    currentMonthWeeks,
    userCurrentWeekNumber,
    userCurrentDayNumber,
    completedDays,
    navigateToProgramDay,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={styles.weekByWeekContainer}>
            {currentMonthWeeks.map((week) => {
                // Filter out null days (placeholders)
                const daysInWeek = week.filter((day) => day !== null) as ProgramDay[];

                if (daysInWeek.length === 0) return null;

                // Get the week number from the first day in the week
                const weekNumber = getWeekNumber(parseInt(daysInWeek[0].DayId));
                // Determine if this is the current week
                const isCurrentWeek = userCurrentWeekNumber === weekNumber;
                const isPastWeek = userCurrentWeekNumber ? userCurrentWeekNumber > weekNumber : false;

                return (
                    <Collapsible
                        key={`week-${weekNumber}`}
                        title={`Week ${weekNumber}`}
                        isOpen={false}
                        activeOpacity={1}
                        titleStyle={[
                            styles.weekHeaderText,
                            { color: themeColors.text },
                            isCurrentWeek && { color: themeColors.white },
                            isPastWeek && [{ color: themeColors.subText, textDecorationLine: 'line-through' }],
                        ]}
                        headingStyle={[
                            styles.weekHeader,
                            { backgroundColor: themeColors.background },
                            isCurrentWeek && { backgroundColor: themeColors.primary },
                            isPastWeek && [{ backgroundColor: themeColors.background }],
                        ]}
                        iconStyle={[isCurrentWeek && { color: themeColors.white }]}
                    >
                        <ThemedView>
                            {daysInWeek.map((day) => {
                                // Determine if the day is completed
                                const dayNumber = parseInt(day.DayId);
                                const isCompleted = completedDays.includes(day.DayId);
                                const isCurrentDay = userCurrentDayNumber ? dayNumber === userCurrentDayNumber : false;
                                return (
                                    <ProgramDayRowCard
                                        key={`day-${day.DayId}`}
                                        day={day}
                                        onPress={() => navigateToProgramDay(day.DayId)}
                                        isCompleted={isCompleted}
                                        isCurrentDay={isCurrentDay}
                                    />
                                );
                            })}
                        </ThemedView>
                    </Collapsible>
                );
            })}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    weekByWeekContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.LG,
    },
    weekHeader: {
        paddingVertical: Spaces.SM + Spaces.XS,
        paddingHorizontal: Spaces.XL,
    },
    weekHeaderText: {},
});
