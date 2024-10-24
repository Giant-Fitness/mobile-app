// app/programs/program-recommender-wizard.tsx

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { SignupWizard } from '@/components/onboarding/SignupWizard';
import { WorkoutGoalsForm, ExperienceForm, EquipmentForm, ScheduleForm } from '@/components/onboarding/fitness/FitnessWizardForms';
import { ProgramRecommenderIntro } from '@/components/onboarding/fitness/ProgramRecommenderIntro';

const ProgramRecommenderWizardScreen = () => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleComplete = (data) => {
        console.log('Wizard completed with data:', data);
        router.replace('/(tabs)/programs');
        // Process the completed form data
        // e.g., send to API, update user profile, etc.
    };

    const wizardSteps = [
        { title: 'Workout Goals', component: WorkoutGoalsForm },
        { title: 'Experience Level', component: ExperienceForm },
        { title: 'Schedule Preferences', component: ScheduleForm },
        { title: 'Equipment Access', component: EquipmentForm },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <SignupWizard steps={wizardSteps} onComplete={handleComplete} IntroScreen={ProgramRecommenderIntro} />
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
