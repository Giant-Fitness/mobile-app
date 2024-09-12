// app/(tabs)/progress.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import React from 'react';
import ParallaxScrollView from '@/components/layout/ParallaxScrollView';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';

export default function ProgressScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name='code-slash' style={styles.headerImage} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>Explore</ThemedText>
            </ThemedView>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
});
