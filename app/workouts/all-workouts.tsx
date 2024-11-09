// app/workouts/all-workouts.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

type RouteParams = {
    initialFilters?: Record<string, any>;
};

const MemoizedWorkoutDetailedCard = React.memo(WorkoutDetailedCard);

export default function AllWorkoutsScreen() {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
    const [sortOption, setSortOption] = useState({ type: 'Length', order: 'Shortest' });

    const navigation = useNavigation();
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
    const dispatch = useDispatch<AppDispatch>();

    const { initialFilters } = route.params || {};
    const [filters, setFilters] = useState(initialFilters || {});

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
        // Set up navigation options immediately
        const setNavOptions = () => {
            navigation.setOptions({
                headerShown: false,
            });
        };

        // Run immediately and after a small delay
        setNavOptions();
        const navTimer = setTimeout(setNavOptions, 0);

        // Fetch data after navigation options are set
        fetchData();

        // Cleanup
        return () => {
            clearTimeout(navTimer);
            // Optional: restore header on unmount
            navigation.setOptions({
                headerShown: true,
            });
        };
    }, [navigation, fetchData]);
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

    const applyFilters = (appliedFilters: any) => {
        setFilters(appliedFilters);
        filterAndSortWorkouts(appliedFilters, sortOption);
    };

    const filterAndSortWorkouts = (appliedFilters: any, sortOption: { type: string; order: string }) => {
        let filtered = Object.values(workouts);

        // Filtering logic
        if (appliedFilters.level?.length) {
            filtered = filtered.filter((workout) => appliedFilters.level.includes(workout.Level));
        }
        if (appliedFilters.equipment?.length) {
            filtered = filtered.filter((workout) => appliedFilters.equipment.includes(workout.EquipmentCategory));
        }
        if (appliedFilters.focus?.length) {
            filtered = filtered.filter((workout) => appliedFilters.focus.includes(workout.WorkoutCategory));
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

    const renderItem = useCallback(({ item }: ListRenderItemInfo<Workout>) => <MemoizedWorkoutDetailedCard workout={item} />, [themeColors.card]);

    const keyExtractor = (item: Workout) => item.WorkoutId;

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: allWorkoutsState,
    });

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const workoutCount = filteredWorkouts.length;
    const workoutLabel = workoutCount === 1 ? 'workout' : 'workouts';
    const activeFilterTypesCount = Object.keys(filters).filter((key) => filters[key].length > 0).length;

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
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={5}
                windowSize={10}
                contentContainerStyle={[styles.contentContainer, { backgroundColor: themeColors.background, paddingHorizontal: Spaces.MD }]}
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
