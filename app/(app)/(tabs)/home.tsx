// app/(app)/(tabs)/home.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActionTile } from '@/components/home/ActionTile';
import { FactOfTheDay } from '@/components/home/FactOfTheDay';
import { HomeExpandableHeader } from '@/components/navigation/HomeExpandableHeader';
import { DailyMacrosCard } from '@/components/nutrition/DailyMacrosCard';
import { OnboardingTiles } from '@/components/onboarding/OnboardingTiles';
import { ActiveProgramDayCompressedCard } from '@/components/programs/ActiveProgramDayCompressedCard';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { WorkoutCompletedSection } from '@/components/programs/WorkoutCompletedSection';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
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
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useFocusEffect } from '@react-navigation/native';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
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

    // Header configuration
    const EXPANDED_HEADER_HEIGHT = Sizes.headerHeight + 40;

    // Animated values for header
    const scrollY = useSharedValue(0);

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    const { user, userProgramProgress, hasCompletedWorkoutToday } = useProgramData();
    const { userWeightMeasurements, userSleepMeasurements, userBodyMeasurements, userNutritionProfile, userRecommendations } = useSelector(
        (state: RootState) => state.user,
    );
    const { programs } = useSelector((state: RootState) => state.programs);

    // Get recommended program
    const recommendedProgram = userRecommendations?.RecommendedProgramID ? programs[userRecommendations.RecommendedProgramID] : null;

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

    const isOnboardingComplete = useOnboardingStatus();

    // Scroll handler
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleLogWeight = async (weight: number, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

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
                    ...sleepData,
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

    const renderQuickAddSection = () => {
        return (
            <>
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>Quick Add</ThemedText>
                </View>

                <View style={styles.actionTilesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionTilesScrollContainer}>
                        {actionTiles.map((tile, index) => (
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
        if (!isOnboardingComplete) {
            return (
                <>
                    <OnboardingTiles isOnboardingComplete={isOnboardingComplete} />
                    {renderQuickAddSection()}
                    <FactOfTheDay />
                </>
            );
        }

        if (userProgramProgress?.ProgramId) {
            return (
                <>
                    {userNutritionProfile && (
                        <View style={[styles.nutritionSection, { backgroundColor: themeColors.background }]}>
                            <View style={styles.header}>
                                <ThemedText type='titleLarge'>Nutrition Overview</ThemedText>
                            </View>
                            <View style={styles.nutritionCard}>
                                <DailyMacrosCard userNutritionProfile={userNutritionProfile} />
                            </View>
                        </View>
                    )}

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
                        <View style={styles.todaysWorkoutSection}>
                            <View style={styles.header}>
                                <ThemedText type='titleLarge'>Today&apos;s Workout</ThemedText>
                            </View>
                            <View style={styles.workoutDayCard}>
                                <ActiveProgramDayCompressedCard source={'home'} />
                            </View>
                        </View>
                    )}

                    {renderQuickAddSection()}
                    <FactOfTheDay />
                </>
            );
        }

        // User is onboarded but has no active program
        return (
            <>
                {userNutritionProfile && (
                    <View style={[styles.nutritionSection, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <View style={styles.header}>
                            <ThemedText type='titleLarge'>Nutrition Overview</ThemedText>
                        </View>
                        <View style={styles.nutritionCard}>
                            <DailyMacrosCard userNutritionProfile={userNutritionProfile} />
                        </View>
                    </View>
                )}
                {recommendedProgram && (
                    <View style={[styles.recommendedProgramSection, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <View style={styles.headerWithAction}>
                            <ThemedText type='titleLarge'>Training Program</ThemedText>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    debounce(router, '/(app)/programs/browse-programs');
                                    trigger('soft');
                                }}
                                style={styles.seeAllButton}
                            >
                                <ThemedText type='body' style={[styles.seeAllText, { color: themeColors.iconSelected }]}>
                                    See All
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.workoutDayCard}>
                            <RecommendedProgramCard
                                program={recommendedProgram}
                                compressed={true}
                                onPress={() => {
                                    debounce(router, {
                                        pathname: '/(app)/programs/program-overview',
                                        params: {
                                            programId: recommendedProgram.ProgramId,
                                            source: 'home-recommended-program',
                                        },
                                    });
                                    trigger('impactLight');
                                }}
                            />
                        </View>
                    </View>
                )}

                {renderQuickAddSection()}

                <FactOfTheDay />
            </>
        );
    };

    // Generate greeting text
    const greeting = user?.FirstName ? `Hi, ${user.FirstName}!` : 'Hi!';

    return (
        <View style={styles.container}>
            {/* Home-specific expandable header */}
            <HomeExpandableHeader scrollY={scrollY} greeting={greeting} expandedHeight={EXPANDED_HEADER_HEIGHT} />

            {/* Scrollable Content */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.iconSelected]}
                        tintColor={themeColors.iconSelected}
                        progressViewOffset={EXPANDED_HEADER_HEIGHT} // Position refresh control properly
                    />
                }
                style={[styles.scrollView, { backgroundColor: themeColors.backgroundSecondary }]}
                contentContainerStyle={{
                    paddingTop: EXPANDED_HEADER_HEIGHT, // Match expanded height
                }}
            >
                <ThemedView style={{ backgroundColor: themeColors.backgroundSecondary }}>
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
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    headerWithAction: {
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    seeAllButton: {
        paddingVertical: Spaces.XS,
        paddingHorizontal: Spaces.XS,
    },
    seeAllText: {
        textDecorationLine: 'underline',
    },
    workoutDayCard: {
        paddingHorizontal: Spaces.LG,
    },
    nutritionCard: {
        paddingHorizontal: Spaces.LG,
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
    recommendedProgramSection: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    todaysWorkoutSection: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    nutritionSection: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.LG,
    },
});
