// app/programs/program-abandon-feedback.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';
import { Checkbox } from '@/components/inputs/Checkbox';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type FeedbackOption = {
    id: string;
    label: string;
};

const feedbackOptions: FeedbackOption[] = [
    { id: 'schedule_mismatch', label: 'Schedule conflict' },
    { id: 'time_consuming', label: 'Too time consuming' },
    { id: 'not_challenging', label: 'Not challenging enough' },
    { id: 'too_difficult', label: 'Workouts were too difficult' },
    { id: 'hard_to_follow', label: 'Workouts were hard to follow' },
    { id: 'boring', label: 'Workouts were boring or unengaging' },
];

export default function ProgramAbandonFeedbackScreen() {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const navigation = useNavigation();

    // Reset selected options when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setSelectedOptions([]);
        }, []),
    );

    useEffect(() => {
        navigation.setOptions({ headerShown: false, gestureEnabled: false });
    }, [navigation]);

    const toggleOption = (id: string) => {
        setSelectedOptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleSubmit = () => {
        console.log('Feedback submitted:', selectedOptions);
        navigation.navigate('programs/program-end-splash' as never);
    };

    const handleSkip = () => {
        navigation.navigate('programs/program-end-splash' as never);
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type='titleXLarge' style={styles.title}>
                Help Us Improve
            </ThemedText>
            <ThemedText type='subtitle' style={styles.subtitle}>
                Why did you end the program?
            </ThemedText>
            <ThemedText type='bodySmall' style={styles.instructions}>
                Select all that apply
            </ThemedText>
            <ThemedView style={styles.options}>
                {feedbackOptions.map((option) => (
                    <Checkbox
                        key={option.id}
                        label={option.label}
                        checked={selectedOptions.includes(option.id)}
                        onToggle={() => toggleOption(option.id)}
                        style={styles.checkbox}
                    />
                ))}
            </ThemedView>
            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Submit' onPress={handleSubmit} size='LG' style={[styles.button, { marginBottom: Spaces.MD }]} />
                <TextButton text='Skip' onPress={handleSkip} size='LG' style={styles.button} />
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spaces.XL,
        paddingTop: Sizes.bottomSpaceMedium,
    },
    title: {
        marginBottom: Spaces.XXS,
    },
    subtitle: {
        marginBottom: Spaces.SM,
    },
    instructions: {
        marginBottom: Spaces.XS,
    },
    checkbox: {
        marginVertical: Spaces.MD,
    },
    buttonContainer: {
        marginTop: Spaces.XL,
        alignItems: 'center',
    },
    button: {
        width: '100%',
    },
    options: {},
});
