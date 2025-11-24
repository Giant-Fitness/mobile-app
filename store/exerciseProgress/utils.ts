// store/exerciseProgress/utils.ts

// Helper to generate exerciseLogId
export const generateExerciseLogId = (exerciseId: string, date: string) => `${exerciseId}#${date}`;

// Helper to parse exerciseLogId
export const parseExerciseLogId = (exerciseLogId: string) => {
    const [exerciseId, date] = exerciseLogId.split('#');
    return { exerciseId, date };
};
