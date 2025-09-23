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

        nutritionLog.Meals.forEach((meal) => {
            const entriesObj = meal.FoodEntries || {};
            const entries: FoodEntry[] = Object.entries(entriesObj).map(([entryKey, entry]) => {
                const timestamp = entry.Timestamp || meal.Timestamp || '';
                const foodId = entry.FoodId || entryKey;
                const servingKey = entry.ServingKey ?? null;

                return {
                    ...entry,
                    FoodId: foodId,
                    Timestamp: timestamp,
                    ServingKey: servingKey,
                    // Add navigation metadata
                    entryKey, // Include the entry key
                    mealType: meal.MealType, // Include the meal type'
                    dateString: selectedDateString,
                };
            });

            data[meal.MealType].push(...entries);
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
