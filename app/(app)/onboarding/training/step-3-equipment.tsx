// app/(app)/onboarding/training/step-3-equipment.tsx

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

export default function TrainingEquipmentScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [equipmentAccess, setEquipmentAccess] = useState((params.AccessToEquipment as string) || '');
    const [isValid, setIsValid] = useState(false);

    const equipmentOptions = [
        {
            key: 'none',
            text: 'No Equipment',
            subText: 'Bodyweight workouts you can do anywhere',
            icon: 'walk',
        },
        {
            key: 'basic',
            text: 'Basic Equipment',
            subText: 'Free weights like dumbbells or kettlebells',
            icon: 'kettlebell',
        },
        {
            key: 'full',
            text: 'Full Gym Access',
            subText: 'Access to a gym with a variety of equipment',
            icon: 'dumbbell',
        },
    ];

    useEffect(() => {
        setIsValid(!!equipmentAccess);
    }, [equipmentAccess]);

    const handleNext = () => {
        if (isValid) {
            // Navigate to the next section or complete onboarding
            router.replace({
                pathname: '/(app)/onboarding/complete',
                params: {
                    ...(params as Record<string, string>),
                    AccessToEquipment: equipmentAccess,
                },
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Training'
                currentStep={3}
                totalSteps={3}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What equipment do you have available for your workouts?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.subtitle}>
                    We&apos;ll recommend programs that match your available equipment
                </ThemedText>
                <SelectionGroup options={equipmentOptions} selectedKeys={[equipmentAccess]} onSelect={setEquipmentAccess} multiSelect={false} />
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Done' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} disabled={!isValid} />
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
