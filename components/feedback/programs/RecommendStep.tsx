// components/feedback/programs/RecommendStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Spaces } from '@/constants/Spaces';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const RecommendStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { key: 'true', text: 'Yes, I would recommend this program' },
        { key: 'false', text: 'No, I would not recommend this program' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                Would you recommend this program to others?
            </ThemedText>
            <SelectionGroup
                options={options}
                selectedKeys={[data.WouldRecommend.toString()]}
                onSelect={(value) => onChange({ WouldRecommend: value === 'true' })}
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
});
