// components/feedback/programs/ImprovementStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Spaces } from '@/constants/Spaces';
import { ProgramAbandonData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ImprovementsStep: FeedbackStep<ProgramAbandonData> = ({ data, onChange }) => {
    const options = [
        { key: 'better_instructions', text: 'Clearer instructions' },
        { key: 'more_variety', text: 'More workout variety' },
        { key: 'better_progression', text: 'Better workout progression' },
        { key: 'flexible_schedule', text: 'More flexible scheduling' },
        { key: 'equipment_options', text: 'More equipment options' },
        { key: 'form_guidance', text: 'Better form guidance' },
    ];

    const handleSelect = (key: string) => {
        const newImprovements = data.Improvements.includes(key) ? data.Improvements.filter((id) => id !== key) : [...data.Improvements, key];
        onChange({ Improvements: newImprovements });
    };

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                What could we improve?
            </ThemedText>
            <ThemedText type='bodySmall' style={styles.subtitle}>
                Select all that apply
            </ThemedText>
            <SelectionGroup
                options={options}
                selectedKeys={data.Improvements}
                onSelect={handleSelect}
                multiSelect={true}
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
});
