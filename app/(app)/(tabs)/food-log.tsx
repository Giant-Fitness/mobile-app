// app/(app)/(tabs)/food-log.tsx

import { FoodLogContent } from '@/components/nutrition/FoodLogContent';
import { FoodLogHeader } from '@/components/nutrition/FoodLogHeader';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { DatePickerBottomSheet } from '@/components/overlays/DatePickerBottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { addAlpha } from '@/utils/colorUtils';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';

import { useFocusEffect } from '@react-navigation/native';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

const useOnboardingStatus = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return Boolean(user?.OnboardingComplete);
};

export default function FoodLogScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const isOnboardingComplete = useOnboardingStatus();

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Optimized scroll handler for smooth performance
    const scrollHandler = useAnimatedScrollHandler(
        {
            onScroll: (event) => {
                'worklet';
                scrollY.value = event.contentOffset.y;
            },
        },
        [], // Empty dependency array for better performance
    );

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
        // Calculate header heights
        const baseHeaderHeight =
            Platform.select({
                ios: 44,
                android: 24,
            }) || 44;

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

    const OnboardingOverlay = () => (
        <BlurView intensity={12} tint={colorScheme} style={styles.onboardingOverlay}>
            {/* Semi-transparent overlay to mute the background colors */}
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

            <Animated.ScrollView
                onScroll={scrollHandler}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                bounces={false} // Disable iOS bounce for more predictable behavior
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.iconSelected]}
                        tintColor={themeColors.iconSelected}
                        progressViewOffset={expandedHeaderHeight} // Use expanded height for refresh control
                    />
                }
                style={[styles.scrollView, { backgroundColor: themeColors.backgroundSecondary }]}
                contentContainerStyle={{
                    paddingTop: expandedHeaderHeight + Spaces.MD, // Use expanded height so content starts below full header
                }}
            >
                {/* Food Log Content */}
                <FoodLogContent selectedDate={selectedDate} />
            </Animated.ScrollView>

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
