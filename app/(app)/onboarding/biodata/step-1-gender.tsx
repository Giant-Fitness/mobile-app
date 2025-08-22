// app/(app)/onboarding/biodata/step-1-gender.tsx

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

export default function GenderStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [gender, setGender] = useState((params.Gender as string) || '');
    const [isValid, setIsValid] = useState(false);

    const genderOptions = [
        { key: 'female', text: 'Female', icon: 'female' },
        { key: 'male', text: 'Male', icon: 'male' },
    ];

    useEffect(() => {
        setIsValid(!!gender);
    }, [gender]);

    const handleNext = () => {
        if (isValid) {
            router.push({
                pathname: '/(app)/onboarding/biodata/step-2-dob',
                params: { ...params, Gender: gender },
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ThemedView style={[styles.container]}>
            <SectionProgressHeader
                sectionName='Basic Info'
                currentStep={1}
                totalSteps={5}
                onBackPress={handleBack}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What is your sex?
                </ThemedText>
                <SelectionGroup options={genderOptions} selectedKeys={[gender]} onSelect={setGender} multiSelect={false} />
            </ThemedView>

            {/* Bottom button container */}
            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Next' onPress={handleNext} haptic='impactLight' disabled={!isValid} size='LG' style={styles.continueButton} />
            </ThemedView>
        </ThemedView>
    );
}

// Shared styles for all steps
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
        marginBottom: Spaces.LG,
        textAlign: 'left',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spaces.MD,
    },
    inputHalf: {
        flex: 1,
    },
    inputSingle: {
        width: '100%',
    },
    inputLabel: {
        marginBottom: Spaces.SM,
        fontWeight: '500',
    },
    input: {
        // Additional styles if needed
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL, // Safe area padding
        paddingTop: Spaces.MD,
        backgroundColor: 'transparent',
    },
    continueButton: {
        width: '100%',
    },
});
