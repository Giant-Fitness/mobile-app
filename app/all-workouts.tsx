// app/all-workouts.tsx

import React from 'react';
import { ScrollView, StyleSheet, Button, TouchableOpacity, View } from 'react-native';
import { WorkoutDetailedCard } from '@/components/workouts/WorkoutDetailedCard';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { WorkoutsBottomBar } from '@/components/workouts/WorkoutsBottomBar';
import { CustomBackButton } from '@/components/icons/CustomBackButton';
import { Image } from 'expo-image';

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
        equipment: 'No Equipment',
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
        equipment: 'No Equipment',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
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
            headerStyle: {
                backgroundColor: Colors[colorScheme ?? 'light'].background,
            },
            headerTitleStyle: { color: Colors[colorScheme ?? 'light'].text, fontFamily: 'InterMedium' },
            headerLeft: () => <CustomBackButton />,
        });
    }, [navigation]);

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type='overline' style={[styles.countContainer, { color: themeColors.textLight }]}>
                {workouts.length} workouts
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.background }]}>
                    {workouts.map((workout) => (
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
            <WorkoutsBottomBar onSortPress={handleSortPress} onFilterPress={handleFilterPress} sortIcon='swap-vertical' filterIcon='options' />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    countContainer: {
        paddingLeft: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    contentContainer: {
        paddingLeft: 16,
        paddingBottom: 90, // Add padding to ensure content doesn't overlap with the bottom bar
    },
});
