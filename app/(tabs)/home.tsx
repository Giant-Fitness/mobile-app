// app/(tabs)/home.tsx

import React from 'react';
import { Image, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/layout/ParallaxScrollView';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type='titleLarge'>Welcome!</ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
