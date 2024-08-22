// app/(tabs)/(top-tabs)/workouts.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutsScreen() {
    const navigation = useNavigation();

    const navigateToAllWorkouts = () => {
        navigation.navigate('all-workouts');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText>Workouts</ThemedText>
            <TouchableOpacity onPress={navigateToAllWorkouts} style={styles.linkButton}>
                <ThemedText type='link'>See All Workouts</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    linkButton: {
        marginTop: 16,
    },
});
