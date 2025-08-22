// components/feedback/programs/AbandonReasonStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Spaces } from '@/constants/Spaces';
import { ProgramAbandonData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ReasonStep: FeedbackStep<ProgramAbandonData> = ({ data, onChange }) => {
    const options = [
        { key: 'schedule_conflict', text: 'Schedule conflict' },
        { key: 'time_consuming', text: 'Too time consuming' },
        { key: 'not_challenging', text: 'Not challenging enough' },
        { key: 'too_difficult', text: 'Workouts were too difficult' },
        { key: 'hard_to_follow', text: 'Workouts were hard to follow' },
        { key: 'boring', text: 'Workouts were boring or unengaging' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Why did you end the program?
            </ThemedText>
            <SelectionGroup
                options={options}
                selectedKeys={data.TerminationReason ? [data.TerminationReason] : []}
                onSelect={(value) => onChange({ TerminationReason: value })}
                multiSelect={false}
                variant='radio'
                containerStyle={styles.radioGroup}
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
