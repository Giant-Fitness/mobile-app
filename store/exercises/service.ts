// store/exercises/service.ts

import { authCatalogApiClient } from '@/lib/api/apiConfig';
import { handleApiError } from '@/lib/api/errorUtils';
import { Exercise, ExerciseAlternative } from '@/types';

/**
 * Service for accessing exercise-related API endpoints
 * This service is for infrequent actions that don't need to be in the main Redux state
 */
const getExerciseAlternatives = async (exerciseId: string, params?: { equipment?: string; limit?: number }): Promise<ExerciseAlternative[]> => {
    console.log('service: getExerciseAlternatives');
    try {
        const { data } = await authCatalogApiClient.get(`/exercises/${exerciseId}/alternatives`, { params });
        return data.alternatives || [];
    } catch (error) {
        throw handleApiError(error, 'GetExerciseAlternatives');
    }
};

/**
 * Get all exercises
 */
const getAllExercises = async (): Promise<Record<string, Exercise>> => {
    console.log('service: getAllExercises');
    try {
        const { data } = await authCatalogApiClient.get('/exercises');

        // Convert array to dictionary with ExerciseId as key for faster lookups
        const exercisesMap: Record<string, Exercise> = {};
        data.exercises.forEach((exercise: Exercise) => {
            exercisesMap[exercise.ExerciseId] = exercise;
        });

        return exercisesMap;
    } catch (error) {
        throw handleApiError(error, 'GetAllExercises');
    }
};

/**
 * Get a specific exercise by ID
 */
const getExerciseById = async (exerciseId: string): Promise<Exercise> => {
    console.log(`service: getExerciseById ${exerciseId}`);
    try {
        const { data } = await authCatalogApiClient.get(`/exercises/${exerciseId}`);
        return data.exercise;
    } catch (error) {
        throw handleApiError(error, 'GetExerciseById');
    }
};

export default {
    getAllExercises,
    getExerciseById,
    getExerciseAlternatives,
};
