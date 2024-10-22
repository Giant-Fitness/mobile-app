// components/onboarding/fitness/FitnessWizardForms.tsx

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { Spaces } from '@/constants/Spaces';

export const WorkoutGoalsForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [goal, setGoal] = useState(formData.goal || '');

    const goalOptions = [
        { key: 'lose-weight', text: 'Lose Weight' },
        { key: 'build-muscle', text: 'Build Muscle' },
        { key: 'increase-strength', text: 'Increase Strength' },
        { key: 'overall-fitness', text: 'Improve Overall Fitness' },
    ];

    useEffect(() => {
        onValidityChange(!!goal);
    }, [goal, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (goal) {
                onSubmit({ goal });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What is your primary fitness goal?
            </ThemedText>
            <SelectionGroup options={goalOptions} selectedKeys={[goal]} onSelect={(key) => setGoal(key)} multiSelect={false} />
        </View>
    );
});

export const ExperienceForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [experience, setExperience] = useState(formData.experience || '');

    const experienceOptions = [
        { key: 'beginner', text: 'Beginner', subText: 'New to working out or less than 1 year of experience' },
        { key: 'intermediate', text: 'Intermediate', subText: '1–3 years of consistent training' },
        { key: 'advanced', text: 'Advanced', subText: 'More than 3 years of consistent training' },
    ];

    useEffect(() => {
        onValidityChange(!!experience);
    }, [experience, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (experience) {
                onSubmit({ experience });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What is your current experience level with working out?
            </ThemedText>
            <SelectionGroup options={experienceOptions} selectedKeys={[experience]} onSelect={(key) => setExperience(key)} multiSelect={false} />
        </View>
    );
});

export const ScheduleForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [schedule, setSchedule] = useState(formData.schedule || '');

    const scheduleOptions = [
        { key: 'twothree', text: '2–3 days a week' },
        { key: 'fourfive', text: '4–5 days a week' },
        { key: 'sixseven', text: '6–7 days a week' },
    ];

    useEffect(() => {
        onValidityChange(!!schedule);
    }, [schedule, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (schedule) {
                onSubmit({ schedule });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                How many days per week can you commit to training?
            </ThemedText>
            <SelectionGroup options={scheduleOptions} selectedKeys={[schedule]} onSelect={(key) => setSchedule(key)} multiSelect={false} />
        </View>
    );
});

export const EquipmentForm = forwardRef(({ formData, onSubmit, onValidityChange }, ref) => {
    const [equipment, setEquipment] = useState(formData.equipment || '');

    const equipmentOptions = [
        { key: 'none', text: 'No Equipment', subText: 'Bodyweight workouts you can do anywhere' },
        { key: 'basic', text: 'Basic Equipment', subText: 'Free weights like dumbbells or kettlebells' },
        { key: 'full', text: 'Full Gym Access', subText: 'Access to a gym with a variety of equipment' },
    ];

    useEffect(() => {
        onValidityChange(!!equipment);
    }, [equipment, onValidityChange]);

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (equipment) {
                onSubmit({ equipment });
            }
        },
    }));

    return (
        <View style={styles.formContainer}>
            <ThemedText type='bodyMedium' style={styles.question}>
                What equipment do you have available for your workouts?
            </ThemedText>
            <SelectionGroup options={equipmentOptions} selectedKeys={[equipment]} onSelect={(key) => setEquipment(key)} multiSelect={false} />
        </View>
    );
});

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
