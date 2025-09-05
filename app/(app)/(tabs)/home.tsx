// app/(app)/(tabs)/home.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FactOfTheDay } from '@/components/home/FactOfTheDay';
import { HomeExpandableHeader } from '@/components/navigation/HomeExpandableHeader';
import { DailyMacrosCard } from '@/components/nutrition/DailyMacrosCard';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { ActiveProgramDayCompressedCard } from '@/components/programs/ActiveProgramDayCompressedCard';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { WorkoutCompletedCard } from '@/components/programs/WorkoutCompletedCard';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { TrainingProgressCard } from '@/components/progress/TrainingProgressCard';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { WeightProgressCard } from '@/components/progress/WeightProgressCard';
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
import { debounce } from '@/utils/debounce';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    // Theme
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // State / refs
    const dispatch = useDispatch<AppDispatch>();
    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isSleepSheetVisible, setIsSleepSheetVisible] = useState(false);
    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const EXPANDED_HEADER_HEIGHT = Sizes.headerHeight + 40;
    const scrollY = useSharedValue(0);
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Store slices
    const { user, userWeightMeasurements, userSleepMeasurements, userBodyMeasurements, userNutritionProfile, userRecommendations, userAppSettings } =
        useSelector((state: RootState) => state.user);
    const { programs } = useSelector((state: RootState) => state.programs);

    const { user: programUser, userProgramProgress, hasCompletedWorkoutToday } = useProgramData();

    // ----- Derived HomeState --------------------------------------------------
    const isOnboardingComplete = useOnboardingStatus();

    const { activeProgram, hasActiveProgram, recommendedProgram, weightGoal } = useMemo(() => {
        const rec = userRecommendations?.RecommendedProgramID ? programs[userRecommendations.RecommendedProgramID] : null;

        const activeId = userProgramProgress?.ProgramId;
        const active = activeId ? programs[activeId] : null;

        return {
            activeProgram: active,
            hasActiveProgram: Boolean(activeId && active),
            recommendedProgram: rec,
            weightGoal: userNutritionProfile?.WeightGoal ?? null,
        };
    }, [userRecommendations, programs, userProgramProgress, userNutritionProfile]);

    // Greeting
    const greeting = programUser?.FirstName ? `Hi, ${programUser.FirstName}!` : 'Hi!';

    // ----- Scroll handler -----------------------------------------------------
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // ----- Lifecycle: focus cleanup for refresh control ----------------------
    useFocusEffect(
        useCallback(() => {
            isMountedAndFocused.current = true;
            return () => {
                isMountedAndFocused.current = false;
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
                if (isRefreshing) setIsRefreshing(false);
            };
        }, [isRefreshing]),
    );

    // ----- Handlers: Log & Delete -------------------------------------------
    const handleLogWeight = useCallback(
        async (weight: number, date: Date) => {
            setIsLoading(true);
            try {
                await dispatch(logWeightMeasurementAsync({ weight, measurementTimestamp: date.toISOString() })).unwrap();
                await dispatch(getWeightMeasurementsAsync()).unwrap();
            } catch (e) {
                console.error('Failed to log weight:', e);
            } finally {
                if (isMountedAndFocused.current) setIsLoading(false);
            }
        },
        [dispatch],
    );

    const handleLogSleep = useCallback(
        async (sleepData: any, date: Date) => {
            setIsLoading(true);
            try {
                await dispatch(logSleepMeasurementAsync({ ...sleepData, measurementTimestamp: date.toISOString() })).unwrap();
                await dispatch(getSleepMeasurementsAsync()).unwrap();
            } catch (e) {
                console.error('Failed to log sleep:', e);
            } finally {
                if (isMountedAndFocused.current) setIsLoading(false);
            }
        },
        [dispatch],
    );

    const handleLogBodyMeasurements = useCallback(
        async (measurements: Record<string, number>, date: Date) => {
            setIsLoading(true);
            try {
                await dispatch(logBodyMeasurementAsync({ measurements, measurementTimestamp: date.toISOString() })).unwrap();
                await dispatch(getBodyMeasurementsAsync()).unwrap();
            } catch (e) {
                console.error('Failed to log body measurements:', e);
            } finally {
                if (isMountedAndFocused.current) setIsLoading(false);
            }
        },
        [dispatch],
    );

    const handleWeightDelete = useCallback(
        async (timestamp: string) => {
            try {
                await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
                setIsWeightSheetVisible(false);
            } catch (e) {
                console.error('Failed to delete weight:', e);
            }
        },
        [dispatch],
    );

    const handleSleepDelete = useCallback(
        async (timestamp: string) => {
            try {
                await dispatch(deleteSleepMeasurementAsync({ timestamp })).unwrap();
                setIsSleepSheetVisible(false);
            } catch (e) {
                console.error('Failed to delete sleep:', e);
            }
        },
        [dispatch],
    );

    const handleBodyMeasurementsDelete = useCallback(
        async (timestamp: string) => {
            try {
                await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
                setIsBodyMeasurementsSheetVisible(false);
            } catch (e) {
                console.error('Failed to delete body measurements:', e);
            }
        },
        [dispatch],
    );

    // ----- Utilities ----------------------------------------------------------
    const getExistingWeightData = useCallback(
        (date: Date) => {
            return userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
        },
        [userWeightMeasurements],
    );

    const getExistingSleepData = useCallback(
        (date: Date) => {
            return userSleepMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
        },
        [userSleepMeasurements],
    );

    const getExistingBodyMeasurementsData = useCallback(
        (date: Date) => {
            return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
        },
        [userBodyMeasurements],
    );

    const handleRefresh = useCallback(async () => {
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
        } catch (e) {
            console.error('Refresh failed:', e);
        } finally {
            refreshTimeoutRef.current = setTimeout(() => {
                if (isMountedAndFocused.current) setIsRefreshing(false);
                refreshTimeoutRef.current = null;
            }, 200);
        }
    }, [dispatch, isRefreshing, user?.UserId, userProgramProgress?.ProgramId]);

    // ----- Section Components -------------------------------------------------
    const SectionHeader: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
        <View style={styles.headerWithAction}>
            <ThemedText type='titleLarge'>{title}</ThemedText>
            {right ? right : null}
        </View>
    );

    const NutritionOverview: React.FC = () => (
        <View style={[styles.nutritionSection, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <ThemedText type='titleLarge'>Nutrition Overview</ThemedText>
            </View>
            <View style={styles.nutritionCard}>{userNutritionProfile ? <DailyMacrosCard userNutritionProfile={userNutritionProfile} /> : null}</View>
        </View>
    );

    const TodaysWorkout: React.FC = () => (
        <View style={styles.todaysWorkoutSection}>
            <View style={styles.header}>
                <ThemedText type='titleLarge'>Today&apos;s Workout</ThemedText>
            </View>
            <View style={styles.workoutDayCard}>
                {hasCompletedWorkoutToday ? (
                    <WorkoutCompletedCard
                        onBrowseSolos={() =>
                            debounce(router, {
                                pathname: '/(app)/workouts/all-workouts',
                                params: { source: 'home-program-day-completed-tile' },
                            })
                        }
                    />
                ) : (
                    <ActiveProgramDayCompressedCard source={'home'} />
                )}
            </View>
        </View>
    );

    const FactSection: React.FC = () => (
        <View style={styles.factSection}>
            <FactOfTheDay key='fact' />
        </View>
    );

    const TrainingProgram: React.FC = () => (
        <View style={[styles.recommendedProgramSection, { backgroundColor: themeColors.backgroundSecondary }]}>
            <SectionHeader
                title='Training Program'
                right={
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
                }
            />
            <View style={styles.workoutDayCard}>
                {recommendedProgram ? (
                    <RecommendedProgramCard
                        program={recommendedProgram}
                        compressed
                        onPress={() => {
                            debounce(router, {
                                pathname: '/(app)/programs/program-overview',
                                params: { programId: recommendedProgram.ProgramId, source: 'home-recommended-program' },
                            });
                            trigger('impactLight');
                        }}
                    />
                ) : null}
            </View>
        </View>
    );

    const ProgressSection: React.FC = () => {
        const showWeight = Boolean(weightGoal);
        const showTraining = hasActiveProgram && activeProgram;
        if (!showWeight && !showTraining) return null;

        return (
            <View style={[styles.goalProgressSection, { backgroundColor: themeColors.backgroundSecondary }]}>
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>Progress</ThemedText>
                </View>
                <View style={styles.goalProgressCards}>
                    {showWeight && (
                        <WeightProgressCard
                            userNutritionProfile={userNutritionProfile!}
                            userWeightMeasurements={userWeightMeasurements}
                            weightUnit={userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits || 'lbs'}
                            onPress={() => debounce(router, '/(app)/progress/weight')}
                        />
                    )}
                    {showTraining && (
                        <TrainingProgressCard
                            activeProgram={activeProgram!}
                            userProgramProgress={userProgramProgress!}
                            onPress={() => debounce(router, '/(app)/programs/active-program-progress')}
                        />
                    )}
                </View>
            </View>
        );
    };

    // ----- Scenario-driven section list --------------------------------------
    const sections = useMemo(() => {
        // Always show FactOfTheDay at the end
        // Scenarios
        if (!isOnboardingComplete) {
            return [<OnboardingCard key='onboarding' isOnboardingComplete={isOnboardingComplete} />, <FactSection key='fact' />];
        }

        // Onboarded + Active program
        if (hasActiveProgram) {
            return [
                userNutritionProfile ? <NutritionOverview key='nutrition' /> : null,
                <TodaysWorkout key='today' />,
                <ProgressSection key='progress' />,
                <FactSection key='fact' />,
            ].filter(Boolean) as React.ReactElement[];
        }

        // Onboarded, no active program
        return [
            userNutritionProfile ? <NutritionOverview key='nutrition' /> : null,
            recommendedProgram ? <TrainingProgram key='program' /> : null,
            <ProgressSection key='progress' />,
            <FactSection key='fact' />,
        ].filter(Boolean) as React.ReactElement[];
    }, [isOnboardingComplete, hasActiveProgram, userNutritionProfile, recommendedProgram, weightGoal, activeProgram]);

    return (
        <View style={styles.container}>
            <HomeExpandableHeader scrollY={scrollY} greeting={greeting} expandedHeight={EXPANDED_HEADER_HEIGHT} />

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
                        progressViewOffset={EXPANDED_HEADER_HEIGHT}
                    />
                }
                style={[styles.scrollView, { backgroundColor: themeColors.backgroundSecondary }]}
                contentContainerStyle={{ paddingTop: EXPANDED_HEADER_HEIGHT }}
            >
                <ThemedView style={{ backgroundColor: themeColors.backgroundSecondary }}>
                    {sections}

                    {/* Sheets */}
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
    container: { flex: 1 },
    scrollView: { flex: 1 },
    header: { paddingHorizontal: Spaces.MD, marginBottom: Spaces.SM },
    headerWithAction: {
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.SM,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    seeAllButton: { paddingVertical: Spaces.XS, paddingHorizontal: Spaces.XS },
    seeAllText: { textDecorationLine: 'underline' },
    workoutDayCard: { paddingHorizontal: Spaces.MD },
    nutritionCard: {},
    actionTilesContainer: { paddingVertical: Spaces.XS, flexDirection: 'row' },
    actionTilesScrollContainer: {
        paddingLeft: Spaces.MD,
        paddingRight: Spaces.MD,
        paddingVertical: Spaces.XS,
        flexDirection: 'row',
    },
    recommendedProgramSection: { paddingTop: Spaces.LG, paddingBottom: Spaces.XL },
    todaysWorkoutSection: { paddingTop: Spaces.LG, paddingBottom: Spaces.XL },
    nutritionSection: {
        paddingTop: Spaces.MD,
        shadowColor: 'rgba(100, 100, 100, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    factSection: {
        marginHorizontal: Spaces.MD,
        marginBottom: Spaces.XL,
        marginTop: Spaces.LG,
    },
    goalProgressSection: { paddingBottom: Spaces.MD },
    goalProgressCards: { paddingHorizontal: Spaces.MD, gap: Spaces.SM, flexDirection: 'row' },
});
