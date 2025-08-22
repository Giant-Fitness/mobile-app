// components/feedback/programs/GoalsStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Spaces } from '@/constants/Spaces';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const GoalsStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { key: 'true', text: 'Yes, I achieved my goals' },
        { key: 'false', text: 'No, I did not achieve my goals' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Did you achieve your fitness goals with this program?
            </ThemedText>
            <SelectionGroup
                options={options}
                selectedKeys={[data.AchievedGoals.toString()]}
                onSelect={(value) => onChange({ AchievedGoals: value === 'true' })}
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
