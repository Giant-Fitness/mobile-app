// types/exerciseProgressTypes.ts

export interface ExerciseSet {
    SetNumber: number;
    Weight?: number; // Optional - for strength exercises and bodyweight with added weight
    Reps?: number; // For reps-based exercises
    Time?: number; // For time-based exercises (in seconds)
    Notes?: string;
    Timestamp: string;
}

export interface ExerciseLog {
    UserId: string;
    ExerciseLogId: string;
    ExerciseId: string;
    Date: string;
    UserExerciseId: string;
    Sets: ExerciseSet[];
    CreatedAt: string;
    UpdatedAt: string;
}

// Helper types for the UI
export type ExerciseLoggingMode =
    | 'strength-reps' // weight + reps (current)
    | 'bodyweight-reps' // reps + optional weight
    | 'bodyweight-time' // time + optional weight
    | 'plyometric-reps' // reps only
    | 'plyometric-time'; // time only

export interface SetInput {
    reps?: string;
    time?: string; // in seconds, but displayed as mm:ss
    weight?: string;
}

// Utility function to determine logging mode
export const getExerciseLoggingMode = (exercise: { Type: string; LoggingType: string }): ExerciseLoggingMode => {
    const { Type, LoggingType } = exercise;

    if (Type === 'strength' && LoggingType === 'reps') return 'strength-reps';
    if (Type === 'bodyweight' && LoggingType === 'reps') return 'bodyweight-reps';
    if (Type === 'bodyweight' && LoggingType === 'time') return 'bodyweight-time';
    if (Type === 'plyometric' && LoggingType === 'reps') return 'plyometric-reps';
    if (Type === 'plyometric' && LoggingType === 'time') return 'plyometric-time';

    // Default fallback
    return 'strength-reps';
};

// Helper function to check if exercise is loggable
export const isExerciseLoggable = (exercise: { Type: string; LoggingType: string }): boolean => {
    const validTypes = ['strength', 'bodyweight', 'plyometric'];
    const validLoggingTypes = ['reps', 'time'];

    return validTypes.includes(exercise.Type) && validLoggingTypes.includes(exercise.LoggingType);
};

// Helper function to check if weight is supported for this exercise
export const supportsWeight = (mode: ExerciseLoggingMode): boolean => {
    return ['strength-reps', 'bodyweight-reps', 'bodyweight-time'].includes(mode);
};

// Helper function to check if weight is required
export const requiresWeight = (mode: ExerciseLoggingMode): boolean => {
    return mode === 'strength-reps';
};

// Time formatting utilities
export const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseTimeInput = (timeString: string): number => {
    // Handle formats like "1:30", "90", "01:30"
    if (timeString.includes(':')) {
        const [mins, secs] = timeString.split(':').map(Number);
        return (mins || 0) * 60 + (secs || 0);
    } else {
        // Just seconds
        return parseInt(timeString) || 0;
    }
};
