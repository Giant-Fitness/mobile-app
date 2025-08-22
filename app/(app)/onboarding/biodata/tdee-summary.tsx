// app/(app)/onboarding/tdee-summary.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { CalorieEditSheet } from '@/components/onboarding/CalorieEditSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha } from '@/utils/colorUtils';
import { calculateTDEE } from '@/utils/nutrition';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useSharedValue } from 'react-native-reanimated';

export default function TDEESummaryScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const [calculatedTDEE, setCalculatedTDEE] = useState(0);
    const [adjustedTDEE, setAdjustedTDEE] = useState(0);
    const [isOverridden, setIsOverridden] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Calculate TDEE on component mount or when relevant params change
    useEffect(() => {
        const biodataForCalculation = {
            Gender: params.Gender as string,
            Dob: params.Dob as string,
            Height: parseFloat(params.Height as string),
            Weight: parseFloat(params.weightKg as string),
            ActivityLevel: params.ActivityLevel as string,
        };

        const calculatedValue = calculateTDEE(biodataForCalculation);
        setCalculatedTDEE(calculatedValue);

        // Check if there's an override from URL params (when returning from next screen)
        const overrideTDEE = params.OverrideTDEE ? parseFloat(params.OverrideTDEE as string) : null;
        const isCaloriesOverridden = params.IsCaloriesOverridden === 'true';
        const existingTDEE = params.TDEE ? parseFloat(params.TDEE as string) : null;

        if (overrideTDEE && isCaloriesOverridden) {
            setAdjustedTDEE(overrideTDEE);
            setIsOverridden(true);
        } else if (existingTDEE && existingTDEE !== calculatedValue) {
            setAdjustedTDEE(existingTDEE);
            setIsOverridden(true);
        } else {
            setAdjustedTDEE(calculatedValue);
            setIsOverridden(false);
        }
    }, [params.Gender, params.Dob, params.Height, params.weightKg, params.ActivityLevel, params.OverrideTDEE, params.IsCaloriesOverridden, params.TDEE]);

    const handleCaloriesEdit = (newCalories: number, isOverride: boolean) => {
        setAdjustedTDEE(newCalories);
        setIsOverridden(isOverride);
    };

    const handleEditCalories = () => {
        setShowEditModal(true);
    };

    const handleNext = () => {
        router.push({
            pathname: '/(app)/onboarding/goal/step-1-primary-goal',
            params: {
                ...(params as Record<string, string>),
                TDEE: adjustedTDEE.toString(),
                calculatedTDEE: calculatedTDEE.toString(),
                // Pass override information to backend
                OverrideTDEE: isOverridden ? adjustedTDEE.toString() : undefined,
                IsCaloriesOverridden: isOverridden.toString(),
            },
        });
    };

    const handleBack = () => {
        router.back();
    };

    const getSubtextContent = () => {
        if (isOverridden) {
            return 'custom daily calorie target';
        }
        return 'to maintain your weight';
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Daily Calories Needed'
                onBackPress={handleBack}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='body' style={styles.subtitle}>
                    {isOverridden
                        ? "You've customized your daily calorie needs based on your personal knowledge."
                        : "Here's how many calories your body burns in a typical day, including exercise and daily activities."}
                </ThemedText>

                {/* TDEE Result */}
                <ThemedView style={[styles.tdeeCard, { backgroundColor: addAlpha(themeColors.text, 0.8) }]}>
                    <View style={styles.calorieContent}>
                        <View style={styles.calorieInfo}>
                            <ThemedText type='titleXLarge' style={[styles.tdeeValue, { color: themeColors.background }]}>
                                {adjustedTDEE} calories
                            </ThemedText>
                            <ThemedText type='caption' style={[{ color: addAlpha(themeColors.background, 0.8) }]}>
                                {getSubtextContent()}
                            </ThemedText>
                        </View>

                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: addAlpha(themeColors.background, 0.1) }]}
                            onPress={handleEditCalories}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.7}
                        >
                            <Icon name='edit' color={addAlpha(themeColors.background, 0.6)} size={16} />
                        </TouchableOpacity>
                    </View>
                </ThemedView>

                <ThemedText type='caption' style={[styles.adjustmentNote, { color: addAlpha(themeColors.text, 0.6) }]}>
                    {isOverridden
                        ? "You've set a custom calorie target. Tap edit to adjust or reset to the calculated value."
                        : 'Know your calorie needs better? Tap the edit button to adjust this number.'}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Continue' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} />
            </ThemedView>

            {/* Edit Modal */}
            <CalorieEditSheet
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentCalories={adjustedTDEE}
                calculatedTDEE={calculatedTDEE}
                onSave={handleCaloriesEdit}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight + Spaces.XL,
    },
    content: {
        flex: 1,
        padding: Spaces.LG,
        paddingBottom: 0,
    },
    subtitle: {
        paddingHorizontal: Spaces.SM,
        marginBottom: Spaces.LG,
        textAlign: 'left',
    },
    tdeeCard: {
        padding: Spaces.LG,
        borderRadius: Spaces.XS,
        marginBottom: Spaces.MD,
    },
    calorieContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    calorieInfo: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    tdeeValue: {},
    editButton: {
        width: 35,
        height: 35,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spaces.MD,
    },
    adjustmentNote: {
        textAlign: 'center',
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.LG,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL,
        paddingTop: Spaces.MD,
        backgroundColor: 'transparent',
    },
    continueButton: {
        width: '100%',
    },
});
