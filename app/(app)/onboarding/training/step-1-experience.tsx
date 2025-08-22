// app/(app)/onboarding/training/step-1-experience.tsx

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

export default function TrainingExperienceScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [experienceLevel, setExperienceLevel] = useState((params.GymExperienceLevel as string) || '');
    const [isValid, setIsValid] = useState(false);

    const experienceOptions = [
        {
            key: 'beginner',
            text: 'Beginner',
            subText: 'New to working out or less than 1 year of experience',
            icon: 'level-beginner',
        },
        {
            key: 'intermediate',
            text: 'Intermediate',
            subText: '1–3 years of consistent training',
            icon: 'level-intermediate',
        },
        {
            key: 'advanced',
            text: 'Advanced',
            subText: 'More than 3 years of consistent training',
            icon: 'level-advanced',
        },
    ];

    useEffect(() => {
        setIsValid(!!experienceLevel);
    }, [experienceLevel]);

    const handleNext = () => {
        if (isValid) {
            router.push({
                pathname: '/(app)/onboarding/training/step-2-schedule',
                params: {
                    ...(params as Record<string, string>),
                    GymExperienceLevel: experienceLevel,
                },
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Training'
                currentStep={1}
                totalSteps={3}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What is your current experience level with working out?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.subtitle}>
                    This helps us recommend the right program intensity for you
                </ThemedText>
                <SelectionGroup options={experienceOptions} selectedKeys={[experienceLevel]} onSelect={setExperienceLevel} multiSelect={false} />
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
