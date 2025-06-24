// components/feedback/programs/GoalsStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { RadioGroup } from '@/components/inputs/RadioGroup';
import { Spaces } from '@/constants/Spaces';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const GoalsStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { id: 'true', label: 'Yes, I achieved my goals' },
        { id: 'false', label: 'No, I did not achieve my goals' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Did you achieve your fitness goals with this program?
            </ThemedText>
            <RadioGroup
                options={options}
                selected={data.AchievedGoals.toString()}
                onSelect={(value) => onChange({ AchievedGoals: value === 'true' })}
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
