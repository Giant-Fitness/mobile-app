// app/(app)/onboarding/training/intro.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

export default function TrainingIntroScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const params = useLocalSearchParams();

    const handleStart = () => {
        router.push({
            pathname: '/(app)/onboarding/training/step-1-experience',
            params: params as Record<string, string>,
        });
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader sectionName='Training' onBackPress={() => router.back()} disableColorChange headerBackground={themeColors.background} />

            <ImageTextOverlay
                image={require('@/assets/images/stretching.svg')}
                containerStyle={styles.motivationalImage}
                titleType='titleLarge'
                gradientColors={['transparent', 'transparent']}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='title' style={styles.title}>
                    Now Let&apos;s Find Your Perfect Training Plan
                </ThemedText>

                <ThemedText type='body' style={styles.description}>
                    Great job setting up your nutrition goals! Now let&apos;s create a training plan that works for your experience and schedule
                </ThemedText>

                <ThemedText type='bodySmall' style={styles.note}>
                    You can always select a different plan if you prefer
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text="Let's Go" onPress={handleStart} haptic='impactLight' size='LG' style={styles.startButton} />
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight + Spaces.XL,
    },
    content: {
        padding: Spaces.LG,
        paddingBottom: 0,
        justifyContent: 'center',
    },
    motivationalImage: {
        height: '30%',
        width: '100%',
        marginBottom: Spaces.LG,
    },
    title: {
        textAlign: 'left',
        marginBottom: Spaces.LG,
    },
    description: {
        marginBottom: Spaces.MD,
        textAlign: 'left',
    },
    note: {
        marginBottom: Spaces.MD,
        textAlign: 'left',
        opacity: 0.8,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL,
        paddingTop: Spaces.MD,
        backgroundColor: 'transparent',
    },
    startButton: {
        width: '100%',
    },
});
