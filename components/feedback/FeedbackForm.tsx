// components/feedback/FeedbackForm.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

export type Option = {
    id: string;
    label: string;
};

export type FeedbackStep<T> = React.ComponentType<{
    data: T;
    onChange: (update: Partial<T>) => void;
}>;

export type FeedbackFormResult<T> = {
    data: T;
};

type FeedbackFormProps<T> = {
    steps: FeedbackStep<T>[];
    onSubmit: (result: FeedbackFormResult<T>) => Promise<void>;
    onSkip: (result: FeedbackFormResult<T>) => Promise<void>;
    initialData: T;
    validate?: (step: number, data: T) => boolean;
};

export default function FeedbackForm<T>({ steps, onSubmit, onSkip, initialData, validate }: FeedbackFormProps<T>) {
    const [currentStep, setCurrentStep] = useState(1);
    const [feedbackData, setFeedbackData] = useState<T>(initialData);
    const [lastCompletedStep, setLastCompletedStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const handleSkip = async () => {
        if (isSkipping || isSubmitting) return;

        setIsSkipping(true);
        try {
            await onSkip({
                data: feedbackData,
            });
        } finally {
            setIsSkipping(false);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting || isSkipping) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                data: feedbackData,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        setLastCompletedStep(Math.max(lastCompletedStep, currentStep));
        setCurrentStep((prev) => prev + 1);
    };

    const updateFeedbackData = (update: Partial<T>) => {
        setFeedbackData((prev) => ({ ...prev, ...update }));
    };

    const isLastStep = currentStep === steps.length;
    const CurrentStep = steps[currentStep - 1];

    const canProceed = () => {
        if (validate) {
            return validate(currentStep, feedbackData);
        }
        return true;
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type='titleXLarge' style={styles.title}>
                Help Us Improve
            </ThemedText>

            <ThemedView style={styles.stepContainer}>
                <CurrentStep data={feedbackData} onChange={updateFeedbackData} />
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <TextButton text='Skip' onPress={handleSkip} size='LG' style={styles.skipButton} disabled={isSubmitting || isSkipping} loading={isSkipping} />
                {isLastStep ? (
                    <PrimaryButton
                        text='Submit'
                        onPress={handleSubmit}
                        size='LG'
                        style={[styles.actionButton, { marginBottom: Spaces.MD }]}
                        disabled={isSubmitting || isSkipping}
                        loading={isSubmitting}
                    />
                ) : (
                    <PrimaryButton
                        text='Next'
                        onPress={handleNext}
                        size='LG'
                        style={[styles.actionButton, { marginBottom: Spaces.MD }]}
                        disabled={!canProceed() || isSubmitting || isSkipping}
                    />
                )}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spaces.LG,
        paddingTop: Sizes.bottomSpaceMedium,
    },
    title: {
        marginBottom: Spaces.XL,
    },
    stepContainer: {
        flex: 1,
    },
    stepIndicator: {
        marginBottom: Spaces.MD,
    },
    buttonContainer: {
        marginTop: Spaces.XL,
        paddingBottom: Spaces.XL,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skipButton: {
        width: '40%',
        borderWidth: 0,
        marginTop: -Spaces.MD,
    },
    actionButton: {
        width: '50%',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
});
