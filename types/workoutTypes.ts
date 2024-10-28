// types/workoutTypes.ts

export interface Workout {
    WorkoutId: string;
    WorkoutName: string;
    Time: number;
    Level: string;
    WorkoutCategory: string;
    WorkoutType: string;
    TargetedMuscles: string[];
    TrainerId?: string;
    DescriptionLong: string;
    CreatedAt: string;
    UpdatedAt: string;
    EquipmentCategory: string;
    Equipment?: string[];
    PhotoUrl: string;
    VideoUrl: string;
    Archived: boolean;
}

export interface WorkoutRecommendations {
    RecommendationType: string; // "Spotlight", "Endurance", "Mobility", "Strength"
    WorkoutIds: string[];
}
