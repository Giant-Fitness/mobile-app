// components/nutrition/FoodLogHeader.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { DailyMacrosCardCompressed } from '@/components/nutrition/DailyMacrosCardCompressed';
import { WeeklyCalendar } from '@/components/nutrition/WeeklyCalendar';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootState } from '@/store/store';
import { UserNutritionGoal, UserNutritionLog, UserNutritionProfile } from '@/types';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';

interface DateNavigationProps {
    selectedDate: Date;
    onDatePress: () => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onDateSelect: (date: Date) => void;
    formatDate?: (date: Date) => string;
}

interface FoodLogHeaderProps {
    scrollY: Animated.SharedValue<number>;
    dateNavigation: DateNavigationProps;
    userNutritionProfile?: UserNutritionProfile;
    consumedData: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    nutritionLog?: UserNutritionLog | null;
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
}

const useOnboardingStatus = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return Boolean(user?.OnboardingComplete);
};

/**
 * Finds the appropriate nutrition goal for a given date
 * @param goals - Array of nutrition goals sorted by EffectiveDate
 * @param targetDate - The date to find the goal for
 * @returns The nutrition goal that applies to the target date
 */
const getGoalForDate = (goals: UserNutritionGoal[], targetDate: Date): UserNutritionGoal | null => {
    if (!goals || goals.length === 0) return null;

    // Convert target date to YYYY-MM-DD format for comparison
    // Use local timezone to avoid timezone issues
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const targetDateString = `${year}-${month}-${day}`;

    // Sort goals by EffectiveDate in ascending order (earliest first)
    const sortedGoals = [...goals].sort((a, b) => a.EffectiveDate.localeCompare(b.EffectiveDate));

    // Find the most recent goal that is effective on or before the target date
    let applicableGoal: UserNutritionGoal | null = null;

    for (const goal of sortedGoals) {
        if (goal.EffectiveDate <= targetDateString) {
            applicableGoal = goal;
        } else {
            // Since goals are sorted, we can break when we find the first future goal
            break;
        }
    }

    // If no goal is found (target date is before all goals), return the earliest goal
    if (!applicableGoal && sortedGoals.length > 0) {
        applicableGoal = sortedGoals[0];
    }

    return applicableGoal;
};

export const FoodLogHeader: React.FC<FoodLogHeaderProps> = ({
    scrollY,
    dateNavigation,
    consumedData,
    nutritionLog,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 200,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const isOnboardingComplete = useOnboardingStatus();

    const { userNutritionGoalHistory } = useSelector((state: RootState) => state.user);

    // Get the nutrition goal that applies to the selected date
    const selectedDateNutritionGoal = useMemo(() => {
        if (!userNutritionGoalHistory || userNutritionGoalHistory.length === 0) {
            return null;
        }

        return getGoalForDate(userNutritionGoalHistory, dateNavigation.selectedDate);
    }, [userNutritionGoalHistory, dateNavigation.selectedDate]);

    // Calculate actual consumed data from nutrition log if available
    const actualConsumedData = useMemo(() => {
        if (!isOnboardingComplete) {
            // Use preview data for non-onboarded users
            return consumedData;
        }

        if (!nutritionLog || !nutritionLog.DailyTotals) {
            // No data for this date, return zeros
            return {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
            };
        }

        // Use actual data from nutrition log
        const { DailyTotals } = nutritionLog;
        return {
            calories: Math.round(DailyTotals.Calories || 0),
            protein: Math.round(DailyTotals.Protein || 0),
            carbs: Math.round(DailyTotals.Carbs || 0),
            fats: Math.round(DailyTotals.Fats || 0),
        };
    }, [nutritionLog, consumedData, isOnboardingComplete]);

    const CALENDAR_HEIGHT = 60;

    // Calculate header heights
    const baseHeaderHeight =
        Platform.select({
            ios: 44,
            android: 24,
        }) || 44;

    const dateNavigationHeight = 60;
    const macrosHeight = 60;

    const expandedHeaderHeight = baseHeaderHeight + dateNavigationHeight + CALENDAR_HEIGHT + macrosHeight;
    const collapsedHeaderHeight = baseHeaderHeight + dateNavigationHeight + macrosHeight - Spaces.MD;

    // Default date formatter
    const defaultFormatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const formatDate = dateNavigation.formatDate || defaultFormatDate;

    // Header height animation - like HomeExpandableHeader
    const animatedHeaderHeight = useDerivedValue(() => {
        return interpolate(
            2 * scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            [expandedHeaderHeight, collapsedHeaderHeight],
            Extrapolation.CLAMP,
        );
    });

    // Calendar animations
    const calendarTranslateY = useDerivedValue(() => {
        return interpolate(2 * scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [0, -CALENDAR_HEIGHT - Spaces.MD], Extrapolation.CLAMP);
    });

    const calendarOpacity = useDerivedValue(() => {
        return interpolate(2 * scrollY.value, [headerInterpolationStart, headerInterpolationEnd * 0.7], [1, 0], Extrapolation.CLAMP);
    });

    // Animated styles
    const animatedHeaderStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: themeColors.background,
            height: animatedHeaderHeight.value,
        };
    });

    // Calendar animation using transform instead of height
    const animatedCalendarStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: calendarTranslateY.value }],
            opacity: calendarOpacity.value,
        };
    });

    // Macros container moves up as calendar disappears
    const animatedMacrosStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: calendarTranslateY.value }],
        };
    });

    const handlePreviousDay = () => {
        dateNavigation.onPreviousDay();
        trigger('virtualKey');
    };

    const handleNextDay = () => {
        dateNavigation.onNextDay();
        trigger('virtualKey');
    };

    const handleDatePress = () => {
        dateNavigation.onDatePress();
        trigger('effectClick');
    };

    const handleDateSelect = (date: Date) => {
        dateNavigation.onDateSelect(date);
        trigger('effectClick');
    };

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            {/* Date Navigation - Always visible, no animation */}
            <View style={styles.dateNavigationContent}>
                <TouchableOpacity onPress={handlePreviousDay} style={styles.chevronButton} activeOpacity={1}>
                    <Icon name='chevron-back' color={themeColors.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDatePress} style={styles.dateButton} activeOpacity={1}>
                    <View style={styles.dateButtonContent}>
                        <ThemedText type='title' style={[styles.dateTitle, { color: themeColors.text }]}>
                            {formatDate(dateNavigation.selectedDate)}
                        </ThemedText>
                        <Icon name='caret-down' size={Sizes.iconSizeXS} color={themeColors.text} style={styles.dropdownIcon} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNextDay} style={styles.chevronButton} activeOpacity={1}>
                    <Icon name='chevron-forward' color={themeColors.text} />
                </TouchableOpacity>
            </View>

            {/* Weekly Calendar - Transform animation */}
            <Animated.View style={[styles.calendarContainer, animatedCalendarStyle]}>
                <WeeklyCalendar selectedDate={dateNavigation.selectedDate} onDateSelect={handleDateSelect} />
            </Animated.View>

            {/* Daily Macros Card - Moves up as calendar disappears */}
            {selectedDateNutritionGoal && (
                <Animated.View style={[styles.macrosContainer, animatedMacrosStyle]}>
                    <DailyMacrosCardCompressed
                        consumedData={actualConsumedData}
                        isOnboardingComplete={isOnboardingComplete}
                        nutritionGoal={selectedDateNutritionGoal}
                        nutritionLog={nutritionLog}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden', // Important: clips content as height shrinks
        ...Platform.select({
            ios: {
                paddingTop: 44,
            },
            android: {
                paddingTop: 24,
            },
        }),
    },
    dateNavigationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
    },
    chevronButton: {
        padding: Spaces.SM,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateButton: {
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.MD,
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTitle: {
        textAlign: 'center',
    },
    dropdownIcon: {
        marginLeft: Spaces.XS,
    },
    calendarContainer: {
        marginHorizontal: Spaces.MD,
        overflow: 'hidden', // Hide content that transforms out of bounds
    },
    macrosContainer: {
        paddingHorizontal: Spaces.MD,
        paddingTop: Spaces.SM,
        paddingBottom: Spaces.MD,
    },
});

export default FoodLogHeader;
