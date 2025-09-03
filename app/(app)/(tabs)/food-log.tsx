// app/(app)/(tabs)/food-log.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { WeeklyCalendar } from '@/components/nutrition/WeeklyCalendar';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

// Mock data for nutrition logs
const mockNutritionData = {
    '2025-09-01': { calories: 1850, goal: 2200 },
    '2025-09-02': { calories: 2100, goal: 2200 },
    '2025-09-03': { calories: 1650, goal: 2200 }, // Today
    '2025-09-04': { calories: 0, goal: 2200 },
    '2025-09-05': { calories: 0, goal: 2200 },
    '2025-09-06': { calories: 0, goal: 2200 },
    '2025-09-07': { calories: 0, goal: 2200 },
};

export default function FoodLogScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Handle focus/blur events to manage refresh state
    useFocusEffect(
        useCallback(() => {
            isMountedAndFocused.current = true;

            return () => {
                isMountedAndFocused.current = false;
                // Clear any pending refresh timeout
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
                // Reset refresh state when leaving screen
                if (isRefreshing) {
                    setIsRefreshing(false);
                }
            };
        }, [isRefreshing]),
    );

    const handleRefresh = async () => {
        // Prevent multiple simultaneous refreshes
        if (isRefreshing) return;

        setIsRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await dispatch(getUserAsync({ forceRefresh: true }));
            // Add other food diary related async calls here when implemented
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            // Add a small delay to ensure smooth animation completion
            refreshTimeoutRef.current = setTimeout(() => {
                if (isMountedAndFocused.current) {
                    setIsRefreshing(false);
                }
                refreshTimeoutRef.current = null;
            }, 200);
        }
    };

    const handleDatePress = () => {
        console.log('Date picker should open for:', selectedDate);
        trigger('effectClick');
    };

    const handlePreviousDay = () => {
        const previousDay = new Date(selectedDate);
        previousDay.setDate(selectedDate.getDate() - 1);
        setSelectedDate(previousDay);
        trigger('virtualKey');
    };

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);
        setSelectedDate(nextDay);
        trigger('virtualKey');
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleWeekChange = (weekDates: Date[]) => {
        // Handle week change if needed
        console.log('Week changed:', weekDates);
    };

    const getCalorieProgress = (date: Date) => {
        const dateKey = date.toISOString().split('T')[0];
        const data = mockNutritionData[dateKey as keyof typeof mockNutritionData];
        return data ? data.calories / data.goal : 0;
    };

    return (
        <>
            {/* Animated Header with Date Navigation */}
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                disableBackButton={true}
                dateNavigation={{
                    selectedDate,
                    onDatePress: handleDatePress,
                    onPreviousDay: handlePreviousDay,
                    onNextDay: handleNextDay,
                }}
            />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.iconSelected]}
                        tintColor={themeColors.iconSelected}
                        progressViewOffset={Sizes.headerHeight}
                    />
                }
                style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}
                contentContainerStyle={{
                    paddingTop: Sizes.headerHeight + Spaces.MD,
                }}
            >
                {/* Weekly Calendar Component */}
                <WeeklyCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} onWeekChange={handleWeekChange} />

                {/* Rest of your food log content goes here */}
                <ThemedView style={styles.contentArea}>{/* Add your food diary content here */}</ThemedView>
            </Animated.ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentArea: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXXL,
    },
});
