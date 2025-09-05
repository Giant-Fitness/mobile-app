// components/nutrition/FoodLogHeader.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { DailyMacrosCardCompressed } from '@/components/nutrition/DailyMacrosCardCompressed';
import { WeeklyCalendar } from '@/components/nutrition/WeeklyCalendar';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserNutritionProfile } from '@/types';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

interface DateNavigationProps {
    selectedDate: Date;
    onDatePress: () => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
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
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
}

export const FoodLogHeader: React.FC<FoodLogHeaderProps> = ({
    scrollY,
    dateNavigation,
    userNutritionProfile,
    consumedData,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 200,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

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
            height: animatedHeaderHeight.value, // Add dynamic height
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
                <WeeklyCalendar
                    selectedDate={dateNavigation.selectedDate}
                    onDateSelect={() => {
                        dateNavigation.onDatePress();
                    }}
                />
            </Animated.View>

            {/* Daily Macros Card - Moves up as calendar disappears */}
            {userNutritionProfile && (
                <Animated.View style={[styles.macrosContainer, animatedMacrosStyle]}>
                    <DailyMacrosCardCompressed userNutritionProfile={userNutritionProfile} consumedData={consumedData} />
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
