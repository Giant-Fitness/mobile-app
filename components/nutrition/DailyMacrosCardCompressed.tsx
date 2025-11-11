// components/nutrition/DailyMacrosCardCompressed.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { LinearProgressBar } from '@/components/charts/LinearProgressBar';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserMacroTarget, UserNutritionLog } from '@/types';
import { addAlpha, darkenColor } from '@/utils/colorUtils';
import { moderateScale } from '@/utils/scaling';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

// Preview data for when user hasn't completed onboarding
const PREVIEW_MACRO_TARGET: any = {
    TargetCalories: 2200,
    TargetMacros: {
        Protein: 150,
        Carbs: 220,
        Fat: 75,
    },
} as any;

const PREVIEW_CONSUMED = {
    calories: 1850,
    protein: 110,
    carbs: 180,
    fat: 65,
};

interface DailyMacrosCardCompressedProps {
    consumedData?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null;
    isOnboardingComplete?: boolean;
    style?: any;
    macroTarget: UserMacroTarget | null;
    nutritionLog?: UserNutritionLog | null;
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
                height={8}
                fullHeight={true}
                overageColor={overageColor}
            />
        </View>
    );
};

export const DailyMacrosCardCompressed: React.FC<DailyMacrosCardCompressedProps> = ({
    macroTarget,
    consumedData,
    isOnboardingComplete = true,
    style,
    nutritionLog,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Use preview data if not onboarded or no target
    const target = isOnboardingComplete ? macroTarget : PREVIEW_MACRO_TARGET;

    // Calculate consumed values from nutrition log or fallback to passed data
    const consumed = useMemo(() => {
        if (!isOnboardingComplete) {
            return PREVIEW_CONSUMED;
        }

        // If nutrition log exists, use its daily totals
        if (nutritionLog && nutritionLog.DailyTotals) {
            const { DailyTotals } = nutritionLog;
            return {
                calories: Math.round(DailyTotals.Calories || 0),
                protein: Math.round(DailyTotals.Protein || 0),
                carbs: Math.round(DailyTotals.Carbs || 0),
                fat: Math.round(DailyTotals.Fat || 0),
            };
        }

        // Fallback to passed consumed data or zeros
        return (
            consumedData || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            }
        );
    }, [nutritionLog, consumedData, isOnboardingComplete]);

    // Don't render if no target available
    if (!target) {
        return null;
    }

    const macroItems = [
        {
            iconName: 'flame',
            current: consumed.calories,
            goal: target.TargetCalories,
            color: themeColors.slateBlue,
            backgroundColor: themeColors.slateBlueTransparent,
            overageColor: darkenColor(themeColors.slateBlue, 0.4),
        },
        {
            label: 'P',
            current: consumed.protein,
            goal: target.TargetMacros.Protein,
            color: themeColors.protein,
            backgroundColor: addAlpha(themeColors.protein, 0.1),
            overageColor: darkenColor(themeColors.protein, 0.4),
        },
        {
            label: 'C',
            current: consumed.carbs,
            goal: target.TargetMacros.Carbs,
            color: themeColors.carbs,
            backgroundColor: addAlpha(themeColors.carbs, 0.1),
            overageColor: darkenColor(themeColors.carbs, 0.4),
        },
        {
            label: 'F',
            current: consumed.fat,
            goal: target.TargetMacros.Fat,
            color: themeColors.fat,
            backgroundColor: addAlpha(themeColors.fat, 0.1),
            overageColor: darkenColor(themeColors.fat, 0.4),
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
