// components/nutrition/FoodLogContent.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { MealSection } from '@/components/nutrition/MealSection';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FoodEntry, MealType, UserNutritionLog } from '@/types/nutritionLogsTypes';
import { debounce } from '@/utils/debounce';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

interface FoodLogContentProps {
    selectedDate: Date;
    nutritionLog?: UserNutritionLog | null; // Pre-loaded data passed down
    style?: any;
}

const defaultExpandedSections: Record<MealType, boolean> = {
    BREAKFAST: true,
    LUNCH: true,
    DINNER: true,
    SNACK: true,
};

// Helper function to format date for API
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const FoodLogContent: React.FC<FoodLogContentProps> = ({ selectedDate, nutritionLog, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();

    const [expandedSections, setExpandedSections] = useState<Record<MealType, boolean>>(defaultExpandedSections);

    const selectedDateString = formatDateForAPI(selectedDate);

    // Convert backend nutrition log to UI format
    const foodData = useMemo(() => {
        const data: Record<MealType, FoodEntry[]> = {
            BREAKFAST: [],
            LUNCH: [],
            DINNER: [],
            SNACK: [],
        };

        if (!nutritionLog || !nutritionLog.Meals) {
            return data;
        }

        // Process each meal from the nutrition log
        nutritionLog.Meals.forEach((meal) => {
            // meal.FoodEntries is an object keyed by entryKey — convert to array
            const entriesObj = meal.FoodEntries || {};
            const entries: FoodEntry[] = Object.entries(entriesObj).map(([entryKey, entry]) => {
                // Use the entry's Timestamp if present, otherwise fall back to meal.Timestamp
                const timestamp = entry.Timestamp || meal.Timestamp || '';

                // Some backends use the object key as the FoodId; fall back to that
                const foodId = entry.FoodId || entryKey;

                // Ensure ServingKey explicitly allowed to be null
                const servingKey = entry.ServingKey ?? null;

                // Return a normalized FoodEntry
                return {
                    ...entry,
                    FoodId: foodId,
                    Timestamp: timestamp,
                    ServingKey: servingKey,
                };
            });

            // Push converted entries into the correct meal bucket
            data[meal.MealType].push(...entries);

            // Sort the meal bucket by Timestamp (ascending)
            data[meal.MealType].sort((a, b) => a.Timestamp.localeCompare(b.Timestamp));
        });

        return data;
    }, [nutritionLog, selectedDateString]);

    // Reset expanded sections to default when date changes
    useEffect(() => {
        setExpandedSections(defaultExpandedSections);
    }, [selectedDate]);

    const handleQuickAdd = (mealType: MealType) => {
        trigger('selection');

        // Navigate to food logging screen with the selected date and meal type
        debounce(router, {
            pathname: '/(app)/nutrition/food-logging',
            params: {
                mode: 'search', // Default to search mode
                mealType: mealType,
                date: selectedDate.toISOString(), // Pass date as ISO string
            },
        });
    };

    const handleEditFood = (food: FoodEntry) => {
        console.log('Edit food clicked:', food, selectedDate);
        // TODO: This will eventually open food editing flow
    };

    const handleDeleteFood = (foodId: string) => {
        console.log('Delete food clicked:', foodId);
        // TODO: Dispatch delete action
    };

    const handleToggleExpand = (mealType: MealType) => {
        setExpandedSections((prev) => ({
            ...prev,
            [mealType]: !prev[mealType],
        }));
    };

    const mealOrder: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }, style]}>
            {mealOrder.map((mealType) => (
                <MealSection
                    key={mealType}
                    mealType={mealType}
                    foods={foodData[mealType]}
                    onQuickAdd={handleQuickAdd}
                    onEditFood={handleEditFood}
                    onDeleteFood={handleDeleteFood}
                    isExpanded={expandedSections[mealType]}
                    onToggleExpand={handleToggleExpand}
                    selectedDate={selectedDate} // Pass selectedDate for key generation
                />
            ))}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spaces.MD,
    },
});
