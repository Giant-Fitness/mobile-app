// store/user/service.ts

import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile, UserWeightMeasurement } from '@/types';
import { authApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';
import { authService } from '@/utils/auth';

// User Profile Methods
const getUser = async (): Promise<User> => {
    console.log('service: getUser');
    try {
        const userId = await authService.getUserId();
        const { data } = await authApiClient.get(`/users/${userId}`);
        return data.user;
    } catch (error) {
        throw handleApiError(error, 'GetUser');
    }
};

const updateUser = async (updates: Partial<User>): Promise<User> => {
    console.log('service: updateUser');
    try {
        const userId = await authService.getUserId();
        if (!userId) throw new Error('No user ID found');

        const { data } = await authApiClient.put(`/users/${userId}`, updates);
        if (!data.user) {
            throw new Error('Invalid response format');
        }
        return data.user;
    } catch (error) {
        throw handleApiError(error, 'UpdateUser');
    }
};

// Fitness Profile Methods
const getUserFitnessProfile = async (userId: string): Promise<UserFitnessProfile> => {
    console.log('service: getUserFitnessProfile');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authApiClient.get(`/users/${userId}/fitnessprofile`);
        if (!data.userFitnessProfile) {
            throw new Error('Invalid response format');
        }
        return data.userFitnessProfile;
    } catch (error) {
        throw handleApiError(error, 'GetUserFitnessProfile');
    }
};

const updateUserFitnessProfile = async (
    userId: string,
    userFitnessProfile: UserFitnessProfile,
): Promise<{
    user: User;
    userRecommendations: UserRecommendations;
    userFitnessProfile: UserFitnessProfile;
}> => {
    console.log('service: updateUserFitnessProfile');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/fitnessprofile`, userFitnessProfile);

        if (!data.user || !data.userRecommendations || !data.userFitnessProfile) {
            throw new Error('Invalid response format');
        }

        return {
            user: data.user,
            userRecommendations: data.userRecommendations,
            userFitnessProfile: data.userFitnessProfile,
        };
    } catch (error) {
        throw handleApiError(error, 'UpdateUserFitnessProfile');
    }
};

// Program Progress Methods
const getUserProgramProgress = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: getUserProgramProgress');
    try {
        const { data } = await authApiClient.get(`/users/${userId}/programprogress`);
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'GetUserProgramProgress');
    }
};

const completeDay = async (userId: string, dayId: string): Promise<UserProgramProgress> => {
    console.log('service: completeDay');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/programprogress/complete-day`, { dayId: parseInt(dayId) });

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }

        return data.programCompleted ? {} : data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'CompleteDay');
    }
};

const uncompleteDay = async (userId: string, dayId: string): Promise<UserProgramProgress> => {
    console.log('service: uncompleteDay');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/programprogress/uncomplete-day`, { dayId: parseInt(dayId) });

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'UncompleteDay');
    }
};

const endProgram = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: endProgram');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/programprogress/end`);

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'EndProgram');
    }
};

const startProgram = async (userId: string, programId: string): Promise<UserProgramProgress> => {
    console.log('service: startProgram');
    try {
        const { data } = await authApiClient.post(`/users/${userId}/programprogress`, { programId });

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'StartProgram');
    }
};

const resetProgram = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: resetProgram');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/programprogress/reset`);

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'ResetProgram');
    }
};

// Weight Measurements Methods
const getWeightMeasurements = async (userId: string): Promise<UserWeightMeasurement[]> => {
    console.log('service: getWeightMeasurements');
    try {
        const { data } = await authApiClient.get(`/users/${userId}/weight-measurements`);
        return data.measurements || [];
    } catch (error) {
        throw handleApiError(error, 'GetWeightMeasurements');
    }
};

const logWeightMeasurement = async (userId: string, weight: number, measurementTimestamp: string): Promise<UserWeightMeasurement> => {
    console.log('service: logWeightMeasurement');
    try {
        const { data } = await authApiClient.post(`/users/${userId}/weight-measurements`, {
            weight,
            MeasurementTimestamp: measurementTimestamp,
        });
        return data.measurements;
    } catch (error) {
        throw handleApiError(error, 'LogWeightMeasurement');
    }
};

const updateWeightMeasurement = async (userId: string, timestamp: string, weight: number): Promise<UserWeightMeasurement> => {
    console.log('service: updateWeightMeasurement');
    try {
        const { data } = await authApiClient.put(`/users/${userId}/weight-measurements/${timestamp}`, { weight });
        return data.measurement;
    } catch (error) {
        throw handleApiError(error, 'UpdateWeightMeasurement');
    }
};

const deleteWeightMeasurement = async (userId: string, timestamp: string): Promise<void> => {
    console.log('service: deleteWeightMeasurement');
    try {
        await authApiClient.delete(`/users/${userId}/weight-measurements/${timestamp}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteWeightMeasurement');
    }
};

// Recommendations Methods
const getUserRecommendations = async (userId: string): Promise<UserRecommendations> => {
    console.log('service: getUserRecommendations');
    try {
        const { data } = await authApiClient.get(`/recommendations/personalized/${userId}`);
        return data.userRecommendations;
    } catch (error) {
        throw handleApiError(error, 'GetUserRecommendations');
    }
};

export default {
    // User Profile
    getUser,
    updateUser,
    // Fitness Profile
    getUserFitnessProfile,
    updateUserFitnessProfile,
    // Program Progress
    getUserProgramProgress,
    completeDay,
    uncompleteDay,
    endProgram,
    startProgram,
    resetProgram,
    // Weight Measurements
    getWeightMeasurements,
    logWeightMeasurement,
    updateWeightMeasurement,
    deleteWeightMeasurement,
    // Recommendations
    getUserRecommendations,
};
