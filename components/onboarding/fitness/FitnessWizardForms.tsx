// components/onboarding/fitness/FitnessWizardForms.tsx

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { Spaces } from '@/constants/Spaces';

export const WorkoutGoalsForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [PrimaryFitnessGoal, setPrimaryFitnessGoal] = useState(formData.PrimaryFitnessGoal || '');

    const goalOptions = [
        { key: 'lose-weight', text: 'Lose Weight' },
        { key: 'build-muscle', text: 'Build Muscle' },
        { key: 'increase-strength', text: 'Increase Strength' },
        { key: 'overall-fitness', text: 'Improve Overall Fitness' },
    ];

    useEffect(() => {
        onValidityChange(!!PrimaryFitnessGoal);
    }, [PrimaryFitnessGoal, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (PrimaryFitnessGoal) {
                onSubmit({ PrimaryFitnessGoal });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What is your primary fitness goal?
            </ThemedText>
            <SelectionGroup options={goalOptions} selectedKeys={[PrimaryFitnessGoal]} onSelect={(key) => setPrimaryFitnessGoal(key)} multiSelect={false} />
        </View>
    );
});
WorkoutGoalsForm.displayName = 'WorkoutGoalsForm';

export const ExperienceForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [GymExperienceLevel, setGymExperienceLevel] = useState(formData.GymExperienceLevel || '');

    const experienceOptions = [
        { key: 'beginner', text: 'Beginner', subText: 'New to working out or less than 1 year of experience' },
        { key: 'intermediate', text: 'Intermediate', subText: '1–3 years of consistent training' },
        { key: 'advanced', text: 'Advanced', subText: 'More than 3 years of consistent training' },
    ];

    useEffect(() => {
        onValidityChange(!!GymExperienceLevel);
    }, [GymExperienceLevel, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (GymExperienceLevel) {
                onSubmit({ GymExperienceLevel });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What is your current experience level with working out?
            </ThemedText>
            <SelectionGroup
                options={experienceOptions}
                selectedKeys={[GymExperienceLevel]}
                onSelect={(key) => setGymExperienceLevel(key)}
                multiSelect={false}
            />
        </View>
    );
});
ExperienceForm.displayName = 'ExperienceForm';

export const ScheduleForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [DaysPerWeekDesired, setDaysPerWeekDesired] = useState(formData.DaysPerWeekDesired || '');

    const scheduleOptions = [
        { key: 'twothree', text: '2–3 days a week' },
        { key: 'fourfive', text: '4–5 days a week' },
        { key: 'sixseven', text: '6–7 days a week' },
    ];

    useEffect(() => {
        onValidityChange(!!DaysPerWeekDesired);
    }, [DaysPerWeekDesired, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (DaysPerWeekDesired) {
                onSubmit({ DaysPerWeekDesired });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                How many days per week can you commit to training?
            </ThemedText>
            <SelectionGroup options={scheduleOptions} selectedKeys={[DaysPerWeekDesired]} onSelect={(key) => setDaysPerWeekDesired(key)} multiSelect={false} />
        </View>
    );
});
ScheduleForm.displayName = 'ScheduleForm';

export const EquipmentForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [AccessToEquipment, setAccessToEquipment] = useState(formData.AccessToEquipment || '');

    const equipmentOptions = [
        { key: 'none', text: 'No Equipment', subText: 'Bodyweight workouts you can do anywhere' },
        { key: 'basic', text: 'Basic Equipment', subText: 'Free weights like dumbbells or kettlebells' },
        { key: 'full', text: 'Full Gym Access', subText: 'Access to a gym with a variety of equipment' },
    ];

    useEffect(() => {
        onValidityChange(!!AccessToEquipment);
    }, [AccessToEquipment, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (AccessToEquipment) {
                onSubmit({ AccessToEquipment });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What equipment do you have available for your workouts?
            </ThemedText>
            <SelectionGroup options={equipmentOptions} selectedKeys={[AccessToEquipment]} onSelect={(key) => setAccessToEquipment(key)} multiSelect={false} />
        </View>
    );
});
EquipmentForm.displayName = 'EquipmentForm';

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        padding: Spaces.MD,
    },
    question: {
        marginBottom: Spaces.XL,
        textAlign: 'center',
    },
});
