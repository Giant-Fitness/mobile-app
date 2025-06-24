// components/feedback/programs/RecommendStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { RadioGroup } from '@/components/inputs/RadioGroup';
import { Spaces } from '@/constants/Spaces';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const RecommendStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { id: 'true', label: 'Yes, I would recommend this program' },
        { id: 'false', label: 'No, I would not recommend this program' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Would you recommend this program to others?
            </ThemedText>
            <RadioGroup
                options={options}
                selected={data.WouldRecommend.toString()}
                onSelect={(value) => onChange({ WouldRecommend: value === 'true' })}
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
});
