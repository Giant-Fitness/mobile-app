// components/nutrition/MealSection.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { FoodEntry, FoodEntryData } from '@/components/nutrition/FoodEntry';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface MealSectionProps {
    mealType: MealType;
    foods: FoodEntryData[];
    onQuickAdd: (mealType: MealType) => void;
    onEditFood: (food: FoodEntryData) => void;
    onDeleteFood: (foodId: string) => void;
    isExpanded?: boolean;
    onToggleExpand?: (mealType: MealType) => void;
    style?: any;
}

const getMealDisplayName = (mealType: MealType): string => {
    switch (mealType) {
        case 'breakfast':
            return 'Breakfast';
        case 'lunch':
            return 'Lunch';
        case 'dinner':
            return 'Dinner';
        case 'snacks':
            return 'Snacks';
        default:
            return mealType;
    }
};

export const MealSection: React.FC<MealSectionProps> = ({
    mealType,
    foods,
    onQuickAdd,
    onEditFood,
    onDeleteFood,
    isExpanded = true,
    onToggleExpand,
    style,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Calculate totals
    const totals = foods.reduce(
        (acc, food) => ({
            calories: acc.calories + food.calories,
            protein: acc.protein + food.protein,
            carbs: acc.carbs + food.carbs,
            fats: acc.fats + food.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const handleQuickAdd = () => {
        trigger('impactLight');
        onQuickAdd(mealType);
        console.log('Quick add for meal:', mealType);
    };

    const handleToggleExpand = () => {
        if (onToggleExpand) {
            trigger('impactLight');
            onToggleExpand(mealType);
        }
    };

    const hasFood = foods.length > 0;

    return (
        <View style={[style, { marginBottom: Spaces.MD }]}>
            {/* External Header - Always visible */}
            <View style={styles.externalHeader}>
                {/* Top Row: Add button + Meal name + Food count badge + Chevron */}
                <View style={styles.topRow}>
                    <View style={styles.topRowLeft}>
                        <TouchableOpacity
                            onPress={handleQuickAdd}
                            style={[
                                styles.addButton,
                                {
                                    backgroundColor: themeColors.iconSelected,
                                },
                            ]}
                            activeOpacity={1}
                        >
                            <Icon name='plus' size={10} color={themeColors.background} />
                        </TouchableOpacity>
                        <ThemedText type='title' style={styles.mealName}>
                            {getMealDisplayName(mealType)}
                        </ThemedText>
                    </View>

                    <View style={styles.topRowRight}>
                        {/* Food Count Badge - Always show when collapsed */}
                        {!isExpanded && (
                            <View style={[styles.foodCountBadge, { backgroundColor: themeColors.surfaceDark }]}>
                                <ThemedText type='caption' style={[styles.badgeText, { color: themeColors.text }]}>
                                    {foods.length > 9 ? '9+' : foods.length}
                                </ThemedText>
                            </View>
                        )}

                        {onToggleExpand && (
                            <TouchableOpacity onPress={handleToggleExpand} style={styles.chevronButton} activeOpacity={1}>
                                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} color={themeColors.iconSelected} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Bottom Row: Nutrition summary (only when expanded) OR Preview dots (when collapsed) */}
                {isExpanded ? (
                    // Expanded: Show nutrition summary
                    hasFood && (
                        <View style={styles.bottomRow}>
                            <View style={styles.nutritionSummary}>
                                {/* Calories */}
                                <View style={styles.nutritionItem}>
                                    <View style={[styles.caloriesIconContainer, { backgroundColor: themeColors.surfaceDark }]}>
                                        <Icon name='flame' size={10} color={themeColors.iconSelected} />
                                    </View>
                                    <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.text }]}>
                                        {Math.round(totals.calories)}
                                    </ThemedText>
                                </View>

                                {/* Protein */}
                                {totals.protein > 0 && (
                                    <View style={styles.nutritionItem}>
                                        <View style={[styles.macroIconContainer, { backgroundColor: themeColors.surfaceDark }]}>
                                            <ThemedText type='button' style={[styles.macroLetter, { color: themeColors.text }]}>
                                                P
                                            </ThemedText>
                                        </View>
                                        <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.text }]}>
                                            {Math.round(totals.protein)}
                                        </ThemedText>
                                    </View>
                                )}

                                {/* Carbs */}
                                {totals.carbs > 0 && (
                                    <View style={styles.nutritionItem}>
                                        <View style={[styles.macroIconContainer, { backgroundColor: themeColors.surfaceDark }]}>
                                            <ThemedText type='button' style={[styles.macroLetter, { color: themeColors.text }]}>
                                                C
                                            </ThemedText>
                                        </View>
                                        <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.text }]}>
                                            {Math.round(totals.carbs)}
                                        </ThemedText>
                                    </View>
                                )}

                                {/* Fats */}
                                {totals.fats > 0 && (
                                    <View style={styles.nutritionItem}>
                                        <View style={[styles.macroIconContainer, { backgroundColor: themeColors.surfaceDark }]}>
                                            <ThemedText type='button' style={[styles.macroLetter, { color: themeColors.text }]}>
                                                F
                                            </ThemedText>
                                        </View>
                                        <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.text }]}>
                                            {Math.round(totals.fats)}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                ) : (
                    // Collapsed: Show preview dots
                    <View style={styles.previewRow}>
                        <View style={styles.previewDots}>
                            {hasFood &&
                                // Show dots for food items (max 3)
                                foods
                                    .slice(0, 3)
                                    .map((_, index) => <View key={index} style={[styles.previewDot, { backgroundColor: themeColors.iconDefault }]} />)}
                        </View>
                    </View>
                )}
            </View>

            {/* Container Box - Only visible when expanded */}
            {isExpanded && (
                <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
                    <View style={styles.content}>
                        {hasFood ? (
                            <View style={styles.foodList}>
                                {foods.map((food, index) => (
                                    <React.Fragment key={food.id}>
                                        <FoodEntry food={food} onEdit={onEditFood} onDelete={onDeleteFood} />
                                        {/* Add separator line between food items (not after the last one) */}
                                        {index < foods.length - 1 && (
                                            <View style={[styles.foodSeparator, { backgroundColor: themeColors.systemBorderColor }]} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.emptyState, { backgroundColor: themeColors.background }]}
                                onPress={handleQuickAdd}
                                activeOpacity={1}
                            >
                                <View style={[styles.emptyAddButton, { backgroundColor: themeColors.subText }]}>
                                    <Icon name='plus' size={10} color={themeColors.background} />
                                </View>
                                <ThemedText type='body' style={[styles.emptyText, { color: themeColors.subText }]}>
                                    Add Food
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    externalHeader: {
        marginBottom: Spaces.SM,
        paddingHorizontal: Spaces.XS,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spaces.XS,
    },
    topRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.SM,
        flex: 1,
    },
    topRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.SM,
    },
    mealName: {
        // Meal name styling
    },
    addButton: {
        width: Spaces.MD,
        height: Spaces.MD,
        borderRadius: Spaces.SM, // Circular
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodCountBadge: {
        paddingHorizontal: Spaces.XS,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    chevronButton: {
        padding: Spaces.XS, // Larger touch target
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // Add left margin to align with meal name (button width + gap)
        marginLeft: Spaces.MD + Spaces.SM,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // Add left margin to align with meal name (button width + gap)
        marginLeft: Spaces.MD + Spaces.SM + Spaces.XXS,
    },
    previewDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.XS,
    },
    previewDot: {
        width: Spaces.XS,
        height: Spaces.XS,
        borderRadius: Spaces.XS,
    },
    nutritionSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.MD,
    },
    nutritionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20, // Same height for all items
        gap: Spaces.XS,
    },
    caloriesIconContainer: {
        width: Spaces.MD,
        height: Spaces.MD,
        borderRadius: Spaces.SM, // Circular
        justifyContent: 'center',
        alignItems: 'center',
    },
    macroIconContainer: {
        width: Spaces.MD,
        height: Spaces.MD,
        borderRadius: Spaces.SM, // Circular
        justifyContent: 'center',
        alignItems: 'center',
    },
    macroLetter: {
        fontSize: 10,
        lineHeight: 16,
    },
    nutritionText: {
        fontSize: 13,
    },
    container: {
        marginLeft: Spaces.MD + Spaces.SM + Spaces.XXS,
        borderRadius: Spaces.SM,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {},
    foodList: {},
    foodSeparator: {
        height: 1,
        opacity: 0.4,
        marginHorizontal: Spaces.MD,
    },
    emptyState: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spaces.MD,
        borderRadius: Spaces.SM,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    emptyAddButton: {
        width: Spaces.MD,
        height: Spaces.MD,
        borderRadius: Spaces.SM, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spaces.SM,
    },
    emptyText: {
        textAlign: 'center',
    },
});
