// app/programs/program-recommender-wizard.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';

import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SignupWizard } from '@/components/onboarding/SignupWizard';
import { WorkoutGoalsForm, ExperienceForm, EquipmentForm, ScheduleForm } from '@/components/onboarding/fitness/FitnessWizardForms';
import { ProgramRecommenderIntro } from '@/components/onboarding/fitness/ProgramRecommenderIntro';
import { updateUserFitnessProfileAsync } from '@/store/user/thunks';
import { AutoDismissSuccessModal } from '@/components/overlays/AutoDismissSuccessModal';
import { AppDispatch } from '@/store/store';

const ProgramRecommenderWizardScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Hide header immediately on mount
        const hideHeader = () => {
            navigation.setOptions({
                headerShown: false,
                // Add any other header options you want to override
            });
        };

        // Run immediately and after a small delay to ensure it takes effect
        hideHeader();
        const timer = setTimeout(hideHeader, 1);

        return () => {
            clearTimeout(timer);
            // Optionally restore header on unmount if needed
            navigation.setOptions({ headerShown: true });
        };
    }, [navigation]);

    const handleComplete = async (data: any) => {
        try {
            const result = await dispatch(updateUserFitnessProfileAsync({ userFitnessProfile: data })).unwrap();

            if (result.user && result.userRecommendations && result.userFitnessProfile) {
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Failed to update fitness profile:', error);
            // Handle error case
        }
    };

    const handleSuccessModalDismiss = () => {
        setShowSuccessModal(false);
        router.replace('/(tabs)/programs');
    };

    const wizardSteps = [
        { title: 'Workout Goals', component: WorkoutGoalsForm },
        { title: 'Experience Level', component: ExperienceForm },
        { title: 'Schedule Preferences', component: ScheduleForm },
        { title: 'Equipment Access', component: EquipmentForm },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <SignupWizard steps={wizardSteps} onComplete={handleComplete} IntroScreen={ProgramRecommenderIntro} submitText='Get Plan' />
            <AutoDismissSuccessModal
                visible={showSuccessModal}
                onDismiss={handleSuccessModalDismiss}
                title='Perfect Match!'
                message="We've found your ideal program based on your preferences."
                duration={2000}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
    startButton: {},
    mainContainer: {
        marginTop: Spaces.LG,
    },
    descriptionContainer: {
        paddingHorizontal: Spaces.LG,
        marginTop: Spaces.XL,
        paddingTop: Spaces.XL,
        paddingBottom: Spaces.XL,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL,
        marginBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
    bottomButtonContainer: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: '20%',
        marginBottom: Spaces.XXXL,
        paddingBottom: Spaces.XXXL,
    },
    calendarButton: {
        width: '100%',
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: Spaces.MD,
    },
});

export default ProgramRecommenderWizardScreen;
