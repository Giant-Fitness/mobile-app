// Modified DailyMacrosCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha, darkenColor } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

import { Icon } from '../base/Icon';
import { CircularProgress } from '../charts/CircularProgress';

const { width: screenWidth } = Dimensions.get('window');

interface DailyMacrosCardProps {
    userNutritionProfile?: any | null;
    style?: any;
    isOnboardingComplete?: boolean;
}

// Fake data for preview mode
const PREVIEW_NUTRITION_PROFILE: any = {
    GoalCalories: 2200,
    GoalMacros: {
        Protein: 150,
        Carbs: 220,
        Fats: 75,
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

export const DailyMacrosCard: React.FC<DailyMacrosCardProps> = ({ userNutritionProfile, style, isOnboardingComplete = true }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollViewRef = useRef<ScrollView>(null);

    // Set initial page based on onboarding status: show macros (page 1) first during onboarding
    const [currentPage, setCurrentPage] = useState(isOnboardingComplete ? 0 : 1);

    // Use preview data if not onboarded or no profile
    const nutritionProfile = isOnboardingComplete ? userNutritionProfile : PREVIEW_NUTRITION_PROFILE;

    // Scroll to initial page when component mounts or onboarding status changes
    useEffect(() => {
        if (scrollViewRef.current) {
            const initialPage = isOnboardingComplete ? 0 : 1;
            scrollViewRef.current.scrollTo({ x: initialPage * screenWidth, animated: false });
            setCurrentPage(initialPage);
        }
    }, [isOnboardingComplete]);

    if (!nutritionProfile) {
        return null;
    }

    // Use preview consumed values if not onboarded, otherwise use actual data
    const consumedCalories = isOnboardingComplete ? 150 : PREVIEW_CONSUMED.calories; // Replace with actual consumed data
    const consumedProtein = isOnboardingComplete ? 155 : PREVIEW_CONSUMED.protein;
    const consumedCarbs = isOnboardingComplete ? 180 : PREVIEW_CONSUMED.carbs;
    const consumedFats = isOnboardingComplete ? 45 : PREVIEW_CONSUMED.fats;

    const remaining = nutritionProfile.GoalCalories - consumedCalories;
    const isOverGoal = consumedCalories > nutritionProfile.GoalCalories;

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentPage(pageIndex);
    };

    const CaloriesView = () => (
        <View style={[styles.pageContainer, { width: screenWidth }]}>
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
                        goal={nutritionProfile.GoalCalories}
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
                        {nutritionProfile.GoalCalories.toString()}
                    </ThemedText>
                    <ThemedText type='caption' style={styles.goalLabel}>
                        Goal
                    </ThemedText>
                </View>
            </View>
        </View>
    );

    const MacrosView = () => (
        <View style={[styles.pageContainer, { width: screenWidth }]}>
            <View style={styles.macrosSection}>
                <MacroMeter
                    label='Protein'
                    current={consumedProtein}
                    goal={nutritionProfile.GoalMacros.Protein}
                    unit='g'
                    color={themeColors.protein}
                    backgroundColor={addAlpha(themeColors.protein, 0.1)}
                    overageColor={darkenColor(themeColors.protein, 0.4)}
                />
                <MacroMeter
                    label='Carbs'
                    current={consumedCarbs}
                    goal={nutritionProfile.GoalMacros.Carbs}
                    unit='g'
                    color={themeColors.carbs}
                    backgroundColor={addAlpha(themeColors.carbs, 0.1)}
                    overageColor={darkenColor(themeColors.carbs, 0.4)}
                />
                <MacroMeter
                    label='Fats'
                    current={consumedFats}
                    goal={nutritionProfile.GoalMacros.Fats}
                    unit='g'
                    color={themeColors.fats}
                    backgroundColor={addAlpha(themeColors.fats, 0.1)}
                    overageColor={darkenColor(themeColors.fats, 0.4)}
                />
            </View>
        </View>
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
        <ThemedView style={[styles.outerContainer, { backgroundColor: themeColors.background }, style]}>
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
