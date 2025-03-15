// components/progress/CalendarMonth.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { darkenColor, lightenColor } from '@/utils/colorUtils';

type ThemeColorKey = keyof typeof Colors['light'];

interface CalendarMonthProps {
    date: Date;
    measurementDates: Map<string, any>;
    onDayPress?: (date: string) => void;
    backgroundColor: ThemeColorKey;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ date, measurementDates, onDayPress, backgroundColor }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isFutureDate = (dateToCheck: Date) => {
        return dateToCheck > today;
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
        const firstDay = getFirstDayOfMonth(date.getFullYear(), date.getMonth());

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }
        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
            const currentDate = dayDate.toDateString();
            const hasMeasurement = measurementDates.has(currentDate);
            const isFuture = isFutureDate(dayDate);

            days.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => !isFuture && onDayPress?.(dayDate.toDateString())}
                    disabled={isFuture}
                    style={[
                        styles.dayCell,
                        hasMeasurement && {
                            backgroundColor: lightenColor(themeColors[backgroundColor], 0.8),
                        },
                        !hasMeasurement && {
                            borderColor: lightenColor(themeColors[backgroundColor], 0.8),
                            borderWidth: 1,
                        },
                        isFuture && {
                            backgroundColor: darkenColor(themeColors.background, 0.015),
                        },
                    ]}
                    activeOpacity={0.8}
                >
                    <ThemedText style={isFuture ? { color: lightenColor(themeColors.subText, 0.5) } : undefined}>{i}</ThemedText>
                </TouchableOpacity>,
            );
        }

        return days;
    };

    return (
        <View style={styles.container}>
            <View style={styles.weekDays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <ThemedText key={day} type='overline' style={styles.weekDay}>
                        {day}
                    </ThemedText>
                ))}
            </View>
            <View style={styles.daysGrid}>{renderDays()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spaces.MD,
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spaces.MD,
    },
    weekDay: {
        width: 40,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: Spaces.XS,
    },
});
