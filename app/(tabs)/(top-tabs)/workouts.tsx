// app/(tabs)/(top-tabs)/workouts.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Collapsible } from '@/components/Collapsible';
import Ionicons from '@expo/vector-icons/Ionicons';

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
        onPress: () => {},
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
        onPress: () => {},
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
        onPress: () => {},
    },
];

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();

    const navigateToAllWorkouts = () => {
        navigation.navigate('all-workouts');
    };

    // Define categories and their respective workout data
    const categories = [
        { title: 'Endurance Workouts', workouts: recommendedWorkouts },
        { title: 'Mobility Workouts', workouts: recommendedWorkouts },
        { title: 'Strength Workouts', workouts: recommendedWorkouts },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ThemedView>
                <ThemedText type='titleSmall' style={[styles.header, { color: themeColors.text }]}>
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
                        />
                    ))}
                </ScrollView>
                {categories.map((category, index) => (
                    <ThemedView key={index}>
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
                                    />
                                ))}
                                <TouchableOpacity
                                    style={[styles.seeAllButton, { backgroundColor: themeColors.containerLightColor }]}
                                    onPress={() => console.log('Navigate to see all')}
                                >
                                    <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                        See All
                                    </ThemedText>
                                </TouchableOpacity>
                            </ScrollView>
                        </Collapsible>
                        {<ThemedView style={[styles.divider, { backgroundColor: themeColors.containerBorderColor }]} />}
                    </ThemedView>
                ))}
                <TouchableOpacity onPress={navigateToAllWorkouts} style={styles.allWorkouts}>
                    <ThemedText type='body' style={[{ color: themeColors.text }]}>
                        All Workouts
                    </ThemedText>
                    <Ionicons name={'chevron-forward-outline'} size={16} color={themeColors.tabIconDefault} />
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
    },
    allWorkouts: {
        padding: 16,
        paddingTop: 16,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainScrollView: {
        marginLeft: 21,
        paddingRight: 48,
        paddingBottom: 36,
    },
    header: {
        padding: 16,
        paddingTop: 36,
        paddingLeft: 24,
    },
    scrollView: {
        paddingLeft: 24, // Starts content 24pts from the left
    },
    divider: {
        height: 0.7,
        width: '10%',
        alignSelf: 'center',
    },
    seeAllButton: {
        width: 250,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginHorizontal: 3,
    },
});
