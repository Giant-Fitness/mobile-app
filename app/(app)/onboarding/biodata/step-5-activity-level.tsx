// app/(app)/onboarding/biodata/step-5-activity-level.tsx

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

export default function ActivityLevelStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [activityLevel, setActivityLevel] = useState((params.ActivityLevel as string) || '');
    const [isValid, setIsValid] = useState(false);

    const activityOptions = [
        {
            key: 'sedentary',
            text: 'Sedentary',
            subText: 'Little to no exercise, desk job',
            icon: 'laptop',
        },
        {
            key: 'lightly-active',
            text: 'Lightly Active',
            subText: 'Light exercise 1-3 days/week',
            icon: 'walk',
        },
        {
            key: 'moderately-active',
            text: 'Moderately Active',
            subText: 'Moderate exercise 3-5 days/week',
            icon: 'run-fast',
        },
        {
            key: 'very-active',
            text: 'Very Active',
            subText: 'Heavy exercise 6-7 days/week',
            icon: 'bicycle-electric',
        },
    ];

    useEffect(() => {
        setIsValid(!!activityLevel);
    }, [activityLevel]);

    const handleNext = () => {
        if (isValid) {
            // Navigate to the next section (TDEE step) with all collected biodata
            router.push({
                pathname: '/(app)/onboarding/biodata/tdee-summary',
                params: {
                    ...(params as Record<string, string>),
                    ActivityLevel: activityLevel,
                },
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Basic Info'
                currentStep={5}
                totalSteps={5}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    How active are you?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.subtitle}>
                    Think about your exercise and daily activities - this helps us estimate your calorie burn
                </ThemedText>
                <SelectionGroup options={activityOptions} selectedKeys={[activityLevel]} onSelect={setActivityLevel} multiSelect={false} />
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
