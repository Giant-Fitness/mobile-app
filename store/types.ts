// store/types.ts

export interface ProgramCalendarOverviewItem {
    Title: string;
    Description: string;
}

export interface Program {
    WorkoutPlanId: string;
    WorkoutPlanName: string;
    TrainerId?: string; // Optional field
    ProgramLength: number;
    Description: string;
    Level: string;
    Type: string;
    Goal: string;
    CreationDate: string;
    LastModified: string;
    PhotoUrl: string;
    Archived: boolean;
    CalendarOverview: ProgramCalendarOverviewItem[];
    EquipmentCategory: string;
    Equipment: string[];
    Frequency: string;
    DesignedFor: string;
}

export interface Quote {
    QuoteType: string;
    QuoteId: string;
    QuoteText: string;
    Author?: string;
    Context: string;
    Active: boolean;
    CreatedDate: string;
    LastModifiedDate: string;
}

export interface MuscleGroups {
    Primary: string[];
    Secondary: string[];
}

export interface Exercise {
    ExerciseId: string;
    ExerciseName: string;
    Category: string;
    MuscleGroups: MuscleGroups;
    InstructionsDetailed: string;
    QuickTip: string;
    VideoUrl: string;
    CreationDate: string;
    LastModified: string;
    Archived: boolean;
    Sets: number;
    Reps: number;
    WeightInstructions: string;
}

export interface ProgramDay {
    WorkoutPlanId: string;
    WorkoutDayId: string;
    Week: string;
    Day: string;
    WorkoutDayTitle: string;
    RestDay: boolean;
    Exercises: Exercise[];
    Notes: string;
    PhotoUrl: string;
    CreationDate: string;
    LastModified: string;
    Time: number; // Time in minutes
    MuscleGroups: string[];
    EquipmentCategory: string;
    Equipment: string[];
}

export interface UserWorkoutPlanProgress {
    UserId: string;
    WorkoutPlanId: string;
    CurrentDay: string;
    Week: string;
    Day: string;
    StartDate: string;
    LastActivityDate: string;
}
