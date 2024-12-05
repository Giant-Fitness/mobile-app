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
