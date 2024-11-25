// types/exerciseProgressTypes.ts

export interface ExerciseSet {
    Weight: number;
    Reps: number;
    Timestamp: string; // HH:mm:ss
    Notes?: string;
    SetNumber?: number;
}

export interface ExerciseLog {
    ExerciseLogId: string;
    ExerciseId: string;
    Sets: ExerciseSet[];
    CreatedAt: string;
    UpdatedAt: string;
    Date: string;
}
