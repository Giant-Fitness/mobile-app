// app/(app)/workouts/all-workouts.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { WorkoutDetailedCard } from '@/components/workouts/WorkoutDetailedCard';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { WorkoutsBottomBar } from '@/components/workouts/WorkoutsBottomBar';
import { WorkoutsFilterDrawer } from '@/components/workouts/WorkoutsFilterDrawer';
import { WorkoutsSortDrawer } from '@/components/workouts/WorkoutsSortDrawer';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { AppDispatch, RootState } from '@/store/store';
import { getAllWorkoutsAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { Workout } from '@/types';
import { useSplashScreen } from '@/hooks/useSplashScreen';

const MemoizedWorkoutDetailedCard = React.memo(WorkoutDetailedCard);

interface WorkoutFilters extends Record<string, string[]> {
    level: string[];
    equipment: string[];
    focus: string[];
}

export default function AllWorkoutsScreen() {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
    const [sortOption, setSortOption] = useState({ type: 'Length', order: 'Shortest' });

    const { initialFilters } = useLocalSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    const parseInitialFilters = (): WorkoutFilters => {
        if (!initialFilters) return { level: [], equipment: [], focus: [] };

        try {
            const parsedFilters = JSON.parse(initialFilters as string);

            const typedFilters: WorkoutFilters = {
                level: [],
                equipment: [],
                focus: [],
            };

            Object.entries(parsedFilters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    typedFilters[key] = value;
                } else if (typeof value === 'string') {
                    typedFilters[key] = [value];
                }
            });

            return typedFilters;
        } catch (error) {
            console.error('Error parsing initial filters:', error);
            return { level: [], equipment: [], focus: [] };
        }
    };

    const [filters, setFilters] = useState<WorkoutFilters>(parseInitialFilters());
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { workouts, allWorkoutsState } = useSelector((state: RootState) => state.workouts);
    const scrollY = useSharedValue(0);

    const fetchData = useCallback(async () => {
        if (allWorkoutsState !== REQUEST_STATE.FULFILLED) {
            await dispatch(getAllWorkoutsAsync());
        }
    }, [dispatch, workouts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (allWorkoutsState === REQUEST_STATE.FULFILLED) {
            filterAndSortWorkouts(filters, sortOption);
        }
    }, [workouts, filters, sortOption, allWorkoutsState]);

    const handleSortPress = () => {
        setIsSortVisible(true);
    };

    const handleFilterPress = () => {
        setIsFilterVisible(true);
    };

    const applyFilters = (appliedFilters: WorkoutFilters) => {
        setFilters(appliedFilters);
        filterAndSortWorkouts(appliedFilters, sortOption);
    };

    const filterAndSortWorkouts = (appliedFilters: WorkoutFilters, sortOption: { type: string; order: string }) => {
        let filtered = Object.values(workouts);

        // Filtering logic
        if (appliedFilters.level && appliedFilters.level.length > 0) {
            filtered = filtered.filter((workout) => appliedFilters.level!.includes(workout.Level));
        }

        if (appliedFilters.equipment && appliedFilters.equipment.length > 0) {
            filtered = filtered.filter((workout) => appliedFilters.equipment!.includes(workout.EquipmentCategory));
        }

        if (appliedFilters.focus && appliedFilters.focus.length > 0) {
            filtered = filtered.filter((workout) => appliedFilters.focus!.includes(workout.WorkoutCategory));
        }

        // Sorting logic
        if (sortOption.type === 'Length') {
            filtered.sort((a, b) => (sortOption.order === 'Shortest' ? a.Time - b.Time : b.Time - a.Time));
        } else if (sortOption.type === 'Name') {
            filtered.sort((a, b) => (sortOption.order === 'A to Z' ? a.WorkoutName.localeCompare(b.WorkoutName) : b.WorkoutName.localeCompare(a.WorkoutName)));
        }

        setFilteredWorkouts([...filtered]);
    };

    const applySort = (option: { type: string; order: string }) => {
        setSortOption(option);
        filterAndSortWorkouts(filters, option);
    };

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<Workout>) => <MemoizedWorkoutDetailedCard workout={item} source={'library'} />,
        [themeColors.background],
    );

    const keyExtractor = (item: Workout) => item.WorkoutId;

    const { showSplash } = useSplashScreen({
        dataLoadedState: allWorkoutsState,
    });

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const workoutCount = filteredWorkouts.length;
    const workoutLabel = workoutCount === 1 ? 'workout' : 'workouts';
    const activeFilterTypesCount = Object.keys(filters).filter((key) => Array.isArray(filters[key]) && filters[key]!.length > 0).length;

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} title='All Workouts' />
            <ThemedText type='overline' style={[styles.countContainer, { color: themeColors.subText }]}>
                {workoutCount} {workoutLabel}
            </ThemedText>
            <FlatList
                data={filteredWorkouts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                removeClippedSubviews={false} // Set to false to keep items mounted
                maxToRenderPerBatch={20} // Increase this significantly
                updateCellsBatchingPeriod={50} // Decrease to update UI more frequently
                initialNumToRender={10} // Show more items initially
                windowSize={21} // Increase window size (each unit is about 1 viewport height)
                onEndReachedThreshold={0.5}
                contentContainerStyle={[
                    styles.contentContainer,
                    {
                        backgroundColor: themeColors.background,
                        paddingHorizontal: Spaces.MD,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            />
            <WorkoutsBottomBar onSortPress={handleSortPress} onFilterPress={handleFilterPress} appliedFilterCount={activeFilterTypesCount} />
            <WorkoutsFilterDrawer
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApply={applyFilters}
                workouts={Object.values(workouts)}
                initialFilters={filters}
            />
            <WorkoutsSortDrawer visible={isSortVisible} onClose={() => setIsSortVisible(false)} onApply={applySort} initialSort={sortOption} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    countContainer: {
        padding: Spaces.LG,
        paddingVertical: Spaces.MD,
        paddingTop: Sizes.bottomSpaceMedium,
    },
    contentContainer: {
        paddingTop: 0,
        paddingBottom: Sizes.bottomSpaceMedium,
    },
});
