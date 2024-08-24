// app/(tabs)/(top-tabs)/workouts.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/Workouts/WorkoutOverviewCard';
import { Collapsible } from '@/components/Collapsible';

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

    return (
        <ThemedView style={styles.container}>
            <ThemedText type='titleSmall' style={[styles.header, { color: themeColors.text }]}>Top Picks For You</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
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
{/*            <Collapsible title='Android, iOS, and web support'>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
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
            </Collapsible>*/}
            <TouchableOpacity onPress={navigateToAllWorkouts} style={styles.workoutTypes}>
                <ThemedText type='bodyMedium' style={[{ color: themeColors.text }]}>All Workouts</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    workoutTypes: {
        padding: 16,
        paddingTop: 36,
        paddingLeft: 24,
    },
    scrollViewContainer : {
        marginLeft: 21,
    },
    header: {
        padding: 16,
        paddingTop: 36,
        paddingLeft: 24,
    },
});
