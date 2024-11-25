// store/exerciseProgress/utils.ts

// Map UUIDs to names for the major compound lifts we want to track long-term
export const LONG_TERM_TRACKED_LIFT_IDS = {
    '8ed55182-3ce4-4037-9c11-9b0bd6585c12': 'Back Squat',
    '14c6f113-6ea9-494d-a326-f68e7bcb7c29': 'Barbell Bench Press',
    'ad623e7f-6436-44cf-b542-a7a8f08a1d50': 'Deadlift',
    'cf747c0a-b1aa-4b2d-9b59-a5f77148d140': 'Barbell Overhead Press',
} as const;

export type LongTermTrackedLiftId = keyof typeof LONG_TERM_TRACKED_LIFT_IDS;

// Helper to identify if an exercise needs full history
export const isLongTermTrackedLift = (exerciseId: string): exerciseId is LongTermTrackedLiftId => {
    return exerciseId in LONG_TERM_TRACKED_LIFT_IDS;
};

// Helper to generate exerciseLogId
export const generateExerciseLogId = (exerciseId: string, date: string) => `${exerciseId}#${date}`;

// Helper to parse exerciseLogId
export const parseExerciseLogId = (exerciseLogId: string) => {
    const [exerciseId, date] = exerciseLogId.split('#');
    return { exerciseId, date };
};
