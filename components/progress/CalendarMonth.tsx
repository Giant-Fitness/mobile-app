// components/progress/CalendarMonth.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { lightenColor } from '@/utils/colorUtils';

interface CalendarMonthProps {
    date: Date;
    measurementDates: Map<string, any>;
    onDayPress?: (date: string) => void;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ date, measurementDates, onDayPress }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

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
            const currentDate = new Date(date.getFullYear(), date.getMonth(), i).toDateString();

            const hasMeasurement = measurementDates.has(currentDate);

            days.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => onDayPress?.(currentDate)}
                    style={[
                        styles.dayCell,
                        hasMeasurement && {
                            backgroundColor: lightenColor(themeColors.purpleSolid, 0.8),
                        },
                        !hasMeasurement && {
                            borderColor: lightenColor(themeColors.purpleSolid, 0.8),
                            borderWidth: 1,
                        },
                    ]}
                    activeOpacity={0.8}
                >
                    <ThemedText>{i}</ThemedText>
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
