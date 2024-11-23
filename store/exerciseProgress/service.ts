// store/exerciseProgress/service.ts

import { ExerciseSet, ExerciseLog } from '@/types/exerciseProgressTypes';
import { authApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';

const getExerciseLogs = async (userId: string, date?: string): Promise<{ [exerciseLogId: string]: ExerciseLog }> => {
    console.log('service: getExerciseLogs');
    try {
        const queryParams = date ? `?date=${date}` : '';
        const { data } = await authApiClient.get(`/users/${userId}/exercise-progress${queryParams}`);
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

        const { data } = await authApiClient.get(`/users/${userId}/exercise-progress/${exerciseId}${queryString ? `?${queryString}` : ''}`);
        return data.logs;
    } catch (error) {
        throw handleApiError(error, 'GetExerciseHistory');
    }
};

const saveExerciseProgress = async (userId: string, exerciseId: string, date: string, sets: ExerciseSet[]): Promise<ExerciseLog> => {
    console.log('service: saveExerciseProgress');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/exercise-progress/${exerciseId}`, { date, sets });
        return data.log;
    } catch (error) {
        throw handleApiError(error, 'SaveExerciseProgress');
    }
};

const deleteExerciseLog = async (userId: string, exerciseId: string, date: string): Promise<void> => {
    console.log('service: deleteExerciseLog');
    try {
        await authApiClient.delete(`/users/${userId}/exercise-progress/${exerciseId}?date=${date}`);
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
