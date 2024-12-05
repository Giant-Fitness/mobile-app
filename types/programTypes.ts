// types/programTypes.ts

// Future considerations:
// - Add support for supersets
// - Add workout sections (warmup, main, cooldown)

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
    WhyChooseThisProgram: string;
}

export interface MuscleGroups {
    Primary: string[];
    Secondary: string[];
}

export interface Exercise {
    ExerciseId: string;
    ExerciseName: string;
    Category: string;
    Type: string;
    MuscleGroups: MuscleGroups;
    InstructionsDetailed: string[];
    QuickTip: string;
    VideoUrl: string;
    PhotoUrl: string;
    CreatedAt: string;
    UpdatedAt: string;
    Archived: boolean;
    LoggingType: string;
    LoggingInstructions: string;
    Sets: number;
    RepsUpper: number;
    RepsLower: number;
    Rest: number;
    ORMPercentage: number;
}

export interface ProgramDay {
    ProgramId: string;
    DayId: string;
    DayTitle: string;
    RestDay: boolean;
    // A day can either be a video workout or a set of exercises
    Type: 'video' | 'workout';
    // For video type days
    WorkoutId?: string;
    // For workout type days
    Exercises?: Exercise[];
    PhotoUrl?: string;
    CreatedAt: string;
    UpdatedAt: string;
    Time: number; // Time in minutes
    MuscleGroups: string[];
    EquipmentCategory: string;
    Equipment: string[];
}
