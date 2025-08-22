// app/(app)/onboarding/goal/step-1-primary-goal.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useSharedValue } from 'react-native-reanimated';

export default function PrimaryFitnessGoalScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [primaryGoal, setPrimaryGoal] = useState((params.PrimaryFitnessGoal as string) || '');
    const [isValid, setIsValid] = useState(false);

    const goalOptions = [
        {
            key: 'lose-fat',
            text: 'Lose Fat',
            subText: 'Reduce body fat while preserving muscle',
            icon: 'trending-down',
        },
        {
            key: 'build-muscle',
            text: 'Build Muscle',
            subText: 'Gain lean muscle mass and strength',
            icon: 'trending-up',
        },
        {
            key: 'body-recomposition',
            text: 'Body Recomposition',
            subText: 'Build muscle while losing fat',
            icon: 'heart-plus-outline',
        },
        {
            key: 'maintain-fitness',
            text: 'Maintain Fitness',
            subText: 'Maintain current weight and fitness',
            icon: 'trending-flat',
        },
    ];

    useEffect(() => {
        setIsValid(!!primaryGoal);
    }, [primaryGoal]);

    const handleNext = () => {
        if (isValid) {
            // Determine if we need weight goal step based on primary goal
            if (primaryGoal === 'maintain-fitness' || primaryGoal === 'body-recomposition') {
                // Skip weight goal step, go directly to macro summary
                router.push({
                    pathname: '/(app)/onboarding/goal/macro-summary',
                    params: {
                        ...(params as Record<string, string>),
                        PrimaryFitnessGoal: primaryGoal,
                        // Set default calorie target to TDEE for maintenance
                        GoalCalories: params.TDEE,
                    },
                });
            } else {
                // Go to weight goal step for fat loss, muscle building
                router.push({
                    pathname: '/(app)/onboarding/goal/step-2-weight-goal',
                    params: {
                        ...(params as Record<string, string>),
                        PrimaryFitnessGoal: primaryGoal,
                    },
                });
            }
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Goal'
                currentStep={1}
                totalSteps={2}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What is your primary fitness goal?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.subtitle}>
                    This helps us customize your nutrition and training recommendations
                </ThemedText>
                <SelectionGroup options={goalOptions} selectedKeys={[primaryGoal]} onSelect={setPrimaryGoal} multiSelect={false} />
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Next' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} disabled={!isValid} />
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
        flex: 1,
        padding: Spaces.LG,
        paddingBottom: 0,
    },
    question: {
        textAlign: 'left',
        marginBottom: Spaces.SM,
    },
    subtitle: {
        marginBottom: Spaces.LG,
        textAlign: 'left',
        opacity: 0.7,
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
    continueButton: {
        width: '100%',
    },
});
