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
import { UserMacroTarget } from '@/types';
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
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
    showWeeklyCalendar?: boolean;
}

/**
 * Calculates the expanded header height based on whether the weekly calendar is shown
 * @param showWeeklyCalendar - Whether the weekly calendar is visible
 * @returns The total expanded header height in pixels
 */
export const calculateFoodLogHeaderHeight = (showWeeklyCalendar: boolean = false): number => {
    const baseHeaderHeight = Platform.select({ ios: 44, android: 24 }) || 44;
    const dateNavigationHeight = 60;
    const macrosHeight = 60;
    const CALENDAR_HEIGHT = 60;

    return showWeeklyCalendar
        ? baseHeaderHeight + dateNavigationHeight + CALENDAR_HEIGHT + macrosHeight
        : baseHeaderHeight + dateNavigationHeight + macrosHeight;
};

const useOnboardingStatus = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return Boolean(user?.OnboardingComplete);
};

// Convert Date to YYYY-MM-DD string
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Finds the appropriate macro target for a given date
 * @param targets - Array of macro targets sorted by EffectiveDate
 * @param targetDate - The date to find the target for
 * @returns The macro target that applies to the target date
 */
const getMacroTargetForDate = (targets: UserMacroTarget[], targetDate: Date): UserMacroTarget | null => {
    if (!targets || targets.length === 0) return null;

    // Convert target date to YYYY-MM-DD format for comparison
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const targetDateString = `${year}-${month}-${day}`;

    // Sort targets by EffectiveDate in ascending order (earliest first)
    const sortedTargets = [...targets].sort((a, b) => a.EffectiveDate.localeCompare(b.EffectiveDate));

    // Find the most recent target that is effective on or before the target date
    let applicableTarget: UserMacroTarget | null = null;

    for (const target of sortedTargets) {
        if (target.EffectiveDate <= targetDateString) {
            applicableTarget = target;
        } else {
            // Since targets are sorted, we can break when we find the first future target
            break;
        }
    }

    // If no target is found (target date is before all targets), return the earliest target
    if (!applicableTarget && sortedTargets.length > 0) {
        applicableTarget = sortedTargets[0];
    }

    return applicableTarget;
};

export const FoodLogHeader: React.FC<FoodLogHeaderProps> = ({
    scrollY,
    dateNavigation,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 200,
    showWeeklyCalendar = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const isOnboardingComplete = useOnboardingStatus();

    // Get nutrition data from Redux selectors
    const { userMacroTargets, userNutritionLogs } = useSelector((state: RootState) => state.user);

    // Get the nutrition log for the selected date
    const selectedDateString = useMemo(() => formatDateForAPI(dateNavigation.selectedDate), [dateNavigation.selectedDate]);
    const nutritionLog = userNutritionLogs[selectedDateString] || null;

    // Get the macro target that applies to the selected date
    const selectedDateMacroTarget = useMemo(() => {
        if (!userMacroTargets || userMacroTargets.length === 0) {
            return null;
        }

        return getMacroTargetForDate(userMacroTargets, dateNavigation.selectedDate);
    }, [userMacroTargets, dateNavigation.selectedDate]);

    // Calculate consumed data from nutrition log
    const consumedData = useMemo(() => {
        if (!isOnboardingComplete) {
            // Preview data for non-onboarded users
            return {
                calories: 1850,
                protein: 110,
                carbs: 180,
                fat: 65,
            };
        }

        if (!nutritionLog || !nutritionLog.DailyTotals) {
            // No data for this date, return zeros
            return {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            };
        }

        // Use actual data from nutrition log
        const { DailyTotals } = nutritionLog;
        return {
            calories: Math.round(DailyTotals.Calories || 0),
            protein: Math.round(DailyTotals.Protein || 0),
            carbs: Math.round(DailyTotals.Carbs || 0),
            fat: Math.round(DailyTotals.Fat || 0),
        };
    }, [nutritionLog, isOnboardingComplete]);

    const CALENDAR_HEIGHT = 60;

    // Calculate header heights
    const baseHeaderHeight =
        Platform.select({
            ios: 44,
            android: 24,
        }) || 44;

    const dateNavigationHeight = 60;
    const macrosHeight = 60;

    const expandedHeaderHeight = showWeeklyCalendar
        ? baseHeaderHeight + dateNavigationHeight + CALENDAR_HEIGHT + macrosHeight
        : baseHeaderHeight + dateNavigationHeight + macrosHeight;
    const collapsedHeaderHeight = showWeeklyCalendar
        ? baseHeaderHeight + dateNavigationHeight + macrosHeight - Spaces.MD
        : baseHeaderHeight + dateNavigationHeight + macrosHeight;

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
        if (!showWeeklyCalendar) {
            return expandedHeaderHeight; // Static height when calendar is hidden
        }
        return interpolate(
            2 * scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            [expandedHeaderHeight, collapsedHeaderHeight],
            Extrapolation.CLAMP,
        );
    });

    // Calendar animations
    const calendarTranslateY = useDerivedValue(() => {
        if (!showWeeklyCalendar) return -CALENDAR_HEIGHT - Spaces.MD; // Hide by default
        return interpolate(2 * scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [0, -CALENDAR_HEIGHT - Spaces.MD], Extrapolation.CLAMP);
    });

    const calendarOpacity = useDerivedValue(() => {
        if (!showWeeklyCalendar) return 0; // Hide by default
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
        if (!showWeeklyCalendar) {
            return {}; // No animation when calendar is hidden
        }
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

            {/* Weekly Calendar - Transform animation (hidden by default) */}
            {showWeeklyCalendar && (
                <Animated.View style={[styles.calendarContainer, animatedCalendarStyle]}>
                    <WeeklyCalendar selectedDate={dateNavigation.selectedDate} onDateSelect={handleDateSelect} />
                </Animated.View>
            )}

            {/* Daily Macros Card - Moves up as calendar disappears */}
            {selectedDateMacroTarget && (
                <Animated.View style={[styles.macrosContainer, animatedMacrosStyle]}>
                    <DailyMacrosCardCompressed
                        consumedData={consumedData}
                        isOnboardingComplete={isOnboardingComplete}
                        macroTarget={selectedDateMacroTarget}
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
        paddingTop: Spaces.XS + Spaces.XXS,
    },
});

export default FoodLogHeader;
