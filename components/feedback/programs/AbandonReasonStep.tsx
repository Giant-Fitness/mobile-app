// components/feedback/programs/AbandonReasonStep.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { RadioGroup } from '@/components/inputs/RadioGroup';
import { Spaces } from '@/constants/Spaces';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { ProgramAbandonData } from '@/types/feedbackTypes';

export const ReasonStep: FeedbackStep<ProgramAbandonData> = ({ data, onChange }) => {
    const options = [
        { id: 'schedule_conflict', label: 'Schedule conflict' },
        { id: 'time_consuming', label: 'Too time consuming' },
        { id: 'not_challenging', label: 'Not challenging enough' },
        { id: 'too_difficult', label: 'Workouts were too difficult' },
        { id: 'hard_to_follow', label: 'Workouts were hard to follow' },
        { id: 'boring', label: 'Workouts were boring or unengaging' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Why did you end the program?
            </ThemedText>
            <RadioGroup
                options={options}
                selected={data.TerminationReason}
                onSelect={(value) => onChange({ TerminationReason: value })}
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
        marginBottom: 0,
    },
    radioGroup: {
        marginBottom: Spaces.LG,
    },
    checkbox: {
        marginVertical: Spaces.SM,
    },
});
