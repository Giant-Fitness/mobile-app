// app/(tabs)/(top-tabs)/programs.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React from 'react';

export default function ProgramsScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText>Programs</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
