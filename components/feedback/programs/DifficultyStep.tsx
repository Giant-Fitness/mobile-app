// components/feedback/programs/DifficultyStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { RadioGroup } from '@/components/inputs/RadioGroup';
import { Spaces } from '@/constants/Spaces';
import React from 'react';
import { StyleSheet } from 'react-native';

export const DifficultyStep: FeedbackStep<any> = ({ data, onChange }) => {
    const options = [
        { id: '1', label: 'Too Easy' },
        { id: '2', label: 'Slightly Easy' },
        { id: '3', label: 'Just Right' },
        { id: '4', label: 'Slightly Hard' },
        { id: '5', label: 'Too Hard' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                How would you rate the difficulty of the workouts?
            </ThemedText>
            <RadioGroup
                options={options}
                selected={data.DifficultyRating?.toString()}
                onSelect={(value) => onChange({ DifficultyRating: parseInt(value) })}
                style={styles.radioGroup}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    stepTitle: {
        marginBottom: Spaces.SM,
    },
    subtitle: {
        marginBottom: Spaces.SM,
    },
    radioGroup: {
        marginBottom: Spaces.LG,
    },
    checkbox: {
        marginVertical: Spaces.SM,
    },
    textInput: {
        marginTop: Spaces.SM,
    },
    textAreaInput: {
        height: Spaces.XXXL,
        marginTop: Spaces.LG,
    },
});
