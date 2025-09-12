// components/nutrition/DailyMacrosCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserNutritionGoal, UserNutritionLog } from '@/types';
import { addAlpha, darkenColor } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

import { Icon } from '../base/Icon';
import { CircularProgress } from '../charts/CircularProgress';

const { width: screenWidth } = Dimensions.get('window');

interface DailyMacrosCardProps {
    style?: any;
    isOnboardingComplete?: boolean;
    nutritionGoal?: UserNutritionGoal | null;
    nutritionLog?: UserNutritionLog | null;
}

// Fake data for preview mode
const PREVIEW_GOALS: any = {
    GoalCalories: 2200,
    GoalMacros: {
        Protein: 150,
        Carbs: 220,
        Fat: 75,
    },
};

const PREVIEW_CONSUMED = {
    calories: 1850,
    protein: 110,
    carbs: 80,
    fats: 40,
};

interface MacroMeterProps {
    label: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
    backgroundColor: string;
    overageColor: string;
}

const MacroMeter: React.FC<MacroMeterProps> = ({ label, current, goal, unit, color, backgroundColor, overageColor }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const remaining = goal - current;
    const isOverGoal = current > goal;

    return (
        <View style={styles.macroMeter}>
            <ThemedText type='buttonSmall' style={styles.macroLabel}>
                {label}
            </ThemedText>
            <CircularProgress
                current={current}
                goal={goal}
                color={color}
                size={110}
                strokeWidth={8}
                arcAngle={360}
                showContent={true}
                backgroundColor={backgroundColor}
                overageColor={overageColor}
            >
                <ThemedText type='bodyMedium' style={[{ color: themeColors.text }]}>
                    {Math.round(current)}
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.macroGoalValue}>
                    /{goal}
                    {unit}
                </ThemedText>
            </CircularProgress>
            <View style={styles.macroInfo}>
                <ThemedText type='bodySmall' style={styles.macroRemainingValue}>
                    {isOverGoal ? Math.abs(remaining) : remaining}
                    {unit} {isOverGoal ? 'over' : 'left'}
                </ThemedText>
            </View>
        </View>
    );
};

const DotIndicator: React.FC<{ isActive: boolean; color: string; backgroundColor: string }> = ({ isActive, color, backgroundColor }) => {
    return (
        <View
            style={[
                styles.dot,
                {
                    backgroundColor: isActive ? color : backgroundColor,
                },
            ]}
        />
    );
};

export const DailyMacrosCard: React.FC<DailyMacrosCardProps> = ({ style, isOnboardingComplete = true, nutritionGoal, nutritionLog }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollViewRef = useRef<ScrollView>(null);

    // Set initial page based on onboarding status: show macros (page 1) first during onboarding
    const [currentPage, setCurrentPage] = useState(isOnboardingComplete ? 0 : 1);

    // Use preview data if not onboarded or no profile
    const nutritionGoals = isOnboardingComplete ? nutritionGoal : PREVIEW_GOALS;

    // Calculate consumed values from nutrition log
    const consumedValues = useMemo(() => {
        if (!nutritionLog || !nutritionLog.DailyTotals) {
            // Return zeros if no log data
            if (isOnboardingComplete) {
                return {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                };
            }
            // Return preview data if not onboarded
            return PREVIEW_CONSUMED;
        }

        const { DailyTotals } = nutritionLog;
        return {
            calories: Math.round(DailyTotals.Calories || 0),
            protein: Math.round(DailyTotals.Protein || 0),
            carbs: Math.round(DailyTotals.Carbs || 0),
            fats: Math.round(DailyTotals.Fats || 0),
        };
    }, [nutritionLog, isOnboardingComplete]);

    // Scroll to initial page when component mounts or onboarding status changes
    useEffect(() => {
        if (scrollViewRef.current) {
            const initialPage = isOnboardingComplete ? 0 : 1;
            scrollViewRef.current.scrollTo({ x: initialPage * screenWidth, animated: false });
            setCurrentPage(initialPage);
        }
    }, [isOnboardingComplete]);

    if (!nutritionGoals) {
        return null;
    }

    const { calories: consumedCalories, protein: consumedProtein, carbs: consumedCarbs, fats: consumedFats } = consumedValues;

    const remaining = nutritionGoals.GoalCalories - consumedCalories;
    const isOverGoal = consumedCalories > nutritionGoals.GoalCalories;

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentPage(pageIndex);
    };

    const handleCardPress = () => {
        // Navigate to food log screen
        trigger('impactLight');
        router.push('/(app)/(tabs)/food-log');
    };

    const CaloriesView = () => (
        <TouchableOpacity style={[styles.pageContainer, { width: screenWidth }]} onPress={handleCardPress} activeOpacity={0.95}>
            <View style={styles.caloriesSection}>
                {/* Left: Remaining/Over */}
                <View style={styles.caloriesLeftSection}>
                    <ThemedText type='titleLarge' style={styles.remainingNumber}>
                        {isOverGoal ? Math.abs(remaining) : remaining}
                    </ThemedText>
                    <ThemedText type='caption' style={styles.remainingLabel}>
                        {isOverGoal ? 'Over Goal' : 'Remaining'}
                    </ThemedText>
                </View>

                {/* Center: Calories Circle */}
                <View style={styles.caloriesCenterSection}>
                    <CircularProgress
                        current={consumedCalories}
                        goal={nutritionGoals.GoalCalories}
                        color={themeColors.slateBlue}
                        backgroundColor={themeColors.slateBlueTransparent}
                        size={180}
                        strokeWidth={8}
                        arcAngle={270}
                        showContent={true}
                    >
                        <Icon name='flame' size={Sizes.fontSizeDefault} color={addAlpha(themeColors.text, 0.6)} style={{ marginBottom: Spaces.SM }} />
                        <ThemedText type='titleXLarge' style={[styles.caloriesNumber, { color: themeColors.text }]}>
                            {consumedCalories.toString()}
                        </ThemedText>
                        <ThemedText type='caption' style={styles.consumedLabel}>
                            Consumed
                        </ThemedText>
                    </CircularProgress>
                </View>

                {/* Right: Goal */}
                <View style={styles.caloriesRightSection}>
                    <ThemedText type='titleLarge' style={styles.goalNumber}>
                        {nutritionGoals.GoalCalories.toString()}
                    </ThemedText>
                    <ThemedText type='caption' style={styles.goalLabel}>
                        Goal
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );

    const MacrosView = () => (
        <TouchableOpacity style={[styles.pageContainer, { width: screenWidth }]} onPress={handleCardPress} activeOpacity={0.95}>
            <View style={styles.macrosSection}>
                <MacroMeter
                    label='Protein'
                    current={consumedProtein}
                    goal={nutritionGoals.GoalMacros.Protein}
                    unit='g'
                    color={themeColors.protein}
                    backgroundColor={addAlpha(themeColors.protein, 0.1)}
                    overageColor={darkenColor(themeColors.protein, 0.4)}
                />
                <MacroMeter
                    label='Carbs'
                    current={consumedCarbs}
                    goal={nutritionGoals.GoalMacros.Carbs}
                    unit='g'
                    color={themeColors.carbs}
                    backgroundColor={addAlpha(themeColors.carbs, 0.1)}
                    overageColor={darkenColor(themeColors.carbs, 0.4)}
                />
                <MacroMeter
                    label='Fats'
                    current={consumedFats}
                    goal={nutritionGoals.GoalMacros.Fats}
                    unit='g'
                    color={themeColors.fats}
                    backgroundColor={addAlpha(themeColors.fats, 0.1)}
                    overageColor={darkenColor(themeColors.fats, 0.4)}
                />
            </View>
        </TouchableOpacity>
    );

    const OnboardingOverlay = () => (
        <BlurView intensity={12} tint={colorScheme} style={styles.onboardingOverlay}>
            {/* Semi-transparent overlay to mute the background colors */}
            <View style={[styles.overlayBackground, { backgroundColor: addAlpha(themeColors.background, 0.6) }]} />

            <TouchableOpacity
                style={[
                    styles.overlayButton,
                    {
                        backgroundColor: themeColors.slateBlue,
                    },
                ]}
                onPress={() => {
                    router.push('/(app)/onboarding/biodata/step-1-gender' as any);
                    trigger('impactLight');
                }}
                activeOpacity={0.8}
            >
                <Icon name={'play'} color={themeColors.white} size={12} style={{ marginRight: Spaces.XS }} />
                <ThemedText type='buttonSmall' style={[{ color: themeColors.white }]}>
                    Get Started
                </ThemedText>
            </TouchableOpacity>
        </BlurView>
    );

    return (
        <ThemedView style={[styles.outerContainer, { backgroundColor: 'transparent' }, style]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <CaloriesView />
                <MacrosView />
            </ScrollView>

            {/* Dot Indicators */}
            <View style={styles.dotContainer}>
                <DotIndicator isActive={currentPage === 0} color={themeColors.text} backgroundColor={themeColors.subTextSecondary} />
                <DotIndicator isActive={currentPage === 1} color={themeColors.text} backgroundColor={themeColors.subTextSecondary} />
            </View>

            {/* Onboarding Overlay */}
            {!isOnboardingComplete && <OnboardingOverlay />}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        paddingBottom: Spaces.MD,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexDirection: 'row',
    },
    pageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
    },

    // Calories Section
    caloriesSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    caloriesLeftSection: {
        flex: 1,
        alignItems: 'center',
    },
    caloriesCenterSection: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    caloriesRightSection: {
        flex: 1,
        alignItems: 'center',
    },
    remainingNumber: {
        opacity: 0.8,
    },
    remainingLabel: {
        opacity: 0.7,
        marginTop: -Spaces.XS,
    },
    goalNumber: {
        opacity: 0.8,
    },
    goalLabel: {
        opacity: 0.7,
        marginTop: -Spaces.XS,
    },

    // Circular progress
    caloriesNumber: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
    },
    consumedLabel: {
        opacity: 0.7,
        marginTop: -Spaces.SM,
    },

    // Macros Section
    macrosSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginTop: -Spaces.MD,
    },
    macroMeter: {
        alignItems: 'center',
        flex: 1,
    },
    macroInfo: {
        alignItems: 'center',
        marginTop: Spaces.XS,
    },
    macroLabel: {
        textAlign: 'center',
        opacity: 0.7,
    },
    macroGoalValue: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: -Spaces.XS,
    },
    macroRemainingValue: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: -Spaces.XS,
    },

    // Dot Indicators
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spaces.XS,
        gap: Spaces.XS,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 4,
    },

    // Onboarding Overlay
    onboardingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -Spaces.SM,
        zIndex: 10,
    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: Spaces.LG,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: Spaces.SM,
        elevation: 3,
        zIndex: 10,
    },
});
