// components/nutrition/DailyMacrosCardCompressed.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { LinearProgressBar } from '@/components/charts/LinearProgressBar';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserNutritionProfile } from '@/types';
import { addAlpha, darkenColor } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Preview data for when user hasn't completed onboarding
const PREVIEW_NUTRITION_PROFILE: UserNutritionProfile = {
    GoalCalories: 2200,
    GoalMacros: {
        Protein: 150,
        Carbs: 220,
        Fats: 75,
    },
    WeightGoal: 'maintain', // or whatever your type expects
} as any;

const PREVIEW_CONSUMED = {
    calories: 1850,
    protein: 110,
    carbs: 180,
    fats: 65,
};

interface DailyMacrosCardCompressedProps {
    userNutritionProfile?: any | null;
    consumedData?: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    } | null;
    isOnboardingComplete?: boolean;
    style?: any;
}

interface MacroItemProps {
    label?: string;
    iconName?: string;
    current: number;
    goal: number;
    color: string;
    backgroundColor: string;
    overageColor: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ label, iconName, current, goal, color, backgroundColor, overageColor }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const formatValue = (value: number) => {
        return Math.round(value);
    };

    return (
        <View style={[styles.macroItem]}>
            <ThemedText type='caption' style={[styles.values, { color: themeColors.text, marginBottom: -Spaces.XXS }]}>
                {iconName ? (
                    <View style={styles.labelContainer}>
                        <Icon name={iconName} size={12} color={themeColors.iconDefault} style={{ lineHeight: moderateScale(20) }} />
                        <ThemedText type='caption' style={[styles.values, { color: themeColors.text }]}>
                            {' '}
                            {formatValue(current)} / {formatValue(goal)}
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        <ThemedText type='button' style={[styles.values, { color: themeColors.text }]}>
                            {label}
                        </ThemedText>
                        <ThemedText type='buttonSmall' style={[styles.values, { color: themeColors.subText }]}>
                            {' '}
                            {formatValue(current)} / {formatValue(goal)}
                        </ThemedText>
                    </>
                )}
            </ThemedText>

            <LinearProgressBar
                current={current}
                goal={goal}
                color={color}
                backgroundColor={backgroundColor}
                height={4}
                fullHeight={true}
                overageColor={overageColor}
            />
        </View>
    );
};

export const DailyMacrosCardCompressed: React.FC<DailyMacrosCardCompressedProps> = ({
    userNutritionProfile,
    consumedData,
    isOnboardingComplete = true,
    style,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Use preview data if not onboarded or no profile
    const nutritionProfile = isOnboardingComplete ? userNutritionProfile : PREVIEW_NUTRITION_PROFILE;
    const consumed = isOnboardingComplete ? consumedData : PREVIEW_CONSUMED;

    // Don't render if no profile data available
    if (!nutritionProfile || !consumed) {
        return null;
    }

    const macroItems = [
        {
            iconName: 'flame',
            current: consumed.calories,
            goal: nutritionProfile.GoalCalories,
            color: themeColors.slateBlue,
            backgroundColor: themeColors.slateBlueTransparent,
            overageColor: darkenColor(themeColors.slateBlue, 0.4),
        },
        {
            label: 'P',
            current: consumed.protein,
            goal: nutritionProfile.GoalMacros.Protein,
            color: themeColors.protein,
            backgroundColor: addAlpha(themeColors.protein, 0.1),
            overageColor: darkenColor(themeColors.protein, 0.4),
        },
        {
            label: 'C',
            current: consumed.carbs,
            goal: nutritionProfile.GoalMacros.Carbs,
            color: themeColors.carbs,
            backgroundColor: addAlpha(themeColors.carbs, 0.1),
            overageColor: darkenColor(themeColors.carbs, 0.4),
        },
        {
            label: 'F',
            current: consumed.fats,
            goal: nutritionProfile.GoalMacros.Fats,
            color: themeColors.fats,
            backgroundColor: addAlpha(themeColors.fats, 0.1),
            overageColor: darkenColor(themeColors.fats, 0.4),
        },
    ];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }, style]}>
            <View style={styles.macrosRow}>
                {macroItems.map((item, index) => (
                    <MacroItem
                        key={index}
                        label={item.label}
                        iconName={item.iconName}
                        current={item.current}
                        goal={item.goal}
                        color={item.color}
                        backgroundColor={item.backgroundColor}
                        overageColor={item.overageColor}
                    />
                ))}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {},
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spaces.SM,
    },
    macroItem: {
        flex: 1,
        gap: Spaces.XS,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    values: {
        fontSize: 12,
        textAlign: 'left',
    },
});
