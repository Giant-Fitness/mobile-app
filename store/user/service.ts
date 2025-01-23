// store/user/service.ts

import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile, UserWeightMeasurement, UserSleepMeasurement } from '@/types';
import { authUsersApiClient, authRecommendationsApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';
import { authService } from '@/utils/auth';

// User Profile Methods
const getUser = async (): Promise<User> => {
    console.log('service: getUser');
    try {
        const userId = await authService.getUserId();
        const { data } = await authUsersApiClient.get(`/users/${userId}`);
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

        const { data } = await authUsersApiClient.put(`/users/${userId}`, updates);
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

        const { data } = await authUsersApiClient.get(`/users/${userId}/fitness-profile`);
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
        const { data } = await authUsersApiClient.put(`/users/${userId}/fitness-profile`, userFitnessProfile);

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
        const { data } = await authUsersApiClient.get(`/users/${userId}/program-progress`);
        return data.programProgress;
    } catch (error) {
        throw handleApiError(error, 'GetUserProgramProgress');
    }
};

const completeDay = async (userId: string, dayId: string): Promise<UserProgramProgress> => {
    console.log('service: completeDay');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/program-progress/complete-day`, { dayId: parseInt(dayId) });

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
        const { data } = await authUsersApiClient.put(`/users/${userId}/program-progress/uncomplete-day`, { dayId: parseInt(dayId) });

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
        const { data } = await authUsersApiClient.put(`/users/${userId}/program-progress/end`);

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
        const { data } = await authUsersApiClient.post(`/users/${userId}/program-progress`, { programId });

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
        const { data } = await authUsersApiClient.put(`/users/${userId}/program-progress/reset`);

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
        const { data } = await authUsersApiClient.get(`/users/${userId}/weight-measurements`);
        return data.measurements || [];
    } catch (error) {
        throw handleApiError(error, 'GetWeightMeasurements');
    }
};

const logWeightMeasurement = async (userId: string, weight: number, measurementTimestamp: string): Promise<UserWeightMeasurement> => {
    console.log('service: logWeightMeasurement');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/weight-measurements`, {
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
        const { data } = await authUsersApiClient.put(`/users/${userId}/weight-measurements/${timestamp}`, { weight });
        return data.measurement;
    } catch (error) {
        throw handleApiError(error, 'UpdateWeightMeasurement');
    }
};

const deleteWeightMeasurement = async (userId: string, timestamp: string): Promise<void> => {
    console.log('service: deleteWeightMeasurement');
    try {
        await authUsersApiClient.delete(`/users/${userId}/weight-measurements/${timestamp}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteWeightMeasurement');
    }
};

// Recommendations Methods
const getUserRecommendations = async (userId: string): Promise<UserRecommendations> => {
    console.log('service: getUserRecommendations');
    try {
        const { data } = await authRecommendationsApiClient.get(`/recommendations/personalized/${userId}`);
        return data.userRecommendations;
    } catch (error) {
        throw handleApiError(error, 'GetUserRecommendations');
    }
};

// Sleep Measurements Methods
const getSleepMeasurements = async (userId: string): Promise<UserSleepMeasurement[]> => {
    console.log('service: getSleepMeasurements');
    try {
        const { data } = await authUsersApiClient.get(`/users/${userId}/sleep-measurements`);
        return data.measurements || [];
    } catch (error) {
        throw handleApiError(error, 'GetSleepMeasurements');
    }
};

const logSleepMeasurement = async (userId: string, durationInMinutes: number, measurementTimestamp: string): Promise<UserSleepMeasurement> => {
    console.log('service: logSleepMeasurement');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/sleep-measurements`, {
            durationInMinutes,
            MeasurementTimestamp: measurementTimestamp,
        });
        return data.measurements;
    } catch (error) {
        throw handleApiError(error, 'LogSleepMeasurement');
    }
};

const updateSleepMeasurement = async (userId: string, timestamp: string, durationInMinutes: number): Promise<UserSleepMeasurement> => {
    console.log('service: updateSleepMeasurement');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/sleep-measurements/${timestamp}`, { durationInMinutes });
        return data.measurement;
    } catch (error) {
        throw handleApiError(error, 'UpdateSleepMeasurement');
    }
};

const deleteSleepMeasurement = async (userId: string, timestamp: string): Promise<void> => {
    console.log('service: deleteSleepMeasurement');
    try {
        await authUsersApiClient.delete(`/users/${userId}/sleep-measurements/${timestamp}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteSleepMeasurement');
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
    // Sleep measurements
    getSleepMeasurements,
    logSleepMeasurement,
    updateSleepMeasurement,
    deleteSleepMeasurement,
};
