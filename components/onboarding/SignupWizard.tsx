// components/onboarding/SignupWizard.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { ProgressDots } from '@/components/onboarding/ProgressDots';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '../buttons/PrimaryButton';

interface WizardStep {
    title: string;
    component: React.ComponentType<any>;
    initialData?: Record<string, any>;
}

interface SignupWizardProps {
    steps: WizardStep[];
    onComplete: (data: any) => void;
    IntroScreen?: React.ComponentType<{ onStart: () => void }>;
    submitText: string;
    initialData?: Record<string, any>;
}

export const SignupWizard: React.FC<SignupWizardProps> = ({ steps, onComplete, IntroScreen, submitText = 'Submit', initialData = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [showIntroScreen, setShowIntroScreen] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(initialData);
    const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef();

    const handleNext = async (stepData: any) => {
        const updatedFormData = { ...formData, ...stepData };
        setFormData(updatedFormData);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsLoading(true);
            try {
                await onComplete(updatedFormData);
            } catch (error) {
                console.error('Error completing signup:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else if (IntroScreen) {
            setShowIntroScreen(true);
        } else {
            handleExit();
        }
    };

    const handleStart = () => {
        // If we have initial data, set the current step valid immediately
        if (steps[0]?.initialData && Object.keys(steps[0].initialData).length > 0) {
            setIsCurrentStepValid(true);
        }
        setShowIntroScreen(false);
    };

    const handleExit = () => {
        router.back();
    };

    if (showIntroScreen && IntroScreen) {
        return <IntroScreen onStart={handleStart} />;
    }

    const CurrentStepComponent = steps[currentStep].component;
    const currentStepInitialData = steps[currentStep].initialData || {};
    const isLastStep = currentStep === steps.length - 1;

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ProgressDots total={steps.length} current={currentStep} />
            </View>
            <CurrentStepComponent
                ref={formRef}
                formData={{ ...formData, ...currentStepInitialData }}
                onSubmit={handleNext}
                onValidityChange={setIsCurrentStepValid}
            />
            <View style={styles.navigation}>
                <IconButton iconName='chevron-back' onPress={handleBack} style={styles.backButton} iconSize={Spaces.MD} />
                {!isLastStep ? (
                    <IconButton
                        iconName='chevron-forward'
                        onPress={() => formRef.current?.submitForm()}
                        style={[styles.nextButton, { backgroundColor: themeColors.buttonPrimary }, !isCurrentStepValid && styles.disabledButton]}
                        iconColor={themeColors.buttonPrimaryText}
                        iconSize={Spaces.MD}
                        disabled={!isCurrentStepValid}
                        haptic='soft'
                    />
                ) : (
                    <View style={styles.submitButtonContainer}>
                        <PrimaryButton
                            iconName='chevron-forward'
                            onPress={() => formRef.current?.submitForm()}
                            text={submitText}
                            iconPosition='right'
                            style={[styles.submitButton, { backgroundColor: themeColors.buttonPrimary }, !isCurrentStepValid && styles.disabledButton]}
                            size='MD'
                            textStyle={{ color: themeColors.buttonPrimaryText }}
                            iconSize={Spaces.MD}
                            iconColor={themeColors.buttonPrimaryText}
                            disabled={!isCurrentStepValid || isLoading}
                            loading={isLoading}
                            haptic='notificationSuccess'
                        />
                    </View>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spaces.MD,
        paddingTop: Sizes.headerHeight,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spaces.LG,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spaces.LG,
    },
    backButton: {
        position: 'absolute',
        left: Spaces.LG,
        bottom: Spaces.XXL,
        alignItems: 'center',
    },
    nextButton: {
        position: 'absolute',
        right: Spaces.LG,
        bottom: Spaces.XXL,
        opacity: 0.8,
        alignItems: 'center',
    },
    submitButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: Spaces.MD,
        bottom: Spaces.XXL,
    },
    submitButton: {
        paddingHorizontal: Spaces.MD + Spaces.SM,
        paddingVertical: Spaces.SM,
        opacity: 0.8,
    },
    disabledButton: {
        opacity: 0.1,
    },
});
