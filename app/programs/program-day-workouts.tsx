// app/programs/program-day-workouts.tsx

import React from 'react';
import { ScrollView, StyleSheet, Image, Button, TouchableOpacity, View } from 'react-native';
import { WorkoutDetailedCard } from '@/components/workouts/WorkoutDetailedCard';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { WorkoutsBottomBar } from '@/components/workouts/WorkoutsBottomBar';
import { CustomBackButton } from '@/components/icons/CustomBackButton';
import DayWorkoutCard from '@/components/programs/DayWorkoutCard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const workouts = [
    {
        id: '1',
        name: 'Reverse Barbell Lounge',
        photo: require('@/assets/images/vb.webp'),
        numSets: 3,
        lowerLimReps: 10,
        upperLimReps: 12,
        restPeriod: '2 min',
        introText: 'Alternate reps on each side. We’re aiming for 10-12 reps',
        longText: 'Weight selection tip goes here. 0.6x 1RM. tell them to use calculator \n\nSet up tip goes here. Set up the rack to have the barbell at upper chest height. Position the bar high on the back of your shoulders. Dismount the bar from the rack, and \n\nposition yourself in a shoulder-width stance. Form tip goes here - Squat down by bending hips back, don’t bend your back and brace your core.'
    },
    {
        id: '2',
        name: 'Barbell Squats',
        photo: require('@/assets/images/vb.webp'),
        numSets: 3,
        lowerLimReps: 10,
        upperLimReps: 12,
        restPeriod: '2 min',
        introText: 'Alternate reps on each side. We’re aiming for 10-12 reps',
        longText: 'Weight selection tip goes here. 0.6x 1RM. tell them to use calculator \n\nSet up tip goes here. Set up the rack to have the barbell at upper chest height. Position the bar high on the back of your shoulders. Dismount the bar from the rack, and \n\nposition yourself in a shoulder-width stance. Form tip goes here - Squat down by bending hips back, don’t bend your back and brace your core.'
    },
    {
        id: '3',
        name: 'Incline Bench Press',
        photo: require('@/assets/images/vb.webp'),
        numSets: 3,
        lowerLimReps: 10,
        upperLimReps: 12,
        restPeriod: '2 min',
        introText: 'Alternate reps on each side. We’re aiming for 10-12 reps',
        longText: 'Weight selection tip goes here. 0.6x 1RM. tell them to use calculator \n\nSet up tip goes here. Set up the rack to have the barbell at upper chest height. Position the bar high on the back of your shoulders. Dismount the bar from the rack, and \n\nposition yourself in a shoulder-width stance. Form tip goes here - Squat down by bending hips back, don’t bend your back and brace your core.'
    },
    {
        id: '4',
        name: 'Overhead Press',
        photo: require('@/assets/images/vb.webp'),
        numSets: 3,
        lowerLimReps: 10,
        upperLimReps: 12,
        restPeriod: '2 min',
        introText: 'Alternate reps on each side. We’re aiming for 10-12 reps',
        longText: 'Weight selection tip goes here. 0.6x 1RM. tell them to use calculator \n\nSet up tip goes here. Set up the rack to have the barbell at upper chest height. Position the bar high on the back of your shoulders. Dismount the bar from the rack, and \n\nposition yourself in a shoulder-width stance. Form tip goes here - Squat down by bending hips back, don’t bend your back and brace your core.'
    },
    {
        id: '5',
        name: 'Push Ups',
        photo: require('@/assets/images/vb.webp'),
        numSets: 3,
        lowerLimReps: 10,
        upperLimReps: 12,
        restPeriod: '2 min',
        introText: 'Alternate reps on each side. We’re aiming for 10-12 reps',
        longText: 'Weight selection tip goes here. 0.6x 1RM. tell them to use calculator \n\nSet up tip goes here. Set up the rack to have the barbell at upper chest height. Position the bar high on the back of your shoulders. Dismount the bar from the rack, and \n\nposition yourself in a shoulder-width stance. Form tip goes here - Squat down by bending hips back, don’t bend your back and brace your core.'
    }
]

const CustomHeader = ({ workout, themeColors, week, day, length }) => {
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={[styles.title, { color: themeColors.text }]}>{workout}</ThemedText>
            <ThemedView style={styles.subView}>
                <View style={styles.subTextView}>
                    <Ionicons name='stopwatch-outline' size={15} color={themeColors.text} />
                    <ThemedText style={[styles.subText, { color: themeColors.text, marginLeft: 3 }]}>{length}</ThemedText>
                </View>
                <ThemedText style={[styles.subText, { color: themeColors.text }]}>
                    Week {week} Day {day}
                </ThemedText>
                <View style={styles.subTextView}>
                    <MaterialCommunityIcons name='dumbbell' size={15} color={themeColors.text} />
                    <ThemedText style={[styles.subText, { color: themeColors.text, marginLeft: 5 }]}>Full Gym</ThemedText>
                </View>
            </ThemedView>
        </ThemedView>
    );
};

const DayWorkoutsScreen = () => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const { workout, week, day, length } = route.params;

    React.useEffect(() => {
        navigation.setOptions({
            title: '',
            headerStyle: {
                backgroundColor: themeColors.background,
            },
            headerTitle: () => <CustomHeader workout={workout} themeColors={Colors[colorScheme ?? 'light']} day={day} week={week} length={length} />,
            headerLeft: () => null, // Removes the back arrow
            headerTitleAlign: 'center', // Centers the header text
        });
    }, [navigation]);

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.background }]}>
                    {workouts && workouts.map((workout) => (
                        <DayWorkoutCard
                            key={workout.id}
                            photo={workout.photo}
                            workoutName={workout.name}
                            numSets={workout.numSets}
                            lowerLimReps={workout.lowerLimReps}
                            higherLimReps={workout.upperLimReps}
                            restPeriod={workout.restPeriod}
                            intro={workout.introText}
                            longText={workout.longText}
                        />
                    ))}
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: 8,
        paddingBottom: 90, // Add padding to ensure content doesn't overlap with the bottom bar
    },
    container: {
        marginRight: '27%',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'InterMedium',
        fontSize: 18,
    },
    subView: {
        marginTop: 4, // Adjust as needed
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    subText: {
        fontFamily: 'InterMedium',
        fontSize: 12,
    },
    subTextView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        paddingTop: '10%',
        paddingLeft: '5%',
    },
});

export default DayWorkoutsScreen;
