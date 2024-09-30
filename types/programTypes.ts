// types/programTypes.ts

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
    DescriptionShort: string;
    DescriptionLong: string;
    Level: string;
    Type: string;
    Goal: string;
    CreatedAt: string;
    UpdatedAt: string;
    PhotoUrl: string;
    Archived: boolean;
    CalendarOverview: ProgramCalendarOverviewItem[];
    EquipmentCategory: string;
    Equipment: string[];
    Frequency: string;
    DesignedFor: string;
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
    PhotoUrl: string;
    CreatedAt: string;
    UpdatedAt: string;
    Archived: boolean;
    Sets: number;
    RepsUpper: number;
    RepsLower: number;
    Rest: number;
    ORMPercentage: number;
}

export interface ProgramDay {
    ProgramId: number;
    DayId: string;
    DayTitle: string;
    RestDay: boolean;
    Exercises: Exercise[];
    PhotoUrl: string;
    CreatedAt: string;
    UpdatedAt: string;
    Time: number; // Time in minutes
    MuscleGroups: string[];
    EquipmentCategory: string;
    Equipment: string[];
}
