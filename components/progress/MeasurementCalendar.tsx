// components/progress/MeasurementCalendar.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { CalendarMonth } from '@/components/progress/CalendarMonth';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightenColor } from '@/utils/colorUtils';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ThemeColorKey = keyof (typeof Colors)['light'];

interface CalendarData {
    timestamp: string;
    value: number;
    originalData: any;
    previousData?: any;
}

interface MeasurementCalendarProps {
    data: CalendarData[];
    onDayPress?: (date: string) => void;
    renderTile: (item: CalendarData) => React.ReactNode;
    backgroundColor: ThemeColorKey;
}

export const MeasurementCalendar: React.FC<MeasurementCalendarProps> = ({ data, onDayPress, backgroundColor }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());

    // Create a map of dates with measurements for quick lookup
    const measurementDates = new Map(data.map((item) => [new Date(item.timestamp).toDateString(), item]));

    useEffect(() => {
        // Find the most recent measurement date
        if (data.length > 0) {
            const mostRecentDate = new Date(Math.max(...data.map((item) => new Date(item.timestamp).getTime())));
            setDisplayedMonth(mostRecentDate);
        }
    }, [data]);

    const handlePrevMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));
    };

    const isNextMonthInFuture = () => {
        const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return nextMonth > today;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth}>
                    <Icon name='chevron-back' color={themeColors.text} />
                </TouchableOpacity>
                <ThemedText type='body'>
                    {displayedMonth.toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </ThemedText>
                <TouchableOpacity onPress={handleNextMonth} disabled={isNextMonthInFuture()}>
                    <Icon name='chevron-forward' color={isNextMonthInFuture() ? lightenColor(themeColors.subText, 1) : themeColors.text} />
                </TouchableOpacity>
            </View>

            <CalendarMonth date={displayedMonth} measurementDates={measurementDates} onDayPress={onDayPress} backgroundColor={backgroundColor} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.MD,
    },
    listHeader: {
        marginTop: Spaces.XL,
        marginBottom: Spaces.MD,
        marginLeft: Spaces.LG,
    },
});
