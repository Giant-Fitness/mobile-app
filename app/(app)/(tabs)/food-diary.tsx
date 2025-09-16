// app/(app)/(tabs)/food-diary.tsx

import { FoodLogContent } from '@/components/nutrition/FoodLogContent';
import { FoodLogHeader } from '@/components/nutrition/FoodLogHeader';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { DatePickerBottomSheet } from '@/components/overlays/DatePickerBottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNutritionDataPool } from '@/hooks/useNutritionDataPool';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync, getUserNutritionGoalHistoryAsync } from '@/store/user/thunks';
import { addAlpha } from '@/utils/colorUtils';
import React, { useCallback, useRef, useState } from 'react';
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
    SWIPEABLE_DATE_NAVIGATION: true,
    DEBUG_MODE: __DEV__ && false,
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

const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export default function FoodDiaryScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isPanEnabled, setIsPanEnabled] = useState(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);
    const [gestureDirection, setGestureDirection] = useState<'none' | 'horizontal' | 'vertical'>('none');

    // Refs for gesture direction tracking
    const gestureDirectionRef = useRef<'none' | 'horizontal' | 'vertical'>('none');

    // Track if the date change was from swiping to avoid useEffect conflicts
    const dateChangeSource = useRef<'swipe' | 'external'>('external');

    // 🚀 VIRTUALIZED: Single component offset instead of 3 components
    const contentOffset = useSharedValue(0); // -SCREEN_WIDTH = prev day, 0 = current, +SCREEN_WIDTH = next day
    const isAnimating = useSharedValue(false);
    const isSwipeActivated = useSharedValue(false);

    // 🚀 VIRTUALIZED: Track which dates are "virtually" positioned where
    const [virtualDates, setVirtualDates] = useState(() => ({
        left: addDays(selectedDate, -1), // The date that would be shown if we scroll left
        center: selectedDate, // Current visible date
        right: addDays(selectedDate, 1), // The date that would be shown if we scroll right
    }));

    // Data pool for pre-loaded nutrition data
    const { getDataForDate, refreshPool } = useNutritionDataPool(selectedDate, {
        poolSize: 21,
        loadBuffer: 7,
        autoLoad: true,
        useCache: true,
    });

    const isOnboardingComplete = useOnboardingStatus();

    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Cleanup function for focus effect
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

    // Update virtual dates when selectedDate changes externally (date picker, header buttons)
    // but NOT when changed by swiping (since onSwipeComplete handles that)
    React.useEffect(() => {
        // Skip if this change was from swiping - onSwipeComplete already updated virtualDates
        if (dateChangeSource.current === 'swipe') {
            dateChangeSource.current = 'external'; // Reset for next change
            return;
        }

        const newVirtualDates = {
            left: addDays(selectedDate, -1),
            center: selectedDate,
            right: addDays(selectedDate, 1),
        };

        // Only update if center date actually changed
        if (formatDateKey(virtualDates.center) !== formatDateKey(selectedDate)) {
            setVirtualDates(newVirtualDates);
            contentOffset.value = 0; // Reset to center position
        }
    }, [selectedDate, virtualDates.center]);

    // 🚀 VIRTUALIZED: Animation completion - only updates selectedDate, no component data juggling
    const onSwipeComplete = useCallback(
        (direction: 'left' | 'right') => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;

            let newDate: Date;
            let newVirtualDates: typeof virtualDates;

            if (direction === 'left') {
                // Swiped left - go to next day (virtualDates.right becomes new center)
                newDate = virtualDates.right;
                newVirtualDates = {
                    left: virtualDates.center, // Current center becomes left
                    center: virtualDates.right, // Right becomes new center
                    right: addDays(virtualDates.right, 1), // New right
                };
            } else {
                // Swiped right - go to previous day (virtualDates.left becomes new center)
                newDate = virtualDates.left;
                newVirtualDates = {
                    left: addDays(virtualDates.left, -1), // New left
                    center: virtualDates.left, // Left becomes new center
                    right: virtualDates.center, // Current center becomes right
                };
            }

            if (!isWithinAllowedRange(newDate)) {
                contentOffset.value = withSpring(0);
                isAnimating.value = false;
                isSwipeActivated.value = false;
                return;
            }

            // Mark that this date change is from swiping
            dateChangeSource.current = 'swipe';

            // Update both states synchronously in the same render cycle
            setVirtualDates(newVirtualDates);
            setSelectedDate(newDate);
            contentOffset.value = 0; // Reset to center
            trigger('virtualKey');

            isAnimating.value = false;
            isSwipeActivated.value = false;
        },
        [virtualDates],
    );

    const onSwipeReset = useCallback(() => {
        if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;
        isAnimating.value = false;
        isSwipeActivated.value = false;
    }, []);

    // Enhanced pan gesture with strict direction locking
    const panGesture = Gesture.Pan()
        .enabled(isPanEnabled && FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION)
        .onStart(() => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;
            isAnimating.value = true;
            isSwipeActivated.value = false;
            gestureDirectionRef.current = 'none';
            runOnJS(setGestureDirection)('none');
        })
        .onUpdate((event) => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;

            const absTranslationX = Math.abs(event.translationX);
            const absTranslationY = Math.abs(event.translationY);

            // Only determine direction if we haven't locked to one yet
            if (gestureDirectionRef.current === 'none') {
                // Check if movement is significant enough to determine direction
                if (absTranslationX > ACTIVATION_THRESHOLD || absTranslationY > ACTIVATION_THRESHOLD) {
                    // Determine primary direction with a bias towards vertical scrolling
                    // This gives scroll view priority when movements are similar
                    if (absTranslationX > absTranslationY * 1.5) {
                        // Horizontal movement is significantly stronger
                        gestureDirectionRef.current = 'horizontal';
                        runOnJS(setGestureDirection)('horizontal');
                        isSwipeActivated.value = true;
                    } else if (absTranslationY > ACTIVATION_THRESHOLD) {
                        // Vertical movement detected or movements are similar - prefer vertical
                        gestureDirectionRef.current = 'vertical';
                        runOnJS(setGestureDirection)('vertical');
                        isSwipeActivated.value = false;
                        return; // Exit early to let scroll view handle it
                    }
                }
            }

            // Only update horizontal offset if we've locked to horizontal direction
            if (gestureDirectionRef.current === 'horizontal' && isSwipeActivated.value) {
                contentOffset.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (!FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION) return;

            const { translationX, velocityX } = event;

            // Reset gesture direction
            gestureDirectionRef.current = 'none';
            runOnJS(setGestureDirection)('none');

            // Only handle swipe completion if we were in horizontal mode
            if (!isSwipeActivated.value) {
                contentOffset.value = withSpring(0, {}, () => {
                    runOnJS(onSwipeReset)();
                });
                return;
            }

            const shouldSwipeLeft = translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;
            const shouldSwipeRight = translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;

            if (shouldSwipeLeft) {
                contentOffset.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
                    runOnJS(onSwipeComplete)('left');
                });
            } else if (shouldSwipeRight) {
                contentOffset.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
                    runOnJS(onSwipeComplete)('right');
                });
            } else {
                contentOffset.value = withSpring(0, {}, () => {
                    runOnJS(onSwipeReset)();
                });
            }
        })
        .failOffsetY([-10, 10]); // This helps prevent conflicts with vertical scrolling

    const nativeGesture = Gesture.Native();
    const composedGesture = FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION ? Gesture.Simultaneous(panGesture, nativeGesture) : nativeGesture;

    // Update the scroll handler to disable pan when scrolling
    const scrollHandler = useAnimatedScrollHandler({
        onBeginDrag: () => {
            // Temporarily disable pan gesture when user starts scrolling
            runOnJS(setIsPanEnabled)(false);
        },
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
        onEndDrag: () => {
            // Re-enable pan gesture after scroll ends
            runOnJS(setIsPanEnabled)(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);
        },
        onMomentumEnd: () => {
            runOnJS(setIsPanEnabled)(FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION);
        },
    });

    const calculateExpandedHeaderHeight = () => {
        const baseHeaderHeight = Platform.select({ ios: 44, android: 24 }) || 44;
        const dateNavigationHeight = 60;
        const macrosHeight = 60;
        const CALENDAR_HEIGHT = 60;
        return baseHeaderHeight + dateNavigationHeight + CALENDAR_HEIGHT + macrosHeight;
    };

    const expandedHeaderHeight = calculateExpandedHeaderHeight();

    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await Promise.all([
                dispatch(getUserAsync({ forceRefresh: true })),
                dispatch(getUserNutritionGoalHistoryAsync({ forceRefresh: true })),
                refreshPool(selectedDate, true),
            ]);
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
    }, [dispatch, refreshPool, selectedDate, isRefreshing]);

    const handleDatePress = () => {
        setShowDatePicker(true);
        trigger('effectClick');
    };

    const handlePreviousDay = () => {
        const previousDay = addDays(selectedDate, -1);
        setSelectedDate(previousDay);
        trigger('virtualKey');
    };

    const handleNextDay = () => {
        const nextDay = addDays(selectedDate, 1);
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

    // VIRTUALIZED: Single content container that slides
    const animatedContentStyle = useAnimatedStyle(() => ({
        transform: FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION ? [{ translateX: contentOffset.value }] : [],
    }));

    // Get the data for the currently visible date (not all 3 dates)
    const currentlyVisibleDate = FEATURE_FLAGS.SWIPEABLE_DATE_NAVIGATION
        ? virtualDates.center // During animation, always show center data to avoid flicker
        : selectedDate;

    const visibleDayData = getDataForDate(currentlyVisibleDate);

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
            <FoodLogHeader
                scrollY={scrollY}
                dateNavigation={{
                    selectedDate,
                    onDatePress: handleDatePress,
                    onPreviousDay: handlePreviousDay,
                    onNextDay: handleNextDay,
                    onDateSelect: handleDateSelect,
                }}
                headerInterpolationStart={60}
            />

            <GestureHandlerRootView>
                <GestureDetector gesture={composedGesture}>
                    <Animated.ScrollView
                        onScroll={scrollHandler}
                        showsVerticalScrollIndicator={false}
                        overScrollMode='never'
                        bounces={true}
                        scrollEnabled={gestureDirection !== 'horizontal'} // Disable scroll when horizontal gesture is active
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
                        {/* VIRTUALIZED: Single content container that slides */}
                        <Animated.View style={[animatedContentStyle]}>
                            <View style={{ backgroundColor: themeColors.backgroundSecondary }}>
                                <FoodLogContent
                                    key={formatDateKey(currentlyVisibleDate)} // Key changes only when date actually changes
                                    selectedDate={currentlyVisibleDate}
                                    nutritionLog={visibleDayData}
                                />
                            </View>
                        </Animated.View>
                    </Animated.ScrollView>
                </GestureDetector>
            </GestureHandlerRootView>

            <DatePickerBottomSheet
                visible={showDatePicker}
                onClose={handleDatePickerClose}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                title='Select Date'
            />

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
});
