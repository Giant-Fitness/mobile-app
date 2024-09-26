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
