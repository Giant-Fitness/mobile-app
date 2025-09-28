// types/userTypes.ts

export interface User {
    UserId: string;
    Height?: number;
    DOB?: string;
    Gender?: string;
    FirstName: string;
    OnboardingComplete?: boolean;
}

export interface UserProgramProgress {
    UserId: string;
    ProgramId: string;
    CurrentDay: number;
    CompletedDays: string[];
    StartedAt: string;
    LastActivityAt: string;
    LastAction?: string;
    LastActionWasAutoComplete?: boolean;
}

export interface UserRecommendations {
    UserId: string;
    RecommendedProgramID: string;
}

export interface UserFitnessProfile {
    UserId: string;
    GymExperienceLevel: string;
    AccessToEquipment: string;
    DaysPerWeekDesired: string;
    PrimaryFitnessGoal: string;
}

export interface UserWeightMeasurement {
    UserId: string;
    MeasurementTimestamp: string;
    Weight: number;
}

export interface UserSleepMeasurement {
    UserId: string;
    MeasurementTimestamp: string;
    DurationInMinutes: number;
    SleepTime?: string;
    WakeTime?: string;
}

export interface UserAppSettingsMeasurementUnitsItem {
    BodyWeightUnits: string;
    LiftWeightUnits: string;
    BodyMeasurementUnits: string;
}

export interface UserAppSettings {
    UserId: string;
    UnitsOfMeasurement: UserAppSettingsMeasurementUnitsItem;
}

export interface UserBodyMeasurement {
    UserId: string;
    MeasurementTimestamp: string;
    // Specific measurements
    waist?: number;
    hip?: number;
    chest?: number;
    neck?: number;
    shoulder?: number;
    abdomen?: number;
    leftBicep?: number;
    rightBicep?: number;
    leftThigh?: number;
    rightThigh?: number;
    leftCalf?: number;
    rightCalf?: number;
    // Derived measurements
    waistHipRatio?: number;
    UpdatedAt: string;
}

// Type for sleep submission data
export type SleepSubmissionData = {
    durationInMinutes?: number;
    sleepTime?: string;
    wakeTime?: string;
};

export interface UserNutritionProfile {
    UserId: string;
    PrimaryNutritionGoal: string;
    ActivityLevel: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

export interface UserNutritionGoal {
    UserId: string;
    EffectiveDate: string; // YYYY-MM-DD format
    GoalCalories: number;
    GoalMacros: {
        Protein: number;
        Carbs: number;
        Fat: number;
    };
    TDEE: number;
    WeightGoal: number;
    StartingWeight: number;
    AdjustmentReason: 'INITIAL_CALCULATION' | 'ADAPTIVE_ADJUSTMENT' | 'MANUAL_UPDATE';
    AdjustmentNotes?: string;
    PreviousGoalDate?: string;
    CreatedAt: string;
    IsActive: boolean;
}

export interface CompleteProfileParams {
    // Biodata
    Height: number;
    Gender: string;
    DOB: string;
    Weight: number;
    ActivityLevel?: string;

    PrimaryFitnessGoal: string;

    // Fitness
    GymExperienceLevel: string;
    DaysPerWeekDesired: string;
    AccessToEquipment: string;

    // Nutrition
    TargetWeight?: number;
    WeightChangeRate?: number;
    OverrideTDEE?: number;
    IsCaloriesOverridden?: string;

    // Unit preferences
    BodyWeightUnits?: string;
    BodyMeasurementUnits?: string;
}

export interface CompleteProfileResponse {
    user: User;
    userFitnessProfile: UserFitnessProfile;
    userNutritionProfile?: UserNutritionProfile;
    userNutritionGoal: UserNutritionGoal;
    userRecommendations: UserRecommendations;
    calculated: {
        TDEE: number;
        timeline?: string;
        initialWeight: number;
    };
    userAppSettings?: UserAppSettings;
}
