// components/feedback/programs/ImprovementStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Checkbox } from '@/components/inputs/Checkbox';
import { Spaces } from '@/constants/Spaces';
import { ProgramAbandonData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ImprovementsStep: FeedbackStep<ProgramAbandonData> = ({ data, onChange }) => {
    const options = [
        { id: 'better_instructions', label: 'Clearer instructions' },
        { id: 'more_variety', label: 'More workout variety' },
        { id: 'better_progression', label: 'Better workout progression' },
        { id: 'flexible_schedule', label: 'More flexible scheduling' },
        { id: 'equipment_options', label: 'More equipment options' },
        { id: 'form_guidance', label: 'Better form guidance' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                What could we improve?
            </ThemedText>
            <ThemedText type='bodySmall' style={styles.subtitle}>
                Select all that apply
            </ThemedText>
            {options.map((option) => (
                <Checkbox
                    key={option.id}
                    label={option.label}
                    checked={data.Improvements.includes(option.id)}
                    onToggle={() => {
                        const newImprovements = data.Improvements.includes(option.id)
                            ? data.Improvements.filter((id) => id !== option.id)
                            : [...data.Improvements, option.id];
                        onChange({ Improvements: newImprovements });
                    }}
                    style={styles.checkbox}
                />
            ))}
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
