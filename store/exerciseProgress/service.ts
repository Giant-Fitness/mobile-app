// store/exerciseProgress/service.ts

import { authUsersApiClient } from '@/lib/api/apiConfig';
import { handleApiError } from '@/lib/api/errorUtils';
import { ExerciseLog, ExerciseSet } from '@/types/exerciseProgressTypes';

/**
 * Get ALL exercise logs for a user (for initial sync)
 * This is the key method for populating SQLite on first run
 */
const getAllExerciseLogs = async (
    userId: string,
    params?: {
        startDate?: string;
        endDate?: string;
        limit?: number; // Limit per exercise or total?
    },
): Promise<ExerciseLog[]> => {
    console.log('service: getAllExerciseLogs');
    try {
        const queryString = new URLSearchParams({
            ...(params?.startDate && { startDate: params.startDate }),
            ...(params?.endDate && { endDate: params.endDate }),
            ...(params?.limit && { limit: params.limit.toString() }),
        }).toString();

        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-progress${queryString ? `?${queryString}` : ''}`);

        // Expecting: { logs: ExerciseLog[] }
        return data.logs || [];
    } catch (error) {
        throw handleApiError(error, 'GetAllExerciseLogs');
    }
};

/**
 * Get history for a specific exercise
 */
const getExerciseHistory = async (
    userId: string,
    exerciseId: string,
    params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    },
): Promise<ExerciseLog[]> => {
    console.log('service: getExerciseHistory');
    try {
        const queryString = new URLSearchParams({
            ...(params?.startDate && { startDate: params.startDate }),
            ...(params?.endDate && { endDate: params.endDate }),
            ...(params?.limit && { limit: params.limit.toString() }),
        }).toString();

        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-progress/${exerciseId}${queryString ? `?${queryString}` : ''}`);

        return data.history || [];
    } catch (error) {
        throw handleApiError(error, 'GetExerciseHistory');
    }
};

/**
 * Save exercise progress (create/update)
 */
const saveExerciseProgress = async (userId: string, exerciseId: string, date: string, sets: ExerciseSet[]): Promise<ExerciseLog> => {
    console.log('service: saveExerciseProgress');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/exercise-progress/${exerciseId}`, { date, sets });

        if (!data.log) {
            throw new Error(data.message || 'Failed to save exercise progress');
        }

        return data.log;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
    }
};

/**
 * Delete exercise log
 */
const deleteExerciseLog = async (userId: string, exerciseId: string, date: string): Promise<void> => {
    console.log('service: deleteExerciseLog');
    try {
        await authUsersApiClient.delete(`/users/${userId}/exercise-progress/${exerciseId}?date=${date}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteExerciseLog');
    }
};

export default {
    getAllExerciseLogs,
    getExerciseHistory,
    saveExerciseProgress,
    deleteExerciseLog,
};
