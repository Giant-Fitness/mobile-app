// types/nutritionLogsTypes.ts

export interface QuickMacros {
    Calories: number;
    Protein: number;
    Carbs: number;
    Fat: number;
}

export interface FoodEntry {
    FoodId: string | null;
    EntryType: 'QUICK_MACRO';
    Timestamp: string; // HH:mm:ss format
    Quantity: number;
    UserInputMethod: 'QUICK_MACRO';
    UserInputValue: number;
    UserInputUnit: string;
    ServingKey: string | null;
    QuickMacros: QuickMacros;
}

export interface Meal {
    MealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    MealId: string;
    Timestamp: string; // HH:mm:ss format
    FoodEntries: { [key: string]: FoodEntry };
}

export interface DailyTotals {
    Calories: number;
    Protein: number;
    Carbs: number;
    Fats: number;
    Fiber: number;
}

export interface UserNutritionLog {
    UserId: string;
    DateString: string; // YYYY-MM-DD format
    Meals: Meal[];
    DailyTotals: DailyTotals;
    CreatedAt: string;
    UpdatedAt: string;
}

// Request/Response types
export interface AddFoodEntryParams {
    MealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    Timestamp: string;
    Quantity: number;
    UserInputMethod: 'QUICK_MACRO';
    UserInputValue: number;
    UserInputUnit: string;
    QuickMacros: QuickMacros;
}

export interface UpdateFoodEntryParams {
    Timestamp?: string;
    Quantity?: number;
    UserInputValue?: number;
    UserInputUnit?: string;
    QuickMacros?: QuickMacros;
}

export interface AddFoodEntryResponse {
    message: string;
    nutritionLog: UserNutritionLog;
    addedEntry: {
        mealType: string;
        entryKey: string;
        entry: FoodEntry;
    };
}

export interface UpdateFoodEntryResponse {
    message: string;
    nutritionLog: UserNutritionLog;
    updatedEntry: {
        entryKey: string;
        entry: FoodEntry;
    };
}

export interface GetNutritionLogResponse {
    nutritionLog: UserNutritionLog | null;
    message: string;
}
