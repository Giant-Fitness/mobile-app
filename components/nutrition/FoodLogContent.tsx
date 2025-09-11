// components/nutrition/FoodLogContent.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { FoodEntryData } from '@/components/nutrition/FoodEntry';
import { MealSection, MealType } from '@/components/nutrition/MealSection';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// Mock data for demonstration
const mockFoodData: Record<MealType, FoodEntryData[]> = {
    breakfast: [
        {
            id: '1',
            name: 'Greek Yogurt with Berries',
            portionSize: '200g',
            calories: 150,
            protein: 15,
            carbs: 20,
            fats: 0,
            type: 'recipes',
        },
        {
            id: '2',
            name: 'Avocado Toast',
            portionSize: '2 slices',
            calories: 320,
            protein: 8,
            carbs: 30,
            fats: 22,
            type: 'my-recipes',
        },
        {
            id: '3',
            name: 'Black Coffee',
            portionSize: '1 cup',
            calories: 5,
            protein: 0,
            carbs: 1,
            fats: 0,
            type: 'whole-foods',
        },
    ],
    lunch: [
        {
            id: '4',
            name: 'Grilled Chicken Salad',
            portionSize: '1 serving',
            calories: 380,
            protein: 35,
            carbs: 15,
            fats: 18,
            type: 'recipes',
        },
        {
            id: '5',
            name: 'Olive Oil Dressing',
            portionSize: '2 tbsp',
            calories: 120,
            protein: 0,
            carbs: 0,
            fats: 14,
            type: 'whole-foods',
        },
    ],
    dinner: [
        {
            id: '6',
            name: 'Salmon with Quinoa',
            portionSize: '1 serving',
            calories: 520,
            protein: 45,
            carbs: 40,
            fats: 18,
            type: 'recipes',
        },
        {
            id: '7',
            name: 'Steamed Broccoli',
            portionSize: '1 cup',
            calories: 30,
            protein: 3,
            carbs: 6,
            fats: 0,
            type: 'whole-foods',
        },
    ],
    snacks: [
        // {
        //     id: '8',
        //     name: 'Apple with Almond Butter',
        //     portionSize: '1 medium apple + 2 tbsp',
        //     calories: 270,
        //     protein: 8,
        //     carbs: 25,
        //     fats: 16,
        //     type: 'my-foods',
        // },
    ],
};

interface FoodLogContentProps {
    selectedDate: Date;
    style?: any;
}

const defaultExpandedSections: Record<MealType, boolean> = {
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true,
};

export const FoodLogContent: React.FC<FoodLogContentProps> = ({ selectedDate, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [foodData, setFoodData] = useState<Record<MealType, FoodEntryData[]>>(mockFoodData);
    const [expandedSections, setExpandedSections] = useState<Record<MealType, boolean>>(defaultExpandedSections);

    // Reset expanded sections to default when date changes
    useEffect(() => {
        setExpandedSections(defaultExpandedSections);
    }, [selectedDate]);

    const handleQuickAdd = (mealType: MealType) => {
        console.log('Quick add clicked for meal:', mealType);
        // This will eventually open food search/entry flow
    };

    const handleEditFood = (food: FoodEntryData) => {
        console.log('Edit food clicked:', food, selectedDate);
        // This will eventually open food editing flow
    };

    const handleDeleteFood = (foodId: string) => {
        console.log('Delete food clicked:', foodId);
        // Find and remove the food item from the appropriate meal
        setFoodData((prev) => {
            const newData = { ...prev };
            for (const mealType in newData) {
                newData[mealType as MealType] = newData[mealType as MealType].filter((food) => food.id !== foodId);
            }
            return newData;
        });
    };

    const handleToggleExpand = (mealType: MealType) => {
        setExpandedSections((prev) => ({
            ...prev,
            [mealType]: !prev[mealType],
        }));
    };

    const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

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
