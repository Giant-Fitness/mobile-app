// app/(app)/(tabs)/food-log.tsx

import { FoodLogContent } from '@/components/nutrition/FoodLogContent';
import { FoodLogHeader } from '@/components/nutrition/FoodLogHeader';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { DatePickerBottomSheet } from '@/components/overlays/DatePickerBottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import { getNutritionLogsAsync, getUserAsync } from '@/store/user/thunks';
import { addAlpha } from '@/utils/colorUtils';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';

import { useFocusEffect } from '@react-navigation/native';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { trigger } from 'react-native-haptic-feedback';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 500;
const ACTIVATION_THRESHOLD = 20;

// Feature flags
const FEATURE_FLAGS = {
    SWIPEABLE_DATE_NAVIGATION: true, // Set to true to enable swipe functionality
};

const useOnboardingStatus = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return Boolean(user?.OnboardingComplete);
};

// Helper functions for date manipulation
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const isWithinAllowedRange = (date: Date): boolean => {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    return date >= oneYearAgo && date <= oneYearFromNow;
};

// Convert Date to YYYY-MM-DD string
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function FoodLogScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isPanEnabled, setIsPanEnabled] = useState(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);

    // Animation values for horizontal swiping (only used if feature flag is enabled)
    const translateX = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const isSwipeActivated = useSharedValue(false);

    // Dates for the sliding window (only used if swipe feature is enabled)
    const [dates, setDates] = useState(() => ({
        previous: addDays(selectedDate, -1),
        current: selectedDate,
        next: addDays(selectedDate, 1),
    }));

    const isOnboardingComplete = useOnboardingStatus();

    // Redux state
    const { user, userNutritionLogs } = useSelector((state: RootState) => state.user);

    // Get nutrition log for selected date
    const selectedDateString = useMemo(() => formatDateForAPI(selectedDate), [selectedDate]);
    const selectedDateNutritionLog = useMemo(() => {
        // Check if the date key exists (handles null values properly)
        if (selectedDateString in userNutritionLogs) {
            return userNutritionLogs[selectedDateString]; // This can be null or UserNutritionLog
        }
        return null; // Not loaded yet
    }, [userNutritionLogs, selectedDateString]);

    // Calculate consumed data from nutrition log
    const consumedData = useMemo(() => {
        if (!isOnboardingComplete) {
            // Preview data for non-onboarded users
            return {
                calories: 1850,
                protein: 110,
                carbs: 180,
                fats: 65,
            };
        }

        if (!selectedDateNutritionLog || !selectedDateNutritionLog.DailyTotals) {
            // No data logged for this date
            return {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
            };
        }

        const { DailyTotals } = selectedDateNutritionLog;
        return {
            calories: Math.round(DailyTotals.Calories || 0),
            protein: Math.round(DailyTotals.Protein || 0),
            carbs: Math.round(DailyTotals.Carbs || 0),
            fats: Math.round(DailyTotals.Fats || 0),
        };
    }, [selectedDateNutritionLog, isOnboardingComplete]);

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Load nutrition logs for the selected date and surrounding dates
    const loadNutritionLogsForDates = useCallback(
        (centerDate: Date) => {
            if (!user?.UserId || !isOnboardingComplete) return;

            if (FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) {
                const datesToLoad = [addDays(centerDate, -1), centerDate, addDays(centerDate, 1)];

                datesToLoad.forEach((date) => {
                    const dateString = formatDateForAPI(date);
                    // Check if dateString exists as a key in userNutritionLogs (handles null values)
                    if (!(dateString in userNutritionLogs)) {
                        console.log(`Loading nutrition logs for ${dateString} (not in Redux state)`);
                        dispatch(getNutritionLogsAsync({ date: dateString, useCache: true }));
                    } else {
                        console.log(`Skipping load for ${dateString} (already in Redux state)`);
                    }
                });
            } else {
                // Only load current date when swipe is disabled
                const dateString = formatDateForAPI(centerDate);
                // Check if dateString exists as a key in userNutritionLogs (handles null values)
                if (!(dateString in userNutritionLogs)) {
                    console.log(`Loading nutrition logs for ${dateString} (not in Redux state)`);
                    dispatch(getNutritionLogsAsync({ date: dateString, useCache: true }));
                } else {
                    console.log(`Skipping load for ${dateString} (already in Redux state)`);
                }
            }
        },
        [dispatch, user?.UserId, isOnboardingComplete, userNutritionLogs],
    );

    // Load logs when component mounts or date changes
    useFocusEffect(
        useCallback(() => {
            loadNutritionLogsForDates(selectedDate);
        }, [loadNutritionLogsForDates, selectedDate]),
    );

    // Update dates when selectedDate changes externally (only if swipe feature is enabled)
    React.useEffect(() => {
        if (FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) {
            if (!isAnimating.value) {
                setDates({
                    previous: addDays(selectedDate, -1),
                    current: selectedDate,
                    next: addDays(selectedDate, 1),
                });
                translateX.value = 0;
            }
        } else {
            setDates({
                previous: addDays(selectedDate, -1),
                current: selectedDate,
                next: addDays(selectedDate, 1),
            });
        }
    }, [selectedDate]);

    // Animation completion callback (only used if swipe feature is enabled)
    const onSwipeComplete = useCallback(
        (direction: 'left' | 'right') => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;

            isAnimating.value = false;
            isSwipeActivated.value = false;

            if (direction === 'left') {
                // Swiped left - go to next day
                const nextDate = dates.next;
                if (nextDate && isWithinAllowedRange(nextDate)) {
                    setSelectedDate(nextDate);
                    trigger('virtualKey');
                } else {
                    translateX.value = withSpring(0);
                }
            } else {
                // Swiped right - go to previous day
                const prevDate = dates.previous;
                if (prevDate && isWithinAllowedRange(prevDate)) {
                    setSelectedDate(prevDate);
                    trigger('virtualKey');
                } else {
                    translateX.value = withSpring(0);
                }
            }
        },
        [dates],
    );

    // Reset animation callback (only used if swipe feature is enabled)
    const onSwipeReset = useCallback(() => {
        if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;
        isAnimating.value = false;
        isSwipeActivated.value = false;
    }, []);

    // Pan gesture for horizontal swiping (only active if feature flag is enabled)
    const panGesture = Gesture.Pan()
        .enabled(isPanEnabled && FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION)
        .onStart(() => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;
            isAnimating.value = true;
            isSwipeActivated.value = false;
        })
        .onUpdate((event) => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;
            const absTranslationX = Math.abs(event.translationX);
            const absTranslationY = Math.abs(event.translationY);
            // Only activate if horizontal movement is dominant
            if (absTranslationX > ACTIVATION_THRESHOLD && absTranslationX > absTranslationY * 2) {
                isSwipeActivated.value = true;
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;

            const { translationX, velocityX } = event;

            if (!isSwipeActivated.value) {
                translateX.value = withSpring(0, {}, () => {
                    runOnJS(onSwipeReset)();
                });
                return;
            }

            const shouldSwipeLeft = translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;
            const shouldSwipeRight = translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;

            if (shouldSwipeLeft) {
                translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
                    runOnJS(onSwipeComplete)('left');
                });
            } else if (shouldSwipeRight) {
                translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
                    runOnJS(onSwipeComplete)('right');
                });
            } else {
                translateX.value = withSpring(0, {}, () => {
                    runOnJS(onSwipeReset)();
                });
            }
        });

    // Native gesture for the ScrollView
    const nativeGesture = Gesture.Native();

    // Compose gestures to work simultaneously (only if swipe feature is enabled)
    const composedGesture = FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION ? Gesture.Simultaneous(panGesture, nativeGesture) : nativeGesture;

    // Optimized scroll handler for smooth performance
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
        onEndDrag: () => {
            runOnJS(setIsPanEnabled)(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);
        },
        onMomentumEnd: () => {
            runOnJS(setIsPanEnabled)(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);
        },
    });

    // Calculate initial header height (when calendar is visible) - FIXED VALUES
    const calculateExpandedHeaderHeight = () => {
        const baseHeaderHeight = Platform.select({ ios: 44, android: 24 }) || 44;
        const dateNavigationHeight = 60;
        const macrosHeight = 60;
        const CALENDAR_HEIGHT = 60;
        return baseHeaderHeight + dateNavigationHeight + CALENDAR_HEIGHT + macrosHeight;
    };

    const expandedHeaderHeight = calculateExpandedHeaderHeight();

    // Handle focus/blur events to manage refresh state
    useFocusEffect(
        useCallback(() => {
            isMountedAndFocused.current = true;
            return () => {
                isMountedAndFocused.current = false;
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
                if (isRefreshing) {
                    setIsRefreshing(false);
                }
            };
        }, [isRefreshing]),
    );

    const handleRefresh = async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await dispatch(getUserAsync({ forceRefresh: true }));

            // Refresh nutrition logs for current dates
            if (user?.UserId && isOnboardingComplete) {
                if (FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) {
                    const datesToRefresh = [dates.previous, dates.current, dates.next];
                    await Promise.all(
                        datesToRefresh.filter(Boolean).map((date) =>
                            dispatch(
                                getNutritionLogsAsync({
                                    date: formatDateForAPI(date),
                                    forceRefresh: true, // Force refresh to bypass cache and Redux state
                                }),
                            ),
                        ),
                    );
                } else {
                    // Only refresh current date when swipe is disabled
                    await dispatch(
                        getNutritionLogsAsync({
                            date: formatDateForAPI(selectedDate),
                            forceRefresh: true, // Force refresh to bypass cache and Redux state
                        }),
                    );
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            refreshTimeoutRef.current = setTimeout(() => {
                if (isMountedAndFocused.current) {
                    setIsRefreshing(false);
                }
                refreshTimeoutRef.current = null;
            }, 200);
        }
    };

    const handleDatePress = () => {
        setShowDatePicker(true);
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
        setShowDatePicker(false);
    };

    const handleDatePickerClose = () => {
        setShowDatePicker(false);
    };

    // Animated container style for horizontal swiping (only applied if feature flag is enabled)
    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION ? [{ translateX: translateX.value }] : [],
    }));

    const OnboardingOverlay = () => (
        <BlurView intensity={12} tint={colorScheme} style={styles.onboardingOverlay}>
            <View style={[styles.overlayBackground, { backgroundColor: addAlpha(themeColors.backgroundSecondary, 0.6) }]} />
            <View style={styles.onboardingCardContainer}>
                <OnboardingCard key='onboarding' isOnboardingComplete={isOnboardingComplete} />
            </View>
        </BlurView>
    );

    return (
        <View style={styles.container}>
            {/* Food Log Header with date navigation, calendar, and macros */}
            <FoodLogHeader
                scrollY={scrollY}
                dateNavigation={{
                    selectedDate,
                    onDatePress: handleDatePress,
                    onPreviousDay: handlePreviousDay,
                    onNextDay: handleNextDay,
                    onDateSelect: handleDateSelect,
                }}
                consumedData={consumedData}
                nutritionLog={selectedDateNutritionLog}
                headerInterpolationStart={60}
            />

            {/* GestureDetector must be direct parent of Animated.ScrollView */}
            <GestureHandlerRootView>
                <GestureDetector gesture={composedGesture}>
                    <Animated.ScrollView
                        onScroll={scrollHandler}
                        showsVerticalScrollIndicator={false}
                        overScrollMode='never'
                        bounces={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                colors={[themeColors.iconSelected]}
                                tintColor={themeColors.iconSelected}
                                progressViewOffset={expandedHeaderHeight}
                            />
                        }
                        style={[styles.scrollView, { backgroundColor: themeColors.backgroundSecondary }]}
                        contentContainerStyle={{
                            paddingTop: expandedHeaderHeight + Spaces.MD,
                        }}
                        scrollEventThrottle={16}
                    >
                        {/* Conditional rendering based on feature flag */}
                        {FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION ? (
                            /* Horizontal sliding container for swipe functionality */
                            <Animated.View style={[styles.slidingContainer, animatedContainerStyle]}>
                                {/* Previous Day */}
                                <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                    <FoodLogContent selectedDate={dates.previous} />
                                </View>

                                {/* Current Day */}
                                <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                    <FoodLogContent selectedDate={dates.current} />
                                </View>

                                {/* Next Day */}
                                <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                    <FoodLogContent selectedDate={dates.next} />
                                </View>
                            </Animated.View>
                        ) : (
                            /* Simple single day container when swipe is disabled */
                            <View style={{ backgroundColor: themeColors.backgroundSecondary }}>
                                <FoodLogContent selectedDate={selectedDate} />
                            </View>
                        )}
                    </Animated.ScrollView>
                </GestureDetector>
            </GestureHandlerRootView>

            {/* Date Picker Bottom Sheet */}
            <DatePickerBottomSheet
                visible={showDatePicker}
                onClose={handleDatePickerClose}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                title='Select Date'
            />

            {/* Onboarding Overlay - Covers entire screen except header */}
            {!isOnboardingComplete && <OnboardingOverlay />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    slidingContainer: {
        flexDirection: 'row',
        width: SCREEN_WIDTH * 3, // Three screens wide
    },
    dayContainer: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    onboardingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        zIndex: 10,
    },
    onboardingCardContainer: {
        width: '100%',
    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: Spaces.LG,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: Spaces.SM,
        elevation: 3,
        zIndex: 10,
    },
});
