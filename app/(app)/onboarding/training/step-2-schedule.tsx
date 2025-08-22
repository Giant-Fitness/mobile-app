// app/(app)/onboarding/training/step-2-schedule.tsx

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

export default function TrainingScheduleScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [daysPerWeek, setDaysPerWeek] = useState((params.DaysPerWeekDesired as string) || '');
    const [isValid, setIsValid] = useState(false);

    const scheduleOptions = [
        {
            key: 'twothree',
            text: '2–3 days a week',
            subText: 'Perfect for beginners or busy schedules',
            icon: 'calendar-week-begin',
        },
        {
            key: 'fourfive',
            text: '4–5 days a week',
            subText: 'Great balance for steady progress',
            icon: 'calendar-weekend',
        },
        {
            key: 'sixseven',
            text: '6–7 days a week',
            subText: 'Maximum commitment for serious gains',
            icon: 'calendar-month',
        },
    ];

    useEffect(() => {
        setIsValid(!!daysPerWeek);
    }, [daysPerWeek]);

    const handleNext = () => {
        if (isValid) {
            router.push({
                pathname: '/(app)/onboarding/training/step-3-equipment',
                params: {
                    ...(params as Record<string, string>),
                    DaysPerWeekDesired: daysPerWeek,
                },
            });
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Training'
                currentStep={2}
                totalSteps={3}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    How many days per week can you commit to training?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.subtitle}>
                    Be realistic - consistency is more important than intensity
                </ThemedText>
                <SelectionGroup options={scheduleOptions} selectedKeys={[daysPerWeek]} onSelect={setDaysPerWeek} multiSelect={false} />
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
