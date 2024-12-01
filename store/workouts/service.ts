// store/workouts/service.ts

import { Workout, WorkoutRecommendations } from '@/types';
import { authCatalogApiClient, authRecommendationsApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';

const getAllWorkouts = async (): Promise<Workout[]> => {
    console.log('service: getAllWorkouts');
    try {
        const { data } = await authCatalogApiClient.get('/workouts');
        return data.workouts || [];
    } catch (error) {
        throw handleApiError(error, 'GetAllWorkouts');
    }
};

const getWorkout = async (workoutId: string): Promise<Workout | undefined> => {
    console.log('service: getWorkout');
    try {
        const { data } = await authCatalogApiClient.get(`/workouts/${workoutId}`);
        return data.workout;
    } catch (error) {
        throw handleApiError(error, 'GetWorkout');
    }
};

const getWorkouts = async (workoutIds: string[]): Promise<Workout[]> => {
    console.log('service: getWorkouts');
    try {
        const { data } = await authCatalogApiClient.get('/workouts/batch', {
            params: {
                workoutIds: workoutIds.join(','),
            },
        });
        return data.workouts || [];
    } catch (error) {
        throw handleApiError(error, 'GetWorkouts');
    }
};

const getSpotlightWorkouts = async (): Promise<WorkoutRecommendations> => {
    console.log('service: getSpotlightWorkouts');
    try {
        const { data } = await authRecommendationsApiClient.get('/recommendations/workouts/spotlight');
        return data;
    } catch (error) {
        throw handleApiError(error, 'GetSpotlightWorkouts');
    }
};

export default {
    getAllWorkouts,
    getWorkout,
    getWorkouts,
    getSpotlightWorkouts,
};
