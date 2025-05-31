// app/(app)/(tabs)/home.tsx

import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Platform, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/base/ThemedText';
import { ActiveProgramDayCompressedCard } from '@/components/programs/ActiveProgramDayCompressedCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useProgramData } from '@/hooks/useProgramData';
import { ActionTile } from '@/components/home/ActionTile';
import { LargeActionTile } from '@/components/home/LargeActionTile';
import { FactOfTheDay } from '@/components/home/FactOfTheDay';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import {
    logWeightMeasurementAsync,
    getWeightMeasurementsAsync,
    getSleepMeasurementsAsync,
    logSleepMeasurementAsync,
    getUserAsync,
    getUserFitnessProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    deleteSleepMeasurementAsync,
    deleteWeightMeasurementAsync,
    getBodyMeasurementsAsync,
    logBodyMeasurementAsync,
    deleteBodyMeasurementAsync,
} from '@/store/user/thunks';
import { AppDispatch, RootState } from '@/store/store';
import { WorkoutCompletedSection } from '@/components/programs/WorkoutCompletedSection';
import { router } from 'expo-router';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { getSpotlightWorkoutsAsync, getAllWorkoutsAsync } from '@/store/workouts/thunks';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';
import { getUserAppSettingsAsync } from '@/store/user/thunks';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { ScrollView } from 'react-native';
import { debounce } from '@/utils/debounce';
import { ThemedView } from '@/components/base/ThemedView';

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
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { user, userProgramProgress, hasCompletedWorkoutToday } = useProgramData();
    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);
    const { userSleepMeasurements } = useSelector((state: RootState) => state.user);
    const { userBodyMeasurements } = useSelector((state: RootState) => state.user);

    const isFitnessOnboardingComplete = user?.OnboardingStatus?.fitness === true;

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

        try {
            await dispatch(getUserAsync());
            if (user?.UserId) {
                await Promise.all([
                    dispatch(getUserAsync({ forceRefresh: true })),
                    dispatch(getUserFitnessProfileAsync({ forceRefresh: true })),
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

    const renderForYouSection = (reorderTiles = false) => {
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

                    {renderForYouSection()}
                    <FactOfTheDay />
                </>
            );
        }

        // State 2: No active program but completed onboarding
        if (isFitnessOnboardingComplete) {
            return (
                <>
                    <View style={styles.greeting}>
                        <ThemedText type='greeting'>{greeting}</ThemedText>
                    </View>

                    <LargeActionTile
                        title='Start Training'
                        description='Our structured training plans turn your goals into achievements'
                        onPress={() => debounce(router, '/(app)/programs/browse-programs')}
                        backgroundColor={themeColors.containerHighlight}
                        image={require('@/assets/images/fist.png')}
                        textColor={themeColors.highlightContainerText}
                    />

                    {renderForYouSection()}

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

                <LargeActionTile
                    title='Get Started'
                    description='Let us recommend a training plan tailored to your goals'
                    onPress={() => debounce(router, '/(app)/programs/program-recommender-wizard')}
                    backgroundColor={themeColors.containerHighlight}
                    image={require('@/assets/images/nutrition.png')}
                    textColor={themeColors.highlightContainerText}
                />

                {renderForYouSection(true)}

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
            style={{ ...styles.container }}
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
                marginTop: Spaces.LG,
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
