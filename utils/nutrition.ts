// utils/nutrition.ts

export type WeightUnitType = 'kgs' | 'lbs';
export type PrimaryFitnessGoalType = 'lose-fat' | 'build-muscle' | 'body-recomposition' | 'maintain-fitness';

const calculateAgeFromDOB = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export const calculateTDEE = (data: { Gender: string; Dob: string; Height: number; Weight: number; ActivityLevel: string }) => {
    const { Gender, Dob, Height, Weight, ActivityLevel } = data;
    const Age = calculateAgeFromDOB(Dob);

    // Mifflin-St Jeor Equation
    let bmr;
    if (Gender === 'male') {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age + 5;
    } else {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age - 161;
    }

    const activityMultipliers = {
        sedentary: 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
    };

    return Math.round(bmr * (activityMultipliers[ActivityLevel as keyof typeof activityMultipliers] || 1.2));
};

// Get weight goal direction for internal calculations
const getWeightDirection = (primaryGoal: PrimaryFitnessGoalType): 'lose' | 'gain' | 'maintain' => {
    switch (primaryGoal) {
        case 'lose-fat':
            return 'lose';
        case 'build-muscle':
            return 'gain';
        case 'body-recomposition':
        case 'maintain-fitness':
            return 'maintain';
        default:
            return 'maintain';
    }
};

// Get evidence-based protein intake in grams per kg bodyweight
// Based on International Society of Sports Nutrition and recent meta-analyses
const getProteinGPerKg = (primaryGoal: PrimaryFitnessGoalType): number => {
    switch (primaryGoal) {
        case 'lose-fat':
            // Research shows 1.6-2.4 g/kg for fat loss while preserving muscle mass
            // Higher end recommended for better muscle preservation in caloric deficit
            return 2.2;
        case 'build-muscle':
            // 1.4-2.0 g/kg optimal for muscle building (ISSN position stand)
            // 1.6-2.2 g/kg range from bodybuilding literature
            return 1.8;
        case 'body-recomposition':
            // Very high protein for simultaneous muscle building and fat loss
            // Upper safe limit around 2.4 g/kg per research
            return 2.4;
        case 'maintain-fitness':
            // 1.2-1.7 g/kg for active individuals (ACSM recommendations)
            return 1.4;
        default:
            return 1.6;
    }
};

// Get evidence-based carbohydrate intake in grams per kg bodyweight
// Based on sports nutrition research and training demands
// Adjusted to ensure adequate fat intake within calorie budget
const getCarbsGPerKg = (primaryGoal: PrimaryFitnessGoalType): number => {
    switch (primaryGoal) {
        case 'lose-fat':
            // 3-4 g/kg recommended for moderate training during fat loss
            return 3.0;
        case 'build-muscle':
            // 4-5 g/kg for strength training (balanced with adequate fat intake)
            // Research shows 3-7 g/kg range, using middle-high end
            return 4.5;
        case 'body-recomposition':
            // Moderate carbs to support training while allowing fat oxidation
            return 3.5;
        case 'maintain-fitness':
            // 3-4 g/kg for moderate activity levels
            return 3.5;
        default:
            return 3.5;
    }
};

// Get safe fat intake ensuring minimum essential fatty acid requirements
// Research shows 20-35% of calories from fat for optimal health
const getMinFatPercentage = (primaryGoal: PrimaryFitnessGoalType): number => {
    switch (primaryGoal) {
        case 'lose-fat':
            return 0.25; // 25% minimum for hormone production during deficit
        case 'build-muscle':
            return 0.3; // 30% for optimal testosterone and recovery
        case 'body-recomposition':
            return 0.25; // 25% to balance high protein needs
        case 'maintain-fitness':
            return 0.3; // 30% for balanced health approach
        default:
            return 0.3;
    }
};

// Calculate macros in grams based on evidence-based recommendations
// Prioritizes optimal absolute intakes while ensuring adequate fat intake
export const calculateMacroGrams = (calories: number, primaryGoal: PrimaryFitnessGoalType, bodyWeightKg: number = 70) => {
    const targetProteinGrams = getProteinGPerKg(primaryGoal) * bodyWeightKg;
    const targetCarbsGrams = getCarbsGPerKg(primaryGoal) * bodyWeightKg;

    // Calculate target calories from protein and carbs
    const proteinCalories = targetProteinGrams * 4;
    const targetCarbsCalories = targetCarbsGrams * 4;

    // Ensure minimum fat percentage (never compromise on this for health)
    const minFatCalories = calories * getMinFatPercentage(primaryGoal);
    const availableCaloriesAfterFat = calories - minFatCalories;

    // If protein + target carbs exceed available calories, reduce carbs
    const totalProteinPlusTargetCarbs = proteinCalories + targetCarbsCalories;

    let finalProteinGrams = Math.round(targetProteinGrams);
    let finalCarbsGrams: number;
    let finalFatGrams = Math.round(minFatCalories / 9);

    if (totalProteinPlusTargetCarbs <= availableCaloriesAfterFat) {
        // We can fit both protein and carb targets with minimum fat
        finalCarbsGrams = Math.round(targetCarbsGrams);

        // Use any remaining calories for extra fat
        const remainingCalories = calories - proteinCalories - targetCarbsCalories - minFatCalories;
        if (remainingCalories > 0) {
            finalFatGrams = Math.round((minFatCalories + remainingCalories) / 9);
        }
    } else {
        // Need to reduce carbs to fit calorie budget with minimum fat
        const availableForCarbs = availableCaloriesAfterFat - proteinCalories;
        finalCarbsGrams = Math.round(Math.max(availableForCarbs / 4, (calories * 0.15) / 4)); // Ensure at least 15% carbs
    }

    return {
        protein: finalProteinGrams,
        carbs: finalCarbsGrams,
        fat: finalFatGrams,
    };
};

// Get training focus for later training section integration
export const getTrainingFocus = (primaryGoal: PrimaryFitnessGoalType): 'strength' | 'hypertrophy' | 'balanced' | 'cardio' => {
    switch (primaryGoal) {
        case 'lose-fat':
            return 'cardio';
        case 'build-muscle':
            return 'hypertrophy';
        case 'body-recomposition':
            return 'strength';
        case 'maintain-fitness':
            return 'balanced';
        default:
            return 'balanced';
    }
};

// Check if weight goal step is needed
export const needsWeightGoalStep = (primaryGoal: PrimaryFitnessGoalType): boolean => {
    return primaryGoal !== 'maintain-fitness';
};

// Best practice weekly percentage changes based on primary fitness goal
export const getBestPracticeWeeklyChange = (primaryGoal: PrimaryFitnessGoalType): number => {
    switch (primaryGoal) {
        case 'lose-fat':
            return 0.75; // 0.75% per week for fat loss
        case 'build-muscle':
            return 0.35; // 0.35% per week for muscle gain
        case 'body-recomposition':
            return 0.25; // Very conservative for recomp
        case 'maintain-fitness':
            return 0.0; // No weight change
        default:
            return 0.0;
    }
};

// Get initial goal weight based on current weight and primary fitness goal
export const getInitialGoalWeight = (currentWeight: number, primaryGoal: PrimaryFitnessGoalType, unit: WeightUnitType): number => {
    const direction = getWeightDirection(primaryGoal);

    if (direction === 'lose') {
        return unit === 'kgs' ? Math.max(30, currentWeight - 5) : Math.max(70, currentWeight - 11);
    } else if (direction === 'gain') {
        return unit === 'kgs' ? Math.min(210, currentWeight + 5) : Math.min(400, currentWeight + 11);
    }
    return currentWeight;
};

// Generate weight options based on unit and primary fitness goal
export const getWeightOptions = (currentWeight: number, primaryGoal: PrimaryFitnessGoalType, unit: WeightUnitType) => {
    const direction = getWeightDirection(primaryGoal);
    const isKgs = unit === 'kgs';

    if (direction === 'lose') {
        const minWeight = Math.max(isKgs ? 30 : 70, Math.floor(currentWeight * 0.7));
        const maxWeight = Math.floor(currentWeight);
        return Array.from({ length: maxWeight - minWeight + 1 }, (_, i) => ({
            value: minWeight + i,
            label: `${minWeight + i} ${unit}`,
        }));
    } else if (direction === 'gain') {
        const minWeight = Math.ceil(currentWeight);
        const maxWeight = Math.min(isKgs ? 210 : 400, Math.ceil(currentWeight * 1.15));
        return Array.from({ length: maxWeight - minWeight + 1 }, (_, i) => ({
            value: minWeight + i,
            label: `${minWeight + i} ${unit}`,
        }));
    } else {
        const offset = isKgs ? 2 : 5;
        const minWeight = Math.max(isKgs ? 30 : 70, Math.floor(currentWeight - offset));
        const maxWeight = Math.min(isKgs ? 210 : 400, Math.ceil(currentWeight + offset));
        return Array.from({ length: maxWeight - minWeight + 1 }, (_, i) => ({
            value: minWeight + i,
            label: `${minWeight + i} ${unit}`,
        }));
    }
};

// Get slider range based on primary fitness goal
export const getSliderRange = (primaryGoal: PrimaryFitnessGoalType) => {
    const direction = getWeightDirection(primaryGoal);

    switch (direction) {
        case 'lose':
            return { min: 0.25, max: 1.5 }; // 0.25% to 1.5% per week (safe maximum)
        case 'gain':
            return { min: 0.15, max: 0.7 }; // 0.15% to 0.7% per week (beyond 1% is mostly fat)
        default:
            return { min: 0, max: 0.5 }; // Maintenance with minor fluctuations
    }
};

// Get recommended range for the current primary fitness goal
export const getRecommendedRange = (primaryGoal: PrimaryFitnessGoalType) => {
    const direction = getWeightDirection(primaryGoal);

    switch (direction) {
        case 'lose':
            return { min: 0.5, max: 1.0 }; // Optimal range for weight loss
        case 'gain':
            return { min: 0.25, max: 0.5 }; // Optimal range for lean weight gain
        default:
            return { min: 0, max: 0.25 }; // Maintenance range
    }
};

// Get approach label based on current percentage and primary fitness goal
export const getApproachLabel = (weeklyChangePercent: number, primaryGoal: PrimaryFitnessGoalType): string => {
    const direction = getWeightDirection(primaryGoal);

    if (direction === 'maintain') return 'Maintenance';

    const recommendedRange = getRecommendedRange(primaryGoal);

    if (weeklyChangePercent < recommendedRange.min) {
        return 'Conservative';
    } else if (weeklyChangePercent > recommendedRange.max) {
        return 'Aggressive';
    } else {
        return 'Standard';
    }
};

// Calculate goal calories and timeline based on primary fitness goal
export const calculateGoalCaloriesAndTimeline = (
    currentWeight: number,
    goalWeight: number,
    weeklyChangePercent: number,
    primaryGoal: PrimaryFitnessGoalType,
    TDEE: number,
    unit: WeightUnitType,
) => {
    const direction = getWeightDirection(primaryGoal);

    if (direction === 'maintain' || weeklyChangePercent === 0) {
        return {
            goalCalories: TDEE,
            timeline: 'Maintenance',
        };
    }

    const weightDifference = Math.abs(goalWeight - currentWeight);
    const currentWeightInKg = unit === 'kgs' ? currentWeight : currentWeight / 2.20462;
    const weeklyChangeAmount = (currentWeightInKg * weeklyChangePercent) / 100;
    const weeklyChangeInCurrentUnit = unit === 'kgs' ? weeklyChangeAmount : weeklyChangeAmount * 2.20462;

    if (weightDifference === 0) {
        return {
            goalCalories: TDEE,
            timeline: 'Maintenance',
        };
    }

    const estimatedWeeks = Math.ceil(weightDifference / weeklyChangeInCurrentUnit);

    // Calculate timeline string
    let timeline = '';
    const months = Math.floor(estimatedWeeks / 4.33);
    const weeks = Math.round(estimatedWeeks % 4.33);

    if (months === 0) {
        timeline = `${estimatedWeeks} week${estimatedWeeks > 1 ? 's' : ''}`;
    } else if (weeks === 0) {
        timeline = `${months} month${months > 1 ? 's' : ''}`;
    } else {
        timeline = `${months}m ${weeks}w`;
    }

    // Calculate goal calories (1kg ≈ 7700 calories, 1lb ≈ 3500 calories)
    const caloriesPerUnit = unit === 'kgs' ? 7700 : 3500;
    const weeklyCalorieChange = weeklyChangeInCurrentUnit * caloriesPerUnit;
    const dailyCalorieChange = weeklyCalorieChange / 7;

    let goalCalories = TDEE;
    if (direction === 'lose') {
        goalCalories = Math.max(TDEE - dailyCalorieChange, TDEE * 0.8); // Don't go below 80% of TDEE
    } else if (direction === 'gain') {
        goalCalories = TDEE + dailyCalorieChange;
    }

    return {
        goalCalories: Math.round(goalCalories),
        timeline,
    };
};

// Get safe protein upper limits based on research
export const getProteinUpperLimit = (): number => {
    // Research shows 3.5 g/kg is tolerable upper limit for well-adapted individuals
    // 2.0 g/kg is considered safe for long-term consumption in healthy adults
    return 3.5; // g/kg/day
};

// Validate protein intake against safety limits
export const isProteinIntakeSafe = (proteinGrams: number, bodyWeightKg: number): { safe: boolean; message?: string } => {
    const intakePerKg = proteinGrams / bodyWeightKg;
    const upperLimit = getProteinUpperLimit();

    if (intakePerKg > upperLimit) {
        return {
            safe: false,
            message: `Protein intake of ${intakePerKg.toFixed(1)} g/kg exceeds safe upper limit of ${upperLimit} g/kg`,
        };
    }

    if (intakePerKg > 2.0) {
        return {
            safe: true,
            message: `High protein intake (${intakePerKg.toFixed(1)} g/kg). Monitor hydration and consider periodic breaks.`,
        };
    }

    return { safe: true };
};
