// app/workouts/all-workouts.tsx

import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { WorkoutDetailedCard } from '@/components/workouts/WorkoutDetailedCard';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { WorkoutsBottomBar } from '@/components/workouts/WorkoutsBottomBar';
import { WorkoutsFilterDrawer } from '@/components/workouts/WorkoutsFilterDrawer';
import { WorkoutsSortDrawer } from '@/components/workouts/WorkoutsSortDrawer';
import { verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';

const workouts = [
    {
        id: '1',
        name: 'Full Body Workout',
        photo: require('@/assets/images/vb.webp'),
        length: '45 mins',
        level: 'Advanced',
        equipment: 'None',
        focus: 'Strength',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '2',
        name: 'Cardio Blast',
        photo: require('@/assets/images/vb.webp'),
        length: '30 mins',
        level: 'Intermediate',
        equipment: 'None',
        focus: 'Endurance',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '3',
        name: 'Morning Flexibility',
        photo: require('@/assets/images/vb.webp'),
        length: '20 mins',
        level: 'Beginner',
        equipment: 'Basic',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '4',
        name: 'Tank Top Arms',
        photo: require('@/assets/images/vb.webp'),
        length: '30 mins',
        level: 'Advanced',
        equipment: 'Full Gym',
        focus: 'Strength',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '5',
        name: '5 minute Calming Breath',
        photo: require('@/assets/images/vb.webp'),
        length: '5 mins',
        level: 'Beginner',
        equipment: 'Basic',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
];

type RouteParams = {
    initialFilters?: Record<string, any>;
};

export default function AllWorkoutsScreen() {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);
    const [sortOption, setSortOption] = useState({ type: 'Length', order: 'Shortest' });

    const navigation = useNavigation();
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

    const { initialFilters } = route.params || {};
    const [filters, setFilters] = useState(initialFilters || {});

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

        setFilteredWorkouts([...filtered]);
    };

    const applySort = (option: { type: string; order: string }) => {
        setSortOption(option);
        filterAndSortWorkouts(filters, option);
    };

    useEffect(() => {
        if (initialFilters && Object.keys(initialFilters).length > 0) {
            setFilters(initialFilters);
            filterAndSortWorkouts(initialFilters, sortOption);
        } else {
            filterAndSortWorkouts({}, sortOption);
        }
    }, [initialFilters]);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const workoutCount = filteredWorkouts.length;
    const workoutLabel = workoutCount === 1 ? 'workout' : 'workouts';

    const activeFilterTypesCount = Object.keys(filters).filter((key) => filters[key].length > 0).length;
    const scrollY = useSharedValue(0);

    const renderItem = ({ item }: { item: (typeof workouts)[0] }) => (
        <WorkoutDetailedCard
            name={item.name}
            photo={item.photo}
            length={item.length}
            level={item.level}
            focus={item.focus}
            equipment={item.equipment}
            trainer={item.trainer}
            longText={item.longText}
            focusMulti={item.focusMulti}
            cardColor={themeColors.card}
            // Removed the style prop
        />
    );

    const keyExtractor = (item: (typeof workouts)[0]) => item.id;

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
                contentContainerStyle={[styles.contentContainer, { backgroundColor: themeColors.background, paddingHorizontal: spacing.sm }]}
                showsVerticalScrollIndicator={false}
            />
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
        padding: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: 100,
    },
    contentContainer: {
        paddingTop: 0,
        paddingBottom: verticalScale(100),
    },
});
