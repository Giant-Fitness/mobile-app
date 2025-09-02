// components/nutrition/DailyMacrosCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserNutritionProfile } from '@/types';
import { addAlpha } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../base/Icon';
import { CircularProgress } from '../charts/CircularProgress';

interface DailyMacrosCardProps {
    userNutritionProfile: UserNutritionProfile;
    style?: any;
}

interface MacroMeterProps {
    label: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
}

const MacroMeter: React.FC<MacroMeterProps> = ({ label, current, goal, unit, color }) => {
    return (
        <View style={styles.macroMeter}>
            <View style={styles.macroColumn}>
                <CircularProgress current={current} goal={goal} color={color} size={32} strokeWidth={4} arcAngle={360} />
                <View style={styles.macroInfo}>
                    <ThemedText type='buttonSmall' style={styles.macroLabel}>
                        {label}
                    </ThemedText>
                    <ThemedText type='caption' style={styles.macroValues}>
                        <ThemedText type='bodyMedium' style={styles.consumedValue}>
                            {Math.round(current)}
                        </ThemedText>
                        <ThemedText type='caption'>
                            {' / '}
                            {goal}
                            {unit}
                        </ThemedText>
                    </ThemedText>
                </View>
            </View>
        </View>
    );
};

export const DailyMacrosCard: React.FC<DailyMacrosCardProps> = ({ userNutritionProfile, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Placeholder consumed values - replace with actual data later
    const consumedCalories = 150;
    const consumedProtein = 155;
    const consumedCarbs = 180;
    const consumedFats = 45;

    const remaining = userNutritionProfile.GoalCalories - consumedCalories;
    const isOverGoal = consumedCalories > userNutritionProfile.GoalCalories;

    return (
        <ThemedView style={[styles.outerContainer, { backgroundColor: themeColors.background }, style]}>
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
                        goal={userNutritionProfile.GoalCalories}
                        color={themeColors.slateBlue}
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
                        {userNutritionProfile.GoalCalories.toString()}
                    </ThemedText>
                    <ThemedText type='caption' style={styles.goalLabel}>
                        Goal
                    </ThemedText>
                </View>
            </View>
            {/* Bottom: Macros Row */}
            <View style={styles.macrosSection}>
                <MacroMeter label='Protein' current={consumedProtein} goal={userNutritionProfile.GoalMacros.Protein} unit='g' color={themeColors.protein} />
                <MacroMeter label='Carbs' current={consumedCarbs} goal={userNutritionProfile.GoalMacros.Carbs} unit='g' color={themeColors.carbs} />
                <MacroMeter label='Fats' current={consumedFats} goal={userNutritionProfile.GoalMacros.Fats} unit='g' color={themeColors.fats} />
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        // padding: Spaces.MD,
        // paddingBottom: Spaces.SM,
        // borderRadius: Spaces.SM,
    },

    // Calories Section
    caloriesSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    caloriesLeftSection: {
        marginTop: Spaces.SM,
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
        marginTop: Spaces.SM,
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
        marginTop: -Spaces.SM,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spaces.MD,
    },
    macroMeter: {
        flex: 1,
        alignItems: 'center',
    },
    macroLabel: {
        textAlign: 'center',
        opacity: 0.7,
    },
    macroValues: {
        textAlign: 'center',
        marginTop: -Spaces.XS,
    },

    macrosRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    macroColumn: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: Spaces.XS,
    },
    macroInfo: {
        alignItems: 'flex-start',
    },
    consumedValue: {
        fontSize: 14, // Increased size for consumed number
    },
});
