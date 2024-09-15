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
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
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
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
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
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
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
                <ThemedView style={styles.infoContainer}>
                    <ThemedText type='bodyXSmall' style={[styles.infoText, { color: themeColors.subText }]}>
                        {'Workouts are flexible one-off sessions that you can complete to meet your goals.'}
                    </ThemedText>
                </ThemedView>
                <ThemedText type='title' style={[styles.header, { color: themeColors.text }]}>
                    {'Top Picks For You'}
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
                                    <View style={styles.shadowContainer}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={[styles.seeAllButton, { backgroundColor: themeColors.backgroundSecondary }]}
                                            onPress={() => navigateToAllWorkouts({ focus: [category.type] })}
                                        >
                                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                                See All
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
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
                        <TouchableOpacity onPress={() => navigateToAllWorkouts()} style={styles.allWorkouts} activeOpacity={0.5}>
                            <Icon name='list' size={moderateScale(20)} color={themeColors.text} style={{ paddingRight: spacing.xs, marginTop: 1 }} />
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                {'All Workouts'}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        paddingTop: spacing.lg,
        paddingBottom: 0,
        marginHorizontal: spacing.xxxl,
    },
    infoText: {
        textAlign: 'center',
    },
    container: {
        flex: 1,
    },
    allWorkoutsContainer: {
        paddingBottom: spacing.xl,
    },
    allWorkouts: {
        padding: spacing.lg,
        flexDirection: 'row',
    },
    mainScrollView: {
        marginLeft: spacing.lg,
        paddingRight: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    header: {
        padding: spacing.md,
        paddingTop: spacing.lg,
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
        borderRadius: spacing.sm,
        marginHorizontal: spacing.xxs,
    },
    shadowContainer: {
        shadowColor: 'rgba(0,70,0,0.2)', // Use a more standard shadow color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: spacing.sm, // Match the child border radius
        marginRight: spacing.md,
    },
});
