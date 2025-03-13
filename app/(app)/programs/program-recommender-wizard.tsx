// app/(app)/programs/program-recommender-wizard.tsx

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SignupWizard } from '@/components/onboarding/SignupWizard';
import { WorkoutGoalsForm, ExperienceForm, EquipmentForm, ScheduleForm } from '@/components/onboarding/fitness/FitnessWizardForms';
import { ProgramRecommenderIntro } from '@/components/onboarding/fitness/ProgramRecommenderIntro';
import { updateUserFitnessProfileAsync } from '@/store/user/thunks';
import { AutoDismissSuccessModal } from '@/components/overlays/AutoDismissSuccessModal';
import { AppDispatch, RootState } from '@/store/store';
import { usePostHog } from 'posthog-react-native';

const ProgramRecommenderWizardScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const posthog = usePostHog();

    // Get the existing fitness profile from Redux store
    const userFitnessProfile = useSelector((state: RootState) => state.user.userFitnessProfile);

    const handleComplete = async (data: any) => {
        try {
            const result = await dispatch(updateUserFitnessProfileAsync({ userFitnessProfile: data })).unwrap();
            if (result.user && result.userRecommendations && result.userFitnessProfile) {
                setShowSuccessModal(true);
            }
            posthog.capture('program_recommendation_completed', {
                success: true,
                selected_goal: data.PrimaryFitnessGoal, // e.g., "muscle_gain", "strength", "weight_loss"
                equipment_access: data.AccessToEquipment, // e.g., "full_gym", "home_gym", "minimal"
                weekly_frequency: data.DaysPerWeekDesired, // number
                experience_level: data.GymExperienceLevel,
                screen: 'program-recommender-wizard',
            });
        } catch (error: any) {
            console.error('Failed to update fitness profile:', error);
            posthog.capture('program_recommendation_error', {
                success: false,
                error_message: error.message,
                screen: 'program-recommender-wizard',
            });
            // Handle error case
        }
    };

    const handleSuccessModalDismiss = () => {
        setShowSuccessModal(false);
        router.replace('/(app)/(tabs)/programs');
    };

    const wizardSteps = [
        {
            title: 'Workout Goals',
            component: WorkoutGoalsForm,
            initialData: { PrimaryFitnessGoal: userFitnessProfile?.PrimaryFitnessGoal },
        },
        {
            title: 'Experience Level',
            component: ExperienceForm,
            initialData: { GymExperienceLevel: userFitnessProfile?.GymExperienceLevel },
        },
        {
            title: 'Schedule Preferences',
            component: ScheduleForm,
            initialData: { DaysPerWeekDesired: userFitnessProfile?.DaysPerWeekDesired },
        },
        {
            title: 'Equipment Access',
            component: EquipmentForm,
            initialData: { AccessToEquipment: userFitnessProfile?.AccessToEquipment },
        },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <SignupWizard
                steps={wizardSteps}
                onComplete={handleComplete}
                IntroScreen={ProgramRecommenderIntro}
                submitText={userFitnessProfile ? 'Update Preferences' : 'Get Plan'}
                initialData={userFitnessProfile || {}}
            />
            <AutoDismissSuccessModal
                visible={showSuccessModal}
                onDismiss={handleSuccessModalDismiss}
                title='Perfect Match!'
                message={
                    userFitnessProfile
                        ? "We've updated your program based on your new preferences."
                        : "We've found your ideal program based on your preferences."
                }
                duration={2000}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ProgramRecommenderWizardScreen;
