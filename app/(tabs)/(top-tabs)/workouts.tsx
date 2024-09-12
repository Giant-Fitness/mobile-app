// app/(tabs)/(top-tabs)/workouts.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Collapsible } from '@/components/layout/Collapsible';
import { Icon } from '@/components/icons/Icon';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

type RootStackParamList = {
    'workouts/all-workouts': { initialFilters: object };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const recommendedWorkouts = [
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
        equipment: 'No Equipment',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
];

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation<NavigationProp>();

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    const categories = [
        { title: 'Endurance Workouts', workouts: recommendedWorkouts, type: 'Endurance' },
        { title: 'Mobility Workouts', workouts: recommendedWorkouts, type: 'Mobility' },
        { title: 'Strength Workouts', workouts: recommendedWorkouts, type: 'Strength' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
            <ThemedView>
                <ThemedText type='title' style={[styles.header, { color: themeColors.text }]}>
                    Top Picks For You
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainScrollView}>
                    {recommendedWorkouts.map((workout) => (
                        <WorkoutOverviewCard
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
                </ScrollView>
                <ThemedView>
                    {categories.map((category, index) => (
                        <ThemedView key={index} style={styles.collapsible}>
                            <Collapsible title={category.title}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                                    {category.workouts.map((workout) => (
                                        <WorkoutOverviewCard
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
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={[styles.seeAllButton, { backgroundColor: themeColors.container }]}
                                        onPress={() => navigateToAllWorkouts({ focus: [category.type] })}
                                    >
                                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                            See All
                                        </ThemedText>
                                    </TouchableOpacity>
                                </ScrollView>
                            </Collapsible>
                            {
                                <View
                                    style={[
                                        styles.dividerInterior,
                                        {
                                            borderBottomColor: themeColors.systemBorderColor,
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                        },
                                    ]}
                                />
                            }
                        </ThemedView>
                    ))}
                    <ThemedView style={styles.allWorkoutsContainer}>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts()} style={styles.allWorkouts}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                All Workouts
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.iconDefault} style={{ paddingTop: spacing.xxs }} />
                        </TouchableOpacity>
                        <View
                            style={[
                                styles.divider,
                                {
                                    borderBottomColor: themeColors.systemBorderColor,
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                },
                            ]}
                        />
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    allWorkoutsContainer: {
        paddingBottom: spacing.xxxl,
    },
    allWorkouts: {
        padding: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainScrollView: {
        marginLeft: spacing.lg,
        paddingRight: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    header: {
        padding: spacing.md,
        paddingTop: spacing.xl,
        paddingLeft: spacing.lg,
    },
    scrollView: {
        paddingLeft: spacing.lg,
        paddingBottom: spacing.lg,
    },
    collapsible: {
        paddingTop: spacing.md,
    },
    divider: {
        width: '90%',
        alignSelf: 'center',
    },
    dividerInterior: {
        width: '90%',
        alignSelf: 'center',
    },
    seeAllButton: {
        width: sizes.imageXLargeWidth,
        height: sizes.imageXLargeHeight,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing.xxs,
        marginHorizontal: spacing.xxs,
    },
});
