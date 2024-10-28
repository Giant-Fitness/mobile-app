// components/feedback/programs/OverallRatingStep.tsx
import React from 'react';

import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { StarRating } from '@/components/inputs/StarRating';
import { Spaces } from '@/constants/Spaces';
import { FeedbackStep } from '@/components/feedback/FeedbackForm';
import { ProgramCompleteData } from '@/types/feedbackTypes';

export const OverallRatingStep: FeedbackStep<ProgramCompleteData> = ({ data, onChange }) => {
    return (
        <ThemedView>
            <ThemedText type='subtitle' style={styles.stepTitle}>
                How would you rate your overall experience?
            </ThemedText>
            <StarRating rating={data.OverallRating} onRatingChange={(rating) => onChange({ OverallRating: rating })} style={styles.rating} />
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
    rating: {
        marginVertical: Spaces.MD,
    },
});
