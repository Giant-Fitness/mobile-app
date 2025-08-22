// app/(app)/onboarding/complete.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch } from '@/store/store';
import { completeUserProfileAsync } from '@/store/user/thunks';
import { CompleteProfileParams } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Vibration, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useFocusEffect } from '@react-navigation/native';

import { usePostHog } from 'posthog-react-native';
import { useDispatch } from 'react-redux';

export default function OnboardingCompleteScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const posthog = usePostHog();
    const params = useLocalSearchParams();

    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataSubmitted, setDataSubmitted] = useState(false);

    useEffect(() => {
        // Auto-submit data when component mounts
        handleDataSubmission();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // Reset animation values
            slideAnim.setValue(50);
            fadeAnim.setValue(0);

            // Start animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]).start();

            Vibration.vibrate(400);

            // Set up navigation timer
            const timer = setTimeout(() => {
                router.replace('/(app)/(tabs)/home');
            }, 3000);

            // Clean up function
            return () => clearTimeout(timer);
        }, [slideAnim, fadeAnim, router]),
    );

    const handleDataSubmission = async () => {
        if (isSubmitting || dataSubmitted) return;

        setIsSubmitting(true);
        try {
            // Format all collected onboarding data for the completeUserProfileAsync thunk
            const profileData: CompleteProfileParams = {
                // Basic biodata
                Height: parseFloat(params.Height as string), // Height in centimeters
                Gender: params.Gender as string,
                DOB: params.Dob as string, // ISO date string from formatDateForStorage
                Weight: parseFloat(params.weightKg as string), // Weight in kilograms (converted from display units)
                ActivityLevel: params.ActivityLevel as string, // 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active'

                // Fitness goals
                PrimaryFitnessGoal: params.PrimaryFitnessGoal as string, // 'lose-fat' | 'build-muscle' | 'body-recomposition' | 'maintain-fitness'

                // Weight goals (optional - only for weight loss/gain goals)
                TargetWeight: params.GoalWeight ? parseFloat(params.GoalWeight as string) : undefined, // Target weight in display units
                WeightChangeRate: params.WeightChangeRate ? parseFloat(params.WeightChangeRate as string) : undefined, // Weekly change percentage

                // TDEE Override options (from TDEE summary screen)
                OverrideTDEE: params.OverrideTDEE ? parseInt(params.OverrideTDEE as string) : undefined,
                IsCaloriesOverridden: (params.IsCaloriesOverridden as string) || 'false', // 'true' | 'false'

                // Training preferences
                GymExperienceLevel: params.GymExperienceLevel as string, // 'beginner' | 'intermediate' | 'advanced'
                DaysPerWeekDesired: params.DaysPerWeekDesired as string, // 'twothree' | 'fourfive' | 'sixseven'
                AccessToEquipment: params.AccessToEquipment as string, // 'none' | 'basic' | 'full'

                // Unit preferences (for display and future reference)
                BodyMeasurementUnits: params.heightUnit as string, // 'cms' | 'inches'
                BodyWeightUnits: params.weightUnit as string, // 'kgs' | 'lbs'
            };

            // Submit all data via the thunk
            await dispatch(completeUserProfileAsync(profileData));

            // Track completion
            posthog.capture('onboarding_completed', {
                success: true,
                screen: 'onboarding-complete',
                primary_goal: profileData.PrimaryFitnessGoal,
                experience_level: profileData.GymExperienceLevel,
                days_per_week: profileData.DaysPerWeekDesired,
                equipment_access: profileData.AccessToEquipment,
            });

            setDataSubmitted(true);
        } catch (error: any) {
            console.error('Failed to complete onboarding:', error);
            posthog.capture('onboarding_error', {
                success: false,
                error_message: error.message,
                screen: 'onboarding-complete',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.splashBackgroud }]}>
            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <ThemedText type='headlineLarge' style={[styles.text, { color: themeColors.white }]}>
                    All Set! Time to put your plan into action.
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textContainer: {
        paddingTop: Sizes.bottomSpaceLarge,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: Spaces.XL,
        paddingRight: Spaces.XXL * 2,
    },
    text: {
        textAlign: 'left',
    },
});
