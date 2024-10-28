// components/feedback/programs/ImprovementStep.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Checkbox } from '@/components/inputs/Checkbox';
import { TextInput } from '@/components/inputs/TextInput';
import { Spaces } from '@/constants/Spaces';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { ProgramAbandonData } from '@/types/feedbackTypes';

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
            {/* <TextInput
                placeholder="Any additional feedback?"
                value={data.additionalFeedback}
                onChangeText={(text) => onChange({ additionalFeedback: text })}
                style={StyleSheet.flatten([styles.textInput, styles.textAreaInput])}
                multiline
            /> */}
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
