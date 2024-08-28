// app/index.tsx

import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { Link } from 'expo-router';

export default function LoginPage() {
    return (
        <ThemedView style={styles.titleContainer}>
            <Link href={'/workouts/all-workouts'} replace asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </Link>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
