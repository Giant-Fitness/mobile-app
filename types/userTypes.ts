// types/userTypes.ts

// Data source enum for health integrations
export enum DataSource {
    MANUAL = 'manual',
    APPLE_HEALTH = 'apple_health',
    HEALTH_CONNECT = 'health_connect',
}

// Sleep stage data from health platforms
export interface SleepStages {
    deep?: number; // minutes
    rem?: number; // minutes
    light?: number; // minutes
    awake?: number; // minutes
}

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
    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string; // ID from health platform for deduplication
    LastSyncedAt?: string; // ISO timestamp
    IsModified?: boolean; // true if user edited synced data
}

export interface UserSleepMeasurement {
    UserId: string;
    MeasurementTimestamp: string;
    DurationInMinutes: number;
    SleepTime?: string;
    WakeTime?: string;
    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string;
    LastSyncedAt?: string;
    IsModified?: boolean;
    SleepStages?: SleepStages; // Optional sleep stage data from health platforms
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
    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string;
    LastSyncedAt?: string;
    IsModified?: boolean;
}

// Type for sleep submission data
export type SleepSubmissionData = {
    durationInMinutes?: number;
    sleepTime?: string;
    wakeTime?: string;
};

// Health integration settings
export interface UserHealthIntegrationSettings {
    UserId: string;
    AppleHealthEnabled?: boolean;
    AppleHealthConnectedAt?: string; // ISO timestamp
    AppleHealthLastSyncAt?: string; // ISO timestamp
    HealthConnectEnabled?: boolean;
    HealthConnectConnectedAt?: string; // ISO timestamp
    HealthConnectLastSyncAt?: string; // ISO timestamp
    // Sync preferences
    AutoSyncEnabled?: boolean;
    SyncFrequency?: 'daily' | 'hourly' | 'manual';
    SyncHistoryDays?: number; // How many days of history to sync (default 30)
    // Write-back preferences (for future phase)
    WriteBackEnabled?: boolean;
    WriteBackDataTypes?: Array<'weight' | 'sleep' | 'body_measurements'>;
}
