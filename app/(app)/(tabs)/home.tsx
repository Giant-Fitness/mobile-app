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
import { TrainingProgressCard } from '@/components/progress/TrainingProgressCard';
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
    getAllNutritionLogsAsync,
    getBodyMeasurementsAsync,
    getUserAppSettingsAsync,
    getUserAsync,
    getUserExerciseSetModificationsAsync,
    getUserExerciseSubstitutionsAsync,
    getUserFitnessProfileAsync,
    getUserNutritionGoalHistoryAsync,
    getUserNutritionProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
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
    const [isRefreshing, setIsRefreshing] = useState(false);

    const EXPANDED_HEADER_HEIGHT = Sizes.headerHeight + 40;
    const scrollY = useSharedValue(0);
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Store slices
    const { user, userWeightMeasurements, userRecommendations, userAppSettings, userNutritionGoalHistory } = useSelector((state: RootState) => state.user);

    const { programs } = useSelector((state: RootState) => state.programs);

    const { user: programUser, userProgramProgress, hasCompletedWorkoutToday } = useProgramData();

    // ----- Derived HomeState --------------------------------------------------
    const isOnboardingComplete = useOnboardingStatus();

    const activeNutritionGoal = useMemo(() => {
        return userNutritionGoalHistory?.find((goal) => goal.IsActive) || null;
    }, [userNutritionGoalHistory]);

    const { activeProgram, hasActiveProgram, recommendedProgram, weightGoal } = useMemo(() => {
        const rec = userRecommendations?.RecommendedProgramID ? programs[userRecommendations.RecommendedProgramID] : null;

        const activeId = userProgramProgress?.ProgramId;
        const active = activeId ? programs[activeId] : null;

        return {
            activeProgram: active,
            hasActiveProgram: Boolean(activeId && active),
            recommendedProgram: rec,
            weightGoal: activeNutritionGoal?.WeightGoal ?? null,
        };
    }, [userRecommendations, programs, userProgramProgress, activeNutritionGoal]);

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

    // Updated handleRefresh to use the nutrition log hook's refetch function
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
                    dispatch(getUserProgramProgressAsync({ forceRefresh: true })),
                    dispatch(getUserRecommendationsAsync({ forceRefresh: true })),
                    dispatch(getWorkoutQuoteAsync({ forceRefresh: true })),
                    dispatch(getRestDayQuoteAsync({ forceRefresh: true })),
                    dispatch(getSpotlightWorkoutsAsync({ forceRefresh: true })),
                    dispatch(getAllProgramsAsync({ forceRefresh: true })),
                    dispatch(getWeightMeasurementsAsync({ forceRefresh: true })),
                    dispatch(getUserNutritionGoalHistoryAsync({ forceRefresh: true })),
                    dispatch(initializeTrackedLiftsHistoryAsync({ forceRefresh: true })),
                    dispatch(getUserAppSettingsAsync({ forceRefresh: true })),
                    dispatch(getAllWorkoutsAsync({ forceRefresh: true })),
                    dispatch(getBodyMeasurementsAsync({ forceRefresh: true })),
                    dispatch(getUserExerciseSetModificationsAsync({ forceRefresh: true })),
                    dispatch(getUserExerciseSubstitutionsAsync({ forceRefresh: true })),
                    dispatch(getAllNutritionLogsAsync({ forceRefresh: true })),
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
    }, [dispatch, isRefreshing, user?.UserId, userProgramProgress?.ProgramId, isOnboardingComplete]);

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
            <View style={styles.nutritionCard}>
                <DailyMacrosCard isOnboardingComplete={isOnboardingComplete} nutritionGoal={activeNutritionGoal} />
            </View>
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
                            nutritionGoal={activeNutritionGoal}
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

    const OnboardingSection: React.FC = () => {
        return (
            <View style={styles.onboardingSection}>
                <OnboardingCard key='onboarding' isOnboardingComplete={isOnboardingComplete} />
            </View>
        );
    };

    // ----- Scenario-driven section list --------------------------------------
    const sections = useMemo(() => {
        // Always show FactOfTheDay at the end
        // Scenarios
        if (!isOnboardingComplete) {
            return [<NutritionOverview key='nutrition' />, <OnboardingSection key='onboarding' />, <FactSection key='fact' />];
        }

        // Onboarded + Active program
        if (hasActiveProgram) {
            return [
                activeNutritionGoal ? <NutritionOverview key='nutrition' /> : null,
                <TodaysWorkout key='today' />,
                <ProgressSection key='progress' />,
                <FactSection key='fact' />,
            ].filter(Boolean) as React.ReactElement[];
        }

        // Onboarded, no active program
        return [
            activeNutritionGoal ? <NutritionOverview key='nutrition' /> : null,
            recommendedProgram ? <TrainingProgram key='program' /> : null,
            <ProgressSection key='progress' />,
            <FactSection key='fact' />,
        ].filter(Boolean) as React.ReactElement[];
    }, [isOnboardingComplete, hasActiveProgram, activeNutritionGoal, recommendedProgram, weightGoal, activeProgram, userWeightMeasurements, userAppSettings]);

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
                <ThemedView style={{ backgroundColor: themeColors.backgroundSecondary }}>{sections}</ThemedView>
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
    onboardingSection: {
        marginHorizontal: Spaces.MD,
        marginTop: Spaces.XL,
    },
    nutritionSection: {
        paddingTop: Spaces.MD,
        shadowColor: 'rgba(100, 100, 100, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    factSection: {
        marginBottom: Spaces.XL,
        marginHorizontal: Spaces.MD,
        marginTop: Spaces.LG,
    },
    goalProgressSection: { paddingBottom: Spaces.MD },
    goalProgressCards: { paddingHorizontal: Spaces.MD, gap: Spaces.SM, flexDirection: 'row' },
});
