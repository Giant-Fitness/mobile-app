// components/feedback/programs/FavoriteAspectsStep.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Checkbox } from '@/components/inputs/Checkbox';
import { Spaces } from '@/constants/Spaces';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { ProgramCompleteData } from '@/types/feedbackTypes';

export const FavoriteAspectsStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { id: 'workout_variety', label: 'Workout variety' },
        { id: 'intensity_level', label: 'Intensity level' },
        { id: 'progress_tracking', label: 'Progress tracking' },
        { id: 'program_structure', label: 'Program structure' },
        { id: 'schedule_flexibility', label: 'Schedule flexibility' },
        { id: 'results', label: 'Results achieved' },
        { id: 'form_guidance', label: 'Form guidance' },
        { id: 'instruction_clarity', label: 'Clear instructions' },
    ];

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                What aspects of the program did you enjoy the most?
            </ThemedText>
            <ThemedText type='bodySmall' style={styles.subtitle}>
                Select all that apply
            </ThemedText>
            {options.map((option) => (
                <Checkbox
                    key={option.id}
                    label={option.label}
                    checked={data.FavoriteAspects.includes(option.id)}
                    onToggle={() => {
                        const newFavorites = data.FavoriteAspects.includes(option.id)
                            ? data.FavoriteAspects.filter((id) => id !== option.id)
                            : [...data.FavoriteAspects, option.id];
                        onChange({ FavoriteAspects: newFavorites });
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
    checkbox: {
        marginVertical: Spaces.SM,
    },
});
