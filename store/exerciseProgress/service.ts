// store/exerciseProgress/service.ts

import { authUsersApiClient } from '@/lib/api/apiConfig';
import { handleApiError } from '@/lib/api/errorUtils';
import { ExerciseLog, ExerciseSet } from '@/types/exerciseProgressTypes';

const getExerciseLogs = async (userId: string, date?: string): Promise<{ [exerciseLogId: string]: ExerciseLog }> => {
    console.log('service: getExerciseLogs');
    try {
        const queryParams = date ? `?date=${date}` : '';
        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-progress${queryParams}`);
        return data.logs;
    } catch (error) {
        throw handleApiError(error, 'GetExerciseLogs');
    }
};

const getExerciseHistory = async (
    userId: string,
    exerciseId: string,
    params: { startDate?: string; endDate?: string; limit?: number },
): Promise<{ [exerciseLogId: string]: ExerciseLog }> => {
    console.log('service: getExerciseHistory');
    try {
        const queryString = new URLSearchParams({
            ...(params.startDate && { startDate: params.startDate }),
            ...(params.endDate && { endDate: params.endDate }),
            ...(params.limit && { limit: params.limit.toString() }),
        }).toString();

        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-progress/${exerciseId}${queryString ? `?${queryString}` : ''}`);
        return data.history;
    } catch (error) {
        throw handleApiError(error, 'GetExerciseHistory');
    }
};

const saveExerciseProgress = async (userId: string, exerciseId: string, date: string, sets: ExerciseSet[]): Promise<ExerciseLog> => {
    console.log('service: saveExerciseProgress');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/exercise-progress/${exerciseId}`, { date, sets });
        if (!data.log) {
            throw new Error(data.message || 'Failed to save exercise progress');
        }
        return data.log;
    } catch (error: any) {
        // Ensure we're passing the actual error message up
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
    }
};

const deleteExerciseLog = async (userId: string, exerciseId: string, date: string): Promise<void> => {
    console.log('service: deleteExerciseLog');
    try {
        await authUsersApiClient.delete(`/users/${userId}/exercise-progress/${exerciseId}?date=${date}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteExerciseLog');
    }
};

export default {
    getExerciseLogs,
    getExerciseHistory,
    saveExerciseProgress,
    deleteExerciseLog,
};
