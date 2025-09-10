// app/(app)/onboarding/goal/macro-summary.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha } from '@/utils/colorUtils';
import { calculateMacroGrams, type PrimaryFitnessGoalType } from '@/utils/nutrition';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

export default function MacroSummaryScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const params = useLocalSearchParams();

    const primaryGoal = params.PrimaryFitnessGoal as PrimaryFitnessGoalType;

    // Use override TDEE if available, otherwise use the calculated TDEE
    const isCaloriesOverridden = params.IsCaloriesOverridden === 'true';
    const overrideTDEE = params.OverrideTDEE ? parseFloat(params.OverrideTDEE as string) : null;
    const calculatedTDEE = params.calculatedTDEE ? parseFloat(params.calculatedTDEE as string) : null;
    const regularTDEE = params.TDEE ? parseFloat(params.TDEE as string) : 2000;
    const goalCaloriesParam = params.GoalCalories ? parseFloat(params.GoalCalories as string) : null;

    // Priority for calories: GoalCalories > OverrideTDEE > calculatedTDEE > TDEE > default
    const goalCalories = goalCaloriesParam || (isCaloriesOverridden && overrideTDEE ? overrideTDEE : calculatedTDEE || regularTDEE);

    // Get current weight in kg for macro calculations
    const currentWeightKg = params.weightKg ? parseFloat(params.weightKg as string) : 70;

    const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

    // Calculate macros on component mount
    useEffect(() => {
        const calculatedValue = calculateMacroGrams(goalCalories, primaryGoal, currentWeightKg);
        setMacros(calculatedValue);
    }, [goalCalories, primaryGoal, currentWeightKg]);

    const handleNext = () => {
        router.push({
            pathname: '/(app)/onboarding/training/intro',
            params: {
                ...(params as Record<string, string>),
                Protein: macros.protein.toString(),
                Carbs: macros.carbs.toString(),
                Fat: macros.fat.toString(),
            },
        });
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader sectionName='Macro Targets' onBackPress={handleBack} disableColorChange={true} headerBackground={themeColors.background} />

            <ThemedView style={styles.content}>
                <ThemedText type='body' style={styles.subtitle}>
                    These targets are optimized for your fitness goal and will help you achieve the best results
                </ThemedText>

                {/* Calorie Banner */}
                <ThemedView style={[styles.calorieCard, { backgroundColor: addAlpha(themeColors.text, 0.9) }]}>
                    <View style={styles.calorieContent}>
                        <View style={styles.calorieInfo}>
                            <ThemedText type='titleXLarge' style={[styles.calorieValue, { color: themeColors.background }]}>
                                {goalCalories} calories
                            </ThemedText>
                            <ThemedText type='caption' style={[{ color: addAlpha(themeColors.background, 0.8) }]}>
                                daily target for your goal
                            </ThemedText>
                        </View>
                    </View>
                </ThemedView>

                {/* Macro Cards */}
                <View style={styles.macroCardsContainer}>
                    <ThemedView style={[styles.macroCard, { backgroundColor: themeColors.tipBackground }]}>
                        <ThemedText type='titleLarge' style={styles.macroValue}>
                            {macros.protein}g
                        </ThemedText>
                        <View style={styles.macroHeader}>
                            <ThemedText type='buttonSmall'>Protein</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.macroCard, { backgroundColor: themeColors.redTransparent }]}>
                        <ThemedText type='titleLarge' style={styles.macroValue}>
                            {macros.fat}g
                        </ThemedText>
                        <View style={styles.macroHeader}>
                            <ThemedText type='buttonSmall'>Fat</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.macroCard, { backgroundColor: themeColors.tangerineTransparent }]}>
                        <ThemedText type='titleLarge' style={styles.macroValue}>
                            {macros.carbs}g
                        </ThemedText>
                        <View style={styles.macroHeader}>
                            <ThemedText type='buttonSmall'>Carbs</ThemedText>
                        </View>
                    </ThemedView>
                </View>

                {/* What's Next Section */}
                <ThemedText type='title' style={styles.whatsNextTitle}>
                    What happens next?
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.whatsNextDescription}>
                    As you log your meals and progress, we&apos;ll learn your body&apos;s patterns and adjust your targets to keep you moving toward your goal
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Continue' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} />
            </ThemedView>
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
    calorieCard: {
        padding: Spaces.LG,
        borderRadius: Spaces.XS,
        marginBottom: Spaces.MD,
    },
    calorieContent: {
        flexDirection: 'row',
    },
    calorieInfo: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    calorieValue: {},
    macroCardsContainer: {
        flexDirection: 'row',
        gap: Spaces.SM,
        marginBottom: Spaces.LG,
    },
    macroCard: {
        flex: 1,
        padding: Spaces.MD,
        borderRadius: Spaces.XS,
        minHeight: 90,
    },
    macroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spaces.SM,
    },
    macroValue: {
        textAlign: 'left',
    },
    whatsNextTitle: { marginTop: Spaces.MD, marginBottom: Spaces.SM },
    whatsNextDescription: {},
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
