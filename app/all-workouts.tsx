// app/all-workouts.tsx

import React from 'react';
import { ScrollView, StyleSheet, Image, Button, TouchableOpacity, View } from 'react-native';
import WorkoutCard from '@/components/Workouts/WorkoutCard';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { WorkoutsBottomBar } from '@/components/Workouts/WorkoutsBottomBar';
import { CustomBackButton } from '@/components/navigation/CustomBackButton';

const workouts = [
    { id: '1', name: 'Full Body Workout', photo: require('@/assets/images/vb.webp'), length: '45 mins', intensity: 'High', onPress: () => {} },
    { id: '2', name: 'Cardio Blast', photo: require('@/assets/images/vb.webp'), length: '30 mins', intensity: 'Medium', onPress: () => {} },
    { id: '3', name: 'Ab Blast', photo: require('@/assets/images/vb.webp'), length: '30 mins', intensity: 'Medium', onPress: () => {} },
    { id: '4', name: 'Shoulder Blast', photo: require('@/assets/images/vb.webp'), length: '30 mins', intensity: 'Medium', onPress: () => {} },
    { id: '5', name: 'Legs Blast', photo: require('@/assets/images/vb.webp'), length: '30 mins', intensity: 'Medium', onPress: () => {} },
    // fetch from the backend. caching?
];

export default function AllWorkoutsScreen() {
    const handleSortPress = () => {
        // Handle sort action
    };

    const handleFilterPress = () => {
        // Handle filter action
    };

    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();

    React.useEffect(() => {
        navigation.setOptions({
            title: 'All Workouts',
            headerBackTitleVisible: false, // Hide the back button label
            headerLeft: () => <CustomBackButton />,
        });
    }, [navigation]);

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type='subtitle' style={styles.countContainer}>
                {workouts.length} workouts
            </ThemedText>
            <ScrollView>
                <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.cardBackground }]}>
                    {workouts.map((workout) => (
                        <WorkoutCard key={workout.id} name={workout.name} photo={workout.photo} length={workout.length} intensity={workout.intensity} />
                    ))}
                </ThemedView>
            </ScrollView>
            {/* Bar with Sort and Filter buttons */}
            <WorkoutsBottomBar onSortPress={handleSortPress} onFilterPress={handleFilterPress} sortIcon='swap-vertical' filterIcon='options' />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    countContainer: {
        padding: 16,
        paddingTop: 24,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 70, // Add padding to ensure content doesn't overlap with the bottom bar
    },
});
