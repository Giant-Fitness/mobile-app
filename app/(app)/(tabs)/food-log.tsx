// app/(app)/(tabs)/food-log.tsx

import { FoodLogHeader } from '@/components/nutrition/FoodLogHeader';
import { SwipeableFoodLogContent } from '@/components/nutrition/SwipeableFoodLogContent';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { DatePickerBottomSheet } from '@/components/overlays/DatePickerBottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
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

export default function FoodLogScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isPanEnabled, setIsPanEnabled] = useState(true);

    // Animation values for horizontal swiping
    const translateX = useSharedValue(0);
    const isAnimating = useSharedValue(false); // Changed from useRef to useSharedValue
    const isSwipeActivated = useSharedValue(false);

    // Dates for the sliding window (previous, current, next)
    const [dates, setDates] = useState(() => ({
        previous: addDays(selectedDate, -1),
        current: selectedDate,
        next: addDays(selectedDate, 1),
    }));

    const isOnboardingComplete = useOnboardingStatus();

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Update dates when selectedDate changes externally
    React.useEffect(() => {
        if (!isAnimating.value) {
            // Changed from isAnimating.current to isAnimating.value
            setDates({
                previous: addDays(selectedDate, -1),
                current: selectedDate,
                next: addDays(selectedDate, 1),
            });
            translateX.value = 0;
        }
    }, [selectedDate]);

    // Animation completion callback
    const onSwipeComplete = useCallback(
        (direction: 'left' | 'right') => {
            isAnimating.value = false; // Changed from isAnimating.current to isAnimating.value
            isSwipeActivated.value = false;

            if (direction === 'left') {
                // Swiped left - go to next day
                const nextDate = dates.next;
                if (isWithinAllowedRange(nextDate)) {
                    setSelectedDate(nextDate);
                    trigger('virtualKey');
                } else {
                    translateX.value = withSpring(0);
                }
            } else {
                // Swiped right - go to previous day
                const prevDate = dates.previous;
                if (isWithinAllowedRange(prevDate)) {
                    setSelectedDate(prevDate);
                    trigger('virtualKey');
                } else {
                    translateX.value = withSpring(0);
                }
            }
        },
        [dates],
    );

    // Reset animation callback
    const onSwipeReset = useCallback(() => {
        isAnimating.value = false; // Changed from isAnimating.current to isAnimating.value
        isSwipeActivated.value = false;
    }, []);

    // Pan gesture for horizontal swiping
    const panGesture = Gesture.Pan()
        .enabled(isPanEnabled)
        .onStart(() => {
            isAnimating.value = true; // Changed from isAnimating.current to isAnimating.value
            isSwipeActivated.value = false;
        })
        .onUpdate((event) => {
            const absTranslationX = Math.abs(event.translationX);
            const absTranslationY = Math.abs(event.translationY);
            // Only activate if horizontal movement is dominant
            if (absTranslationX > ACTIVATION_THRESHOLD && absTranslationX > absTranslationY * 2) {
                isSwipeActivated.value = true;
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
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

    // Compose gestures to work simultaneously
    const composedGesture = Gesture.Simultaneous(panGesture, nativeGesture);

    // Optimized scroll handler for smooth performance
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
        onEndDrag: () => {
            runOnJS(setIsPanEnabled)(true);
        },
        onMomentumEnd: () => {
            runOnJS(setIsPanEnabled)(true);
        },
    });

    const mockConsumedData = {
        calories: 1500,
        protein: 155,
        carbs: 180,
        fats: 45,
    };

    // Use preview data when not onboarded
    const previewConsumedData = {
        calories: 1850,
        protein: 110,
        carbs: 180,
        fats: 65,
    };

    const consumedData = isOnboardingComplete ? mockConsumedData : previewConsumedData;

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

    // Animated container style for horizontal swiping
    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
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
                headerInterpolationStart={60}
            />

            {/* GestureDetector must be direct parent of Animated.ScrollView */}
            <GestureHandlerRootView>
                <GestureDetector gesture={composedGesture}>
                    <Animated.ScrollView
                        onScroll={scrollHandler}
                        showsVerticalScrollIndicator={false}
                        overScrollMode='never'
                        bounces={false}
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
                        {/* Horizontal sliding container */}
                        <Animated.View style={[styles.slidingContainer, animatedContainerStyle]}>
                            {/* Previous Day */}
                            <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                <SwipeableFoodLogContent selectedDate={dates.previous} />
                            </View>

                            {/* Current Day */}
                            <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                <SwipeableFoodLogContent selectedDate={dates.current} />
                            </View>

                            {/* Next Day */}
                            <View style={[styles.dayContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                <SwipeableFoodLogContent selectedDate={dates.next} />
                            </View>
                        </Animated.View>
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
