// app/(app)/(tabs)/home.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActionTile } from '@/components/home/ActionTile';
import { FactOfTheDay } from '@/components/home/FactOfTheDay';
import { LargeActionTile } from '@/components/home/LargeActionTile';
import { OnboardingTiles } from '@/components/onboarding/OnboardingTiles';
import { ActiveProgramDayCompressedCard } from '@/components/programs/ActiveProgramDayCompressedCard';
import { WorkoutCompletedSection } from '@/components/programs/WorkoutCompletedSection';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProgramData } from '@/hooks/useProgramData';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getRestDayQuoteAsync, getWorkoutQuoteAsync } from '@/store/quotes/thunks';
import { AppDispatch, RootState } from '@/store/store';
import {
    deleteBodyMeasurementAsync,
    deleteSleepMeasurementAsync,
    deleteWeightMeasurementAsync,
    getBodyMeasurementsAsync,
    getSleepMeasurementsAsync,
    getUserAppSettingsAsync,
    getUserAsync,
    getUserExerciseSetModificationsAsync,
    getUserExerciseSubstitutionsAsync,
    getUserFitnessProfileAsync,
    getUserNutritionPreferencesAsync,
    getUserNutritionProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
    logBodyMeasurementAsync,
    logSleepMeasurementAsync,
    logWeightMeasurementAsync,
} from '@/store/user/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { useFocusEffect } from '@react-navigation/native';

import { trigger } from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';

const useOnboardingStatus = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return Boolean(user?.OnboardingComplete);
};

export default function HomeScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();

    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isSleepSheetVisible, setIsSleepSheetVisible] = useState(false);
    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    const { user, userProgramProgress, hasCompletedWorkoutToday } = useProgramData();
    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);
    const { userSleepMeasurements } = useSelector((state: RootState) => state.user);
    const { userBodyMeasurements } = useSelector((state: RootState) => state.user);

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

    const isOnboardingComplete = useOnboardingStatus();

    const handleLogWeight = async (weight: number, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            // Refresh measurements after logging
            await dispatch(getWeightMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log weight:', error);
        } finally {
            if (isMountedAndFocused.current) {
                setIsLoading(false);
            }
        }
    };

    const handleLogSleep = async (sleepData: any, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logSleepMeasurementAsync({
                    ...sleepData, // This will contain either {durationInMinutes} or {sleepTime, wakeTime}
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            await dispatch(getSleepMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log sleep:', error);
        } finally {
            if (isMountedAndFocused.current) {
                setIsLoading(false);
            }
        }
    };

    const handleLogBodyMeasurements = async (measurements: Record<string, number>, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logBodyMeasurementAsync({
                    measurements,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            // Refresh measurements after logging
            await dispatch(getBodyMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log body measurements:', error);
        } finally {
            if (isMountedAndFocused.current) {
                setIsLoading(false);
            }
        }
    };

    const handleWeightTilePress = () => {
        setIsWeightSheetVisible(true);
    };

    const handleSleepTilePress = () => {
        setIsSleepSheetVisible(true);
    };

    const handleBodyMeasurementsTilePress = () => {
        setIsBodyMeasurementsSheetVisible(true);
    };

    const getExistingWeightData = (date: Date) => {
        return userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const getExistingSleepData = (date: Date) => {
        return userSleepMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const getExistingBodyMeasurementsData = (date: Date) => {
        return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const handleRefresh = async () => {
        // Prevent multiple simultaneous refreshes
        if (isRefreshing) return;

        setIsRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await dispatch(getUserAsync());
            if (user?.UserId) {
                await Promise.all([
                    dispatch(getUserAsync({ forceRefresh: true })),
                    dispatch(getUserFitnessProfileAsync({ forceRefresh: true })),
                    dispatch(getUserNutritionProfileAsync({ forceRefresh: true })),
                    dispatch(getUserNutritionPreferencesAsync({ forceRefresh: true })),
                    dispatch(getUserProgramProgressAsync({ forceRefresh: true })),
                    dispatch(getUserRecommendationsAsync({ forceRefresh: true })),
                    dispatch(getWorkoutQuoteAsync({ forceRefresh: true })),
                    dispatch(getRestDayQuoteAsync({ forceRefresh: true })),
                    dispatch(getSpotlightWorkoutsAsync({ forceRefresh: true })),
                    dispatch(getAllProgramsAsync({ forceRefresh: true })),
                    dispatch(getWeightMeasurementsAsync({ forceRefresh: true })),
                    dispatch(getSleepMeasurementsAsync({ forceRefresh: true })),
                    dispatch(initializeTrackedLiftsHistoryAsync({ forceRefresh: true })),
                    dispatch(getUserAppSettingsAsync({ forceRefresh: true })),
                    dispatch(getAllWorkoutsAsync({ forceRefresh: true })),
                    dispatch(getBodyMeasurementsAsync({ forceRefresh: true })),
                    dispatch(getUserExerciseSetModificationsAsync({ forceRefresh: true })),
                    dispatch(getUserExerciseSubstitutionsAsync({ forceRefresh: true })),
                ]);
                if (userProgramProgress?.ProgramId) {
                    await dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId, forceRefresh: true }));
                }
            }
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

    const handleWeightDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
            setIsWeightSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete weight:', error);
        }
    };

    const handleSleepDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteSleepMeasurementAsync({ timestamp })).unwrap();
            setIsSleepSheetVisible(false);
        } catch (err) {
            console.error('Failed to delete sleep:', err);
        }
    };

    const handleBodyMeasurementsDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete body measurements:', error);
        }
    };

    const actionTiles = [
        {
            title: 'Track Weight',
            image: require('@/assets/images/weight.png'),
            onPress: handleWeightTilePress,
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.7),
            textColor: darkenColor(themeColors.tangerineSolid, 0.2),
        },
        {
            title: 'Track Waist',
            image: require('@/assets/images/measure.png'),
            onPress: handleBodyMeasurementsTilePress,
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.7),
            textColor: darkenColor(themeColors.tangerineSolid, 0.2),
        },
        {
            title: 'Track Sleep',
            image: require('@/assets/images/sleep_clock.png'),
            onPress: handleSleepTilePress,
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.7),
            textColor: darkenColor(themeColors.tangerineSolid, 0.2),
        },
    ];

    const renderQuickAddSection = (reorderTiles = false) => {
        let tiles = [...actionTiles];

        if (reorderTiles) {
            // Find the app info tile index
            const appInfoIndex = tiles.findIndex((tile) => tile.title === 'Is Kyn for you?');
            if (appInfoIndex !== -1) {
                // Remove and store the app info tile
                const [appInfoTile] = tiles.splice(appInfoIndex, 1);
                // Add it to the beginning
                tiles.unshift(appInfoTile);
            }
        }

        return (
            <>
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>Quick Add</ThemedText>
                </View>

                <View style={styles.actionTilesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionTilesScrollContainer}>
                        {tiles.map((tile, index) => (
                            <ActionTile
                                key={index}
                                image={tile.image}
                                title={tile.title}
                                onPress={tile.onPress}
                                backgroundColor={tile.backgroundColor}
                                textColor={tile.textColor}
                                style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: tile.textColor }}
                                showChevron={true}
                            />
                        ))}
                    </ScrollView>
                </View>
            </>
        );
    };

    const renderContent = () => {
        const greeting = user?.FirstName ? `Hi, ${user.FirstName}!` : 'Hi!';

        // State 1: Has active program (highest priority)
        if (userProgramProgress?.ProgramId) {
            return (
                <>
                    <View style={styles.greeting}>
                        <ThemedText type='greeting'>{greeting}</ThemedText>
                    </View>

                    <OnboardingTiles isOnboardingComplete={isOnboardingComplete} />

                    {hasCompletedWorkoutToday ? (
                        <WorkoutCompletedSection
                            onBrowseSolos={() =>
                                debounce(router, {
                                    pathname: '/(app)/workouts/all-workouts',
                                    params: {
                                        source: 'home-program-day-completed-tile',
                                    },
                                })
                            }
                        />
                    ) : (
                        <>
                            <View style={styles.header}>
                                <ThemedText type='titleLarge'>Today&apos;s Workout</ThemedText>
                            </View>
                            <View style={styles.workoutDayCard}>
                                <ActiveProgramDayCompressedCard source={'home'} />
                            </View>
                        </>
                    )}

                    {renderQuickAddSection()}
                    <FactOfTheDay />
                </>
            );
        }

        // State 2: No active program but completed onboarding
        if (isOnboardingComplete) {
            return (
                <>
                    <View style={styles.greeting}>
                        <ThemedText type='greeting'>{greeting}</ThemedText>
                    </View>

                    <LargeActionTile
                        title='Begin Training'
                        description='Your recommended plan is ready to turn your goals into achievements'
                        onPress={() => {
                            debounce(router, '/(app)/programs/browse-programs');
                            trigger('soft');
                        }}
                        backgroundColor={themeColors.containerHighlight}
                        image={require('@/assets/images/fist.png')}
                        textColor={themeColors.highlightContainerText}
                    />

                    {renderQuickAddSection()}

                    <FactOfTheDay />
                </>
            );
        }

        // State 3: No active program and no onboarding (lowest priority)
        return (
            <>
                <View style={styles.greeting}>
                    <ThemedText type='greeting'>{greeting}</ThemedText>
                </View>

                <OnboardingTiles isOnboardingComplete={isOnboardingComplete} />

                {renderQuickAddSection(true)}

                <FactOfTheDay />
            </>
        );
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode='never'
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[themeColors.iconSelected]} tintColor={themeColors.iconSelected} />
            }
            style={[styles.container, { backgroundColor: themeColors.background }]}
        >
            <ThemedView style={{ paddingBottom: Spaces.SM }}>
                {renderContent()}

                <WeightLoggingSheet
                    visible={isWeightSheetVisible}
                    onClose={() => setIsWeightSheetVisible(false)}
                    onSubmit={handleLogWeight}
                    onDelete={handleWeightDelete}
                    isLoading={isLoading}
                    getExistingData={getExistingWeightData}
                />

                <SleepLoggingSheet
                    visible={isSleepSheetVisible}
                    onClose={() => setIsSleepSheetVisible(false)}
                    onSubmit={handleLogSleep}
                    onDelete={handleSleepDelete}
                    getExistingData={getExistingSleepData}
                />

                <BodyMeasurementsLoggingSheet
                    visible={isBodyMeasurementsSheetVisible}
                    onClose={() => setIsBodyMeasurementsSheetVisible(false)}
                    onSubmit={handleLogBodyMeasurements}
                    onDelete={handleBodyMeasurementsDelete}
                    isLoading={isLoading}
                    getExistingData={getExistingBodyMeasurementsData}
                />
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    greeting: {
        ...Platform.select({
            ios: {
                marginTop: Spaces.SM,
            },
            android: {
                marginTop: Spaces.SM,
            },
        }),
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.LG,
    },
    header: {
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    workoutDayCard: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    divider: {
        width: '90%',
        alignSelf: 'center',
    },
    actionTilesContainer: {
        paddingVertical: Spaces.XS,
        flexDirection: 'row',
    },
    actionTilesScrollContainer: {
        paddingLeft: Spaces.LG,
        paddingRight: Spaces.MD,
        paddingVertical: Spaces.XS,
        flexDirection: 'row',
    },
    actionTile: {
        marginRight: Spaces.MD,
    },
});
