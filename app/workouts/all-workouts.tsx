// app/workouts/all-workouts.tsx

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { WorkoutDetailedCard } from '@/components/workouts/WorkoutDetailedCard';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { WorkoutsBottomBar } from '@/components/workouts/WorkoutsBottomBar';
import { CustomBackButton } from '@/components/base/CustomBackButton';
import { WorkoutsFilterDrawer } from '@/components/workouts/WorkoutsFilterDrawer';
import { WorkoutsSortDrawer } from '@/components/workouts/WorkoutsSortDrawer';

const workouts = [
    {
        id: '1',
        name: 'Full Body Workout',
        photo: require('@/assets/images/vb.webp'),
        length: '45 mins',
        level: 'Advanced',
        equipment: 'Kettlebells',
        focus: 'Strength',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '2',
        name: 'Cardio Blast',
        photo: require('@/assets/images/vb.webp'),
        length: '30 mins',
        level: 'Intermediate',
        equipment: 'Kettlebells',
        focus: 'Endurance',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '3',
        name: 'Morning Flexibility',
        photo: require('@/assets/images/vb.webp'),
        length: '20 mins',
        level: 'Beginner',
        equipment: 'None',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '4',
        name: 'Tank Top Arms',
        photo: require('@/assets/images/vb.webp'),
        length: '30 mins',
        level: 'Advanced',
        equipment: 'Dumbbells',
        focus: 'Strength',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '5',
        name: '5 minute Calming Breath',
        photo: require('@/assets/images/vb.webp'),
        length: '5 mins',
        level: 'Beginner',
        equipment: 'None',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    // fetch from the backend. caching?
];

export default function AllWorkoutsScreen() {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);
    const [sortOption, setSortOption] = useState({ type: 'Length', order: 'Shortest' });

    const navigation = useNavigation();
    const route = useRoute();

    const { initialFilters } = route.params || {}; // Get initial filters from route parameters
    const [filters, setFilters] = useState(initialFilters || {});

    const handleSortPress = () => {
        setIsSortVisible(true);
    };

    const handleFilterPress = () => {
        setIsFilterVisible(true);
    };

    const applyFilters = (appliedFilters: any) => {
        setFilters(appliedFilters);
        filterAndSortWorkouts(appliedFilters, sortOption); // Call combined filtering and sorting
    };

    const filterAndSortWorkouts = (appliedFilters: any, sortOption: { type: string; order: string }) => {
        let filtered = workouts;

        // Filtering logic
        if (appliedFilters.level?.length) {
            filtered = filtered.filter((workout) => appliedFilters.level.includes(workout.level));
        }
        if (appliedFilters.equipment?.length) {
            filtered = filtered.filter((workout) => appliedFilters.equipment.includes(workout.equipment));
        }
        if (appliedFilters.focus?.length) {
            filtered = filtered.filter((workout) => appliedFilters.focus.includes(workout.focus));
        }

        // Sorting logic
        const parseLength = (length: string) => parseInt(length.replace(/\D/g, ''), 10);

        if (sortOption.type === 'Length') {
            filtered.sort((a, b) =>
                sortOption.order === 'Shortest' ? parseLength(a.length) - parseLength(b.length) : parseLength(b.length) - parseLength(a.length),
            );
        } else if (sortOption.type === 'Name') {
            filtered.sort((a, b) => (sortOption.order === 'A to Z' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
        }

        setFilteredWorkouts([...filtered]); // Update state with new sorted array
    };

    const applySort = (option: { type: string; order: string }) => {
        setSortOption(option);
        filterAndSortWorkouts(filters, option); // Apply sorting with current filters
    };

    useEffect(() => {
        // Initialize filters and apply sorting
        if (Object.keys(initialFilters).length > 0) {
            setFilters(initialFilters);
            filterAndSortWorkouts(initialFilters, sortOption); // Apply both filtering and sorting initially
        } else {
            filterAndSortWorkouts({}, sortOption); // Apply sorting with empty filters to trigger initial sort
        }
    }, [initialFilters]);

    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        navigation.setOptions({
            title: 'All Workouts',
            headerBackTitleVisible: false, // Hide the back button label
            headerStyle: {
                backgroundColor: themeColors.background,
            },
            headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
            headerLeft: () => <CustomBackButton />,
        });
    }, [navigation, themeColors]);

    // Determine the correct label for workout count
    const workoutCount = filteredWorkouts.length;
    const workoutLabel = workoutCount === 1 ? 'workout' : 'workouts';

    // Count the number of filter types with active filters
    const activeFilterTypesCount = Object.keys(filters).filter((key) => filters[key].length > 0).length;

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <ThemedText type='overline' style={[styles.countContainer, { color: themeColors.subText }]}>
                {workoutCount} {workoutLabel}
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.background }]}>
                    {filteredWorkouts.map((workout) => (
                        <WorkoutDetailedCard
                            key={workout.id}
                            name={workout.name}
                            photo={workout.photo}
                            length={workout.length}
                            level={workout.level}
                            focus={workout.focus}
                            equipment={workout.equipment}
                            trainer={workout.trainer}
                            longText={workout.longText}
                            focusMulti={workout.focusMulti}
                        />
                    ))}
                </ThemedView>
            </ScrollView>
            {/* Bar with Sort and Filter buttons */}
            <WorkoutsBottomBar onSortPress={handleSortPress} onFilterPress={handleFilterPress} appliedFilterCount={activeFilterTypesCount} />
            <WorkoutsFilterDrawer
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApply={applyFilters}
                workouts={workouts}
                initialFilters={filters}
            />
            <WorkoutsSortDrawer visible={isSortVisible} onClose={() => setIsSortVisible(false)} onApply={applySort} initialSort={sortOption} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    countContainer: {
        paddingLeft: 24,
        paddingTop: 24,
        paddingBottom: 24, // Add padding to ensure content doesn't overlap with the bottom bar
    },
    contentContainer: {
        paddingTop: 12,
        paddingLeft: 16,
        paddingBottom: 100, // Add padding to ensure content doesn't overlap with the bottom bar
    },
});
