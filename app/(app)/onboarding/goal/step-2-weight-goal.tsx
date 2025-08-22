// app/(app)/onboarding/goal/step-2-weight-goal.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha, darkenColor } from '@/utils/colorUtils';
import {
    calculateGoalCaloriesAndTimeline,
    getApproachLabel,
    getBestPracticeWeeklyChange,
    getInitialGoalWeight,
    getRecommendedRange,
    getSliderRange,
    getWeightOptions,
    type PrimaryFitnessGoalType,
    type WeightUnitType,
} from '@/utils/nutrition';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useSharedValue } from 'react-native-reanimated';

export default function WeightGoalStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const primaryGoal = params.PrimaryFitnessGoal as PrimaryFitnessGoalType;
    const existingUnit = (params.weightUnit as WeightUnitType) || 'kgs';
    const currentWeight = parseFloat(params.Weight as string) || (existingUnit === 'kgs' ? 70 : 154);

    // Use override TDEE if available, otherwise use the calculated TDEE
    const isCaloriesOverridden = params.IsCaloriesOverridden === 'true';
    const overrideTDEE = params.OverrideTDEE ? parseFloat(params.OverrideTDEE as string) : null;
    const calculatedTDEE = params.calculatedTDEE ? parseFloat(params.calculatedTDEE as string) : null;
    const regularTDEE = params.TDEE ? parseFloat(params.TDEE as string) : 2000;

    // Priority: OverrideTDEE > calculatedTDEE > TDEE > default
    const TDEE = isCaloriesOverridden && overrideTDEE ? overrideTDEE : calculatedTDEE || regularTDEE;

    const [goalWeight, setGoalWeight] = useState(getInitialGoalWeight(currentWeight, primaryGoal, existingUnit));
    const [weeklyChangePercent, setWeeklyChangePercent] = useState(getBestPracticeWeeklyChange(primaryGoal));

    const recommendedRange = getRecommendedRange(primaryGoal);

    // Calculate projected date and goal calories
    const calculateProjectedDate = (): string => {
        const weightDifference = Math.abs(goalWeight - currentWeight);
        const weeklyChange = (currentWeight * weeklyChangePercent) / 100;
        const weeksToGoal = weightDifference / weeklyChange;

        const projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + weeksToGoal * 7);

        return projectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const projectedDate = calculateProjectedDate();
    const weightOptions = getWeightOptions(currentWeight, primaryGoal, existingUnit);
    const sliderRange = getSliderRange(primaryGoal);

    // Initialize from params if returning to this screen
    useEffect(() => {
        if (params.GoalWeight) {
            setGoalWeight(Number(params.GoalWeight));
        }
        if (params.WeightChangeRate) {
            setWeeklyChangePercent(Number(params.WeightChangeRate));
        }
    }, [params.GoalWeight, params.WeightChangeRate]);

    // Get question text based on primary goal
    const getQuestionText = () => {
        switch (primaryGoal) {
            case 'lose-fat':
                return 'What is your target weight?';
            case 'build-muscle':
                return 'What weight do you want to reach?';
            case 'body-recomposition':
                return 'What is your goal weight?';
            default:
                return 'What is your target weight?';
        }
    };

    // Check if we need the slider (not for maintenance goals)
    const needsSlider = primaryGoal !== 'maintain-fitness' && primaryGoal !== 'body-recomposition';

    // Get sign for display
    const getWeightChangeSign = () => {
        if (primaryGoal === 'lose-fat') return '-';
        if (primaryGoal === 'build-muscle') return '+';
        return ''; // For recomp/maintain
    };

    // Calculate results using the utility function (now with correct TDEE)
    const { goalCalories } = calculateGoalCaloriesAndTimeline(currentWeight, goalWeight, weeklyChangePercent, primaryGoal, TDEE, existingUnit);

    // Get badge background color
    const getBadgeBackgroundColor = () => {
        const approach = getApproachLabel(weeklyChangePercent, primaryGoal);
        switch (approach) {
            case 'Standard':
                return themeColors.primary;
            case 'Aggressive':
                return themeColors.red;
            case 'Conservative':
                return darkenColor(themeColors.warning, 0.05);
            default:
                return themeColors.text;
        }
    };

    const handleNext = () => {
        const goalWeightInKg = existingUnit === 'kgs' ? goalWeight : goalWeight / 2.20462;

        router.push({
            pathname: '/(app)/onboarding/goal/macro-summary',
            params: {
                ...(params as Record<string, string>),
                GoalWeight: goalWeight.toString(),
                goalWeightKg: goalWeightInKg.toString(),
                WeightChangeRate: weeklyChangePercent.toString(),
                GoalCalories: goalCalories.toString(),
            },
        });
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Goal'
                currentStep={2}
                totalSteps={2}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    {getQuestionText()}
                </ThemedText>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={goalWeight}
                        style={[styles.picker, { color: themeColors.text }]}
                        onValueChange={setGoalWeight}
                        itemStyle={{ color: themeColors.text }}
                    >
                        {weightOptions.map((option) => (
                            <Picker.Item key={option.value} label={option.label} value={option.value} />
                        ))}
                    </Picker>
                </View>

                {/* Only show rate slider for weight loss/gain goals */}
                {needsSlider && (
                    <View style={styles.sliderSection}>
                        <ThemedText type='titleLarge' style={styles.sliderTitle}>
                            How fast do you want to progress?
                        </ThemedText>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <ThemedText type='bodySmall'>
                                    <ThemedText type='buttonSmall'>
                                        {getWeightChangeSign()} {((currentWeight * weeklyChangePercent) / 100).toFixed(2)} {existingUnit.slice(0, -1)}
                                    </ThemedText>{' '}
                                    per week ({weeklyChangePercent.toFixed(2)}%)
                                </ThemedText>
                                <View style={[styles.approachBadge, { backgroundColor: getBadgeBackgroundColor() }]}>
                                    <ThemedText type='caption' style={{ color: themeColors.background }}>
                                        {getApproachLabel(weeklyChangePercent, primaryGoal)}
                                    </ThemedText>
                                </View>
                            </View>
                            {/* Custom slider with colored track and step markers */}
                            <View style={styles.customSliderContainer}>
                                {/* Track background */}
                                <View style={[styles.sliderTrack, { backgroundColor: themeColors.systemBorderColor }]}>
                                    {/* Recommended range highlight */}
                                    <View
                                        style={[
                                            styles.recommendedRange,
                                            {
                                                backgroundColor: themeColors.primary,
                                                left: `${((recommendedRange.min - sliderRange.min) / (sliderRange.max - sliderRange.min)) * 100}%`,
                                                width: `${((recommendedRange.max - recommendedRange.min) / (sliderRange.max - sliderRange.min)) * 100}%`,
                                            },
                                        ]}
                                    />
                                </View>

                                {/* Actual slider (transparent track) */}
                                <Slider
                                    style={styles.slider}
                                    minimumValue={sliderRange.min}
                                    maximumValue={sliderRange.max}
                                    value={weeklyChangePercent}
                                    onValueChange={setWeeklyChangePercent}
                                    step={0.05}
                                    minimumTrackTintColor='transparent'
                                    maximumTrackTintColor='transparent'
                                    thumbTintColor={themeColors.tipIcon}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Goal Summary Cards */}
                <View style={styles.goalSummaryContainer}>
                    <ThemedView style={[styles.goalCard, { backgroundColor: addAlpha(themeColors.text, 0.8) }]}>
                        <ThemedText type='titleLarge' style={[styles.goalCardValue, { color: themeColors.background }]}>
                            {goalCalories} cals
                        </ThemedText>
                        <ThemedText type='caption' style={[styles.goalCardLabel, { color: addAlpha(themeColors.background, 0.7) }]}>
                            Daily calorie intake
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.goalCard, { backgroundColor: addAlpha(themeColors.text, 0.1) }]}>
                        <ThemedText type='titleLarge' style={[styles.goalCardValue, { color: themeColors.text }]}>
                            {projectedDate}
                        </ThemedText>
                        <ThemedText type='caption' style={[styles.goalCardLabel, { color: addAlpha(themeColors.text, 0.7) }]}>
                            Target Date
                        </ThemedText>
                    </ThemedView>
                </View>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Next' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} />
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
        paddingHorizontal: Spaces.LG,
        paddingBottom: 0,
    },
    question: {
        paddingTop: Spaces.MD,
        textAlign: 'left',
    },
    pickerContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    picker: {
        width: '100%',
        height: 180,
    },
    sliderSection: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.LG,
    },
    sliderTitle: {
        textAlign: 'left',
        marginBottom: Spaces.SM + Spaces.XS,
    },
    sliderContainer: {},
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spaces.SM,
        marginBottom: Spaces.SM,
    },
    approachBadge: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.XS,
    },
    customSliderContainer: {
        position: 'relative',
        height: 40,
        marginBottom: Spaces.XS,
    },
    sliderTrack: {
        position: 'absolute',
        top: 17,
        left: 0,
        right: 0,
        height: 4,
        borderRadius: 3,
    },
    recommendedRange: {
        position: 'absolute',
        top: 0,
        height: '100%',
        borderRadius: 3,
        opacity: 0.8,
    },
    slider: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 20,
    },
    goalSummaryContainer: {
        flexDirection: 'row',
        gap: Spaces.SM,
        paddingBottom: Spaces.XL,
    },
    goalCard: {
        flex: 1,
        padding: Spaces.MD,
        borderRadius: Spaces.XS,
        minHeight: 80,
    },
    goalCardLabel: {
        marginBottom: Spaces.XS,
    },
    goalCardValue: {
        textAlign: 'left',
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
