// app/(app)/onboarding/biodata/step-2-dob.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatDateForStorage, parseDateFromStorage } from '@/utils/calendar';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useSharedValue } from 'react-native-reanimated';

export default function DOBStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    // Initialize date from params or set default to 25 years ago
    const getInitialDate = () => {
        if (params.Dob) {
            return parseDateFromStorage(params.Dob as string);
        }
        const today = new Date();
        return new Date(today.getFullYear() - 25, 0, 1);
    };

    const [selectedDate, setSelectedDate] = useState(getInitialDate());

    // Set minimum and maximum dates for reasonable age range
    const getMinimumDate = () => {
        const today = new Date();
        return new Date(today.getFullYear() - 100, 0, 1); // 100 years ago
    };

    const getMaximumDate = () => {
        const today = new Date();
        return new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // 13 years ago (minimum age)
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleNext = () => {
        const dateString = formatDateForStorage(selectedDate);
        router.push({
            pathname: '/(app)/onboarding/biodata/step-3-height',
            params: { ...params, Dob: dateString },
        });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ThemedView style={[styles.container]}>
            <SectionProgressHeader
                sectionName='Basic Info'
                currentStep={2}
                totalSteps={5}
                onBackPress={handleBack}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    When is your birthday?
                </ThemedText>

                <DateTimePicker
                    value={selectedDate}
                    mode='date'
                    display='spinner'
                    onChange={handleDateChange}
                    minimumDate={getMinimumDate()}
                    maximumDate={getMaximumDate()}
                    style={styles.datePicker}
                    themeVariant={colorScheme}
                    textColor={themeColors.text}
                    locale='en-GB' // This will show dd/mm/yyyy format
                />
            </ThemedView>

            {/* Bottom button container */}
            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Next' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} />
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
    datePicker: {
        width: '100%',
        backgroundColor: 'transparent',
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
