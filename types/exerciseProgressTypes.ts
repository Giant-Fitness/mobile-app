// types/exerciseProgressTypes.ts

export interface ExerciseSet {
    weight: number;
    reps: number;
    timestamp: string; // HH:mm:ss
    notes?: string;
    setNumber?: number;
}

export interface ExerciseLog {
    exerciseId: string;
    sets: ExerciseSet[];
    createdAt: string;
    updatedAt: string;
}
