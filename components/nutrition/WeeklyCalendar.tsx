// components/nutrition/WeeklyCalendar.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');
const CALENDAR_PADDING = Spaces.LG * 2;
const DAY_CARD_WIDTH = (width - CALENDAR_PADDING - Spaces.SM * 6) / 7;
const WEEK_WIDTH = width - Spaces.MD * 2; // Account for card margins

// Helper functions
const getStartOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

const getWeekDates = (startOfWeek: Date) => {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        return date;
    });
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

interface WeeklyCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onWeekChange?: (weekDates: Date[]) => void;
    style?: object;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDate, onDateSelect, onWeekChange, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [currentWeekIndex, setCurrentWeekIndex] = useState(26); // Start at middle (26 weeks)
    const weekScrollRef = useRef<ScrollView>(null);
    const isScrollingToWeek = useRef(false);
    const hasInitialScrolled = useRef(false);
    const lastExternalSelectedDate = useRef<Date>(selectedDate); // Track external changes

    // Generate all weeks (6 months back and forwards = ~52 weeks total)
    const allWeeks = useMemo(() => {
        const today = new Date();
        const startOfCurrentWeek = getStartOfWeek(today);
        const weeks = [];

        // Go back 26 weeks, then forward 26 weeks
        for (let i = -26; i <= 26; i++) {
            const weekStart = new Date(startOfCurrentWeek);
            weekStart.setDate(startOfCurrentWeek.getDate() + i * 7);
            weeks.push({
                startDate: weekStart,
                dates: getWeekDates(weekStart),
                index: i + 26, // Offset so current week is at index 26
            });
        }

        return weeks;
    }, []);

    // Get current week based on index
    const currentWeek = useMemo(() => {
        return allWeeks[currentWeekIndex];
    }, [allWeeks, currentWeekIndex]);

    // Notify parent of week change
    useEffect(() => {
        if (currentWeek && onWeekChange) {
            onWeekChange(currentWeek.dates);
        }
    }, [currentWeek, onWeekChange]);

    // Scroll to current week on mount
    useEffect(() => {
        if (weekScrollRef.current && !hasInitialScrolled.current) {
            setTimeout(() => {
                if (weekScrollRef.current && !hasInitialScrolled.current) {
                    weekScrollRef.current.scrollTo({
                        x: currentWeekIndex * WEEK_WIDTH,
                        animated: false,
                    });
                    hasInitialScrolled.current = true;
                }
            }, 100);
        }
    }, [currentWeekIndex]);

    // Only respond to external selectedDate changes (not from calendar interactions)
    useEffect(() => {
        // Check if this is an external change (not from our calendar)
        const isExternalChange = selectedDate.getTime() !== lastExternalSelectedDate.current.getTime();

        if (isExternalChange) {
            const selectedWeekStart = getStartOfWeek(selectedDate);
            const newWeekIndex = allWeeks.findIndex((week) => week.startDate.getTime() === selectedWeekStart.getTime());

            if (newWeekIndex !== -1 && newWeekIndex !== currentWeekIndex) {
                setCurrentWeekIndex(newWeekIndex);
                scrollToWeek(newWeekIndex);
            }
        }

        lastExternalSelectedDate.current = selectedDate;
    }, [selectedDate, allWeeks, currentWeekIndex]);

    const scrollToWeek = (weekIndex: number) => {
        if (weekScrollRef.current && !isScrollingToWeek.current) {
            isScrollingToWeek.current = true;
            weekScrollRef.current.scrollTo({
                x: weekIndex * WEEK_WIDTH,
                animated: true,
            });

            setTimeout(() => {
                isScrollingToWeek.current = false;
            }, 300);
        }
    };

    const handleWeekDayPress = (date: Date) => {
        // Update our tracking ref before calling onDateSelect to prevent the useEffect from triggering
        lastExternalSelectedDate.current = date;
        onDateSelect(date);
        trigger('effectClick');
    };

    const handleWeekScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isScrollingToWeek.current) return;

        const { contentOffset } = event.nativeEvent;
        const weekIndex = Math.round(contentOffset.x / WEEK_WIDTH);

        if (weekIndex !== currentWeekIndex && weekIndex >= 0 && weekIndex < allWeeks.length) {
            setCurrentWeekIndex(weekIndex);
            trigger('virtualKey');
        }
    };

    const renderWeek = (week: (typeof allWeeks)[0]) => {
        return (
            <View key={week.index} style={[styles.weekPage, { width: WEEK_WIDTH }]}>
                <View style={styles.weekContainer}>
                    {week.dates.map((date, index) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isTodayDate = isToday(date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const dayNumber = date.getDate();

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleWeekDayPress(date)}
                                style={[
                                    styles.dayCard,
                                    {
                                        backgroundColor: isSelected ? themeColors.slateBlueTransparent : 'transparent',
                                        borderColor: themeColors.slateBlue,
                                        borderWidth: 1,
                                        width: DAY_CARD_WIDTH,
                                    },
                                ]}
                                activeOpacity={1}
                            >
                                <ThemedText type='bodySmall' style={[styles.dayName, { color: isSelected ? themeColors.slateBlue : themeColors.subText }]}>
                                    {dayName}
                                </ThemedText>
                                <ThemedText type='buttonSmall' style={[styles.dayNumber, { color: isSelected ? themeColors.slateBlue : themeColors.text }]}>
                                    {dayNumber}
                                </ThemedText>
                                {isTodayDate && (
                                    <View style={[styles.todayDot, { backgroundColor: isSelected ? themeColors.slateBlue : themeColors.iconSelected }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <ThemedView style={[styles.weeklyCard, { backgroundColor: themeColors.background }, style]}>
            <ScrollView
                ref={weekScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleWeekScroll}
                scrollEventThrottle={16}
                decelerationRate='fast'
                snapToInterval={WEEK_WIDTH}
                snapToAlignment='start'
                contentContainerStyle={styles.weekScrollContainer}
            >
                {allWeeks.map(renderWeek)}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    weeklyCard: {
        height: 60,
    },
    weekScrollContainer: {
        // Container for all weeks
    },
    weekPage: {
        justifyContent: 'center',
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCard: {
        borderRadius: Spaces.SM,
        paddingVertical: Spaces.XS,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dayName: {
        fontSize: 11,
    },
    dayNumber: {
        fontSize: 12,
        marginTop: -Spaces.XS,
    },
    todayDot: {
        width: Spaces.XS,
        height: Spaces.XS,
        borderRadius: Spaces.XS,
    },
});
