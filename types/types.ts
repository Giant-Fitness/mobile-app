// types/types.ts

export interface ProgramCalendarOverviewItem {
    Title: string;
    Description: string;
}

export interface Program {
    ProgramId: string;
    ProgramName: string;
    TrainerId?: string;
    Weeks: number;
    Days: number;
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
    InstructionsDetailed: string[];
    QuickTip: string;
    VideoUrl: string;
    BannerUrl: string;
    CreationDate: string;
    LastModified: string;
    Archived: boolean;
    Sets: number;
    RepsUpper: number;
    RepsLower: number;
    Rest: string;
    ORMPercentage: number;
}

export interface ProgramDay {
    ProgramId: string;
    DayId: string;
    Week: string;
    Day: string;
    DayTitle: string;
    RestDay: boolean;
    Exercises: Exercise[];
    PhotoUrl: string;
    CreationDate: string;
    LastModified: string;
    Time: number; // Time in minutes
    MuscleGroups: string[];
    EquipmentCategory: string;
    Equipment: string[];
}

export interface UserProgramProgress {
    UserId: string;
    ProgramId: string;
    CurrentDay: string;
    Week: string;
    Day: string;
    StartDate: string;
    LastActivityDate: string;
}
