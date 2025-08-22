// components/feedback/programs/FavoriteAspectsStep.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { Spaces } from '@/constants/Spaces';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import React from 'react';
import { StyleSheet } from 'react-native';

export const FavoriteAspectsStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    const options = [
        { key: 'workout_variety', text: 'Workout variety' },
        { key: 'intensity_level', text: 'Intensity level' },
        { key: 'progress_tracking', text: 'Progress tracking' },
        { key: 'program_structure', text: 'Program structure' },
        { key: 'schedule_flexibility', text: 'Schedule flexibility' },
        { key: 'results', text: 'Results achieved' },
        { key: 'form_guidance', text: 'Form guidance' },
        { key: 'instruction_clarity', text: 'Clear instructions' },
    ];

    const handleSelect = (key: string) => {
        const newFavorites = data.FavoriteAspects.includes(key) ? data.FavoriteAspects.filter((id) => id !== key) : [...data.FavoriteAspects, key];
        onChange({ FavoriteAspects: newFavorites });
    };

    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                What aspects of the program did you enjoy the most?
            </ThemedText>
            <ThemedText type='bodySmall' style={styles.subtitle}>
                Select all that apply
            </ThemedText>
            <SelectionGroup
                options={options}
                selectedKeys={data.FavoriteAspects}
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
