// types/userTypes.ts

export interface User {
    UserId: string;
    OnboardingStatus: UserOnboardingStatus;
    FirstName: string;
}

export interface UserOnboardingStatus {
    biodata: boolean;
    fitness: boolean;
    nutrition: boolean;
}

export interface UserProgramProgress {
    UserId: string;
    ProgramId: string;
    CurrentDay: number;
    CompletedDays: string[];
    StartAt: string;
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
