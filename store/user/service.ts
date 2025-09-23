// store/user/service.ts

import {
    AddFoodEntryParams,
    AddFoodEntryResponse,
    CompleteProfileParams,
    CompleteProfileResponse,
    CreateSetModificationParams,
    CreateSubstitutionParams,
    GetSetModificationsParams,
    GetSubstitutionsParams,
    MealType,
    UpdateFoodEntryParams,
    UpdateFoodEntryResponse,
    UpdateSetModificationParams,
    UpdateSubstitutionParams,
    User,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSetModification,
    UserExerciseSubstitution,
    UserFitnessProfile,
    UserNutritionGoal,
    UserNutritionLog,
    UserNutritionPreferences,
    UserNutritionProfile,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';
import { authRecommendationsApiClient, authUsersApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';
import { authService } from '@/utils/auth';

// Types for sleep measurement parameters
interface SleepMeasurementParams {
    durationInMinutes?: number;
    sleepTime?: string;
    wakeTime?: string;
}

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

const completeDay = async (userId: string, dayId: string, isAutoComplete: boolean): Promise<UserProgramProgress | null> => {
    console.log('service: completeDay');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/program-progress/complete-day`, {
            dayId: parseInt(dayId),
            isAutoComplete: isAutoComplete,
        });

        if (!data.programProgress) {
            throw new Error('Program progress not found in response');
        }

        return data.programCompleted ? null : data.programProgress;
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

const logSleepMeasurement = async (userId: string, sleepParams: SleepMeasurementParams, measurementTimestamp: string): Promise<UserSleepMeasurement> => {
    console.log('service: logSleepMeasurement');
    try {
        const requestBody: any = {
            MeasurementTimestamp: measurementTimestamp,
        };

        // Add the appropriate fields based on what's provided
        if (sleepParams.durationInMinutes !== undefined) {
            requestBody.durationInMinutes = sleepParams.durationInMinutes;
        }

        if (sleepParams.sleepTime && sleepParams.wakeTime) {
            requestBody.sleepTime = sleepParams.sleepTime;
            requestBody.wakeTime = sleepParams.wakeTime;
        }

        const { data } = await authUsersApiClient.post(`/users/${userId}/sleep-measurements`, requestBody);
        return data.measurements;
    } catch (error) {
        throw handleApiError(error, 'LogSleepMeasurement');
    }
};

const updateSleepMeasurement = async (userId: string, timestamp: string, sleepParams: SleepMeasurementParams): Promise<UserSleepMeasurement> => {
    console.log('service: updateSleepMeasurement');
    try {
        const requestBody: any = {};

        // Add the appropriate fields based on what's provided
        if (sleepParams.durationInMinutes !== undefined) {
            requestBody.durationInMinutes = sleepParams.durationInMinutes;
        }

        if (sleepParams.sleepTime && sleepParams.wakeTime) {
            requestBody.sleepTime = sleepParams.sleepTime;
            requestBody.wakeTime = sleepParams.wakeTime;
        }

        const { data } = await authUsersApiClient.put(`/users/${userId}/sleep-measurements/${timestamp}`, requestBody);
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

// App Settings Methods
const getUserAppSettings = async (userId: string): Promise<UserAppSettings> => {
    console.log('service: getUserAppSettings');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/app-settings`);
        if (!data.userAppSettings) {
            throw new Error('Invalid response format');
        }
        return data.userAppSettings;
    } catch (error) {
        throw handleApiError(error, 'GetUserAppSettings');
    }
};

const updateUserAppSettings = async (userId: string, userAppSettings: UserAppSettings): Promise<UserAppSettings> => {
    console.log('service: updateUserAppSettings');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/app-settings`, userAppSettings);

        if (!data.userAppSettings) {
            throw new Error('Invalid response format');
        }

        return data.userAppSettings;
    } catch (error) {
        throw handleApiError(error, 'UpdateUserAppSettings');
    }
};

// Body Measurements Methods
const getBodyMeasurements = async (userId: string): Promise<UserBodyMeasurement[]> => {
    console.log('service: getBodyMeasurements');
    try {
        const { data } = await authUsersApiClient.get(`/users/${userId}/body-measurements`);
        return data.measurements || [];
    } catch (error) {
        throw handleApiError(error, 'GetBodyMeasurements');
    }
};

const logBodyMeasurement = async (userId: string, measurements: Record<string, number>, measurementTimestamp: string): Promise<UserBodyMeasurement> => {
    console.log('service: logBodyMeasurement');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/body-measurements`, {
            measurements,
            MeasurementTimestamp: measurementTimestamp,
        });
        return data.measurement;
    } catch (error) {
        throw handleApiError(error, 'LogBodyMeasurement');
    }
};

const updateBodyMeasurement = async (userId: string, timestamp: string, measurements: Record<string, number>): Promise<UserBodyMeasurement> => {
    console.log('service: updateBodyMeasurement');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/body-measurements/${timestamp}`, {
            measurements,
        });
        return data.measurement;
    } catch (error) {
        throw handleApiError(error, 'UpdateBodyMeasurement');
    }
};

const deleteBodyMeasurement = async (userId: string, timestamp: string): Promise<void> => {
    console.log('service: deleteBodyMeasurement');
    try {
        await authUsersApiClient.delete(`/users/${userId}/body-measurements/${timestamp}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteBodyMeasurement');
    }
};

// Exercise Substitution Methods
const getUserExerciseSubstitutions = async (userId: string, params?: GetSubstitutionsParams): Promise<UserExerciseSubstitution[]> => {
    console.log('service: getUserExerciseSubstitutions');
    try {
        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-substitutions`, { params });
        return data.substitutions || [];
    } catch (error) {
        throw handleApiError(error, 'GetUserExerciseSubstitutions');
    }
};

const createExerciseSubstitution = async (userId: string, substitutionData: CreateSubstitutionParams): Promise<UserExerciseSubstitution> => {
    console.log('service: createExerciseSubstitution');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/exercise-substitutions`, substitutionData);
        return data.substitution;
    } catch (error) {
        throw handleApiError(error, 'CreateExerciseSubstitution');
    }
};

const updateExerciseSubstitution = async (userId: string, substitutionId: string, updates: UpdateSubstitutionParams): Promise<UserExerciseSubstitution> => {
    console.log('service: updateExerciseSubstitution');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/exercise-substitutions/${substitutionId}`, updates);
        return data.substitution;
    } catch (error) {
        throw handleApiError(error, 'UpdateExerciseSubstitution');
    }
};

const deleteExerciseSubstitution = async (userId: string, substitutionId: string): Promise<void> => {
    console.log('service: deleteExerciseSubstitution');
    try {
        await authUsersApiClient.delete(`/users/${userId}/exercise-substitutions/${substitutionId}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteExerciseSubstitution');
    }
};

// Exercise Set Modification Methods
const getUserExerciseSetModifications = async (userId: string, params?: GetSetModificationsParams): Promise<UserExerciseSetModification[]> => {
    console.log('service: getUserExerciseSetModifications');
    try {
        const { data } = await authUsersApiClient.get(`/users/${userId}/exercise-set-modifications`, { params });
        return data.modifications || [];
    } catch (error) {
        throw handleApiError(error, 'GetUserExerciseSetModifications');
    }
};

const createExerciseSetModification = async (userId: string, modificationData: CreateSetModificationParams): Promise<UserExerciseSetModification> => {
    console.log('service: createExerciseSetModification');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/exercise-set-modifications`, modificationData);
        return data.modification;
    } catch (error) {
        throw handleApiError(error, 'CreateExerciseSetModification');
    }
};

const updateExerciseSetModification = async (
    userId: string,
    modificationId: string,
    updates: UpdateSetModificationParams,
): Promise<UserExerciseSetModification> => {
    console.log('service: updateExerciseSetModification');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/exercise-set-modifications/${modificationId}`, updates);
        return data.modification;
    } catch (error) {
        throw handleApiError(error, 'UpdateExerciseSetModification');
    }
};

const deleteExerciseSetModification = async (userId: string, modificationId: string): Promise<void> => {
    console.log('service: deleteExerciseSetModification');
    try {
        await authUsersApiClient.delete(`/users/${userId}/exercise-set-modifications/${modificationId}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteExerciseSetModification');
    }
};

// Nutrition Profile Methods
const getUserNutritionProfile = async (userId: string): Promise<UserNutritionProfile> => {
    console.log('service: getUserNutritionProfile');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-profile`);
        if (!data.userNutritionProfile) {
            throw new Error('Invalid response format');
        }
        return data.userNutritionProfile;
    } catch (error) {
        throw handleApiError(error, 'GetUserNutritionProfile');
    }
};

const updateUserNutritionProfile = async (
    userId: string,
    userNutritionProfile: UserNutritionProfile,
): Promise<{
    user: User;
    userNutritionProfile: UserNutritionProfile;
}> => {
    console.log('service: updateUserNutritionProfile');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/nutrition-profile`, userNutritionProfile);

        if (!data.user || !data.userNutritionProfile) {
            throw new Error('Invalid response format');
        }

        return {
            user: data.user,
            userNutritionProfile: data.userNutritionProfile,
        };
    } catch (error) {
        throw handleApiError(error, 'UpdateUserNutritionProfile');
    }
};

// Nutrition Preferences Methods
const getUserNutritionPreferences = async (userId: string): Promise<UserNutritionPreferences> => {
    console.log('service: getUserNutritionPreferences');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-preferences`);
        if (!data.userNutritionPreferences) {
            throw new Error('Invalid response format');
        }
        return data.userNutritionPreferences;
    } catch (error) {
        throw handleApiError(error, 'GetUserNutritionPreferences');
    }
};

const updateUserNutritionPreferences = async (
    userId: string,
    userNutritionPreferences: UserNutritionPreferences,
): Promise<{
    user: User;
    userNutritionPreferences: UserNutritionPreferences;
}> => {
    console.log('service: updateUserNutritionPreferences');
    try {
        const { data } = await authUsersApiClient.put(`/users/${userId}/nutrition-preferences`, userNutritionPreferences);

        if (!data.user || !data.userNutritionPreferences) {
            throw new Error('Invalid response format');
        }

        return {
            user: data.user,
            userNutritionPreferences: data.userNutritionPreferences,
        };
    } catch (error) {
        throw handleApiError(error, 'UpdateUserNutritionPreferences');
    }
};

const completeUserProfile = async (profileData: CompleteProfileParams): Promise<CompleteProfileResponse> => {
    console.log('service: completeUserProfile');
    try {
        const userId = await authService.getUserId();
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.put(`/users/${userId}/complete-profile`, profileData);

        if (!data.user || !data.userFitnessProfile || !data.userRecommendations) {
            throw new Error('Invalid response format - missing required data');
        }

        return {
            user: data.user,
            userFitnessProfile: data.userFitnessProfile,
            userNutritionProfile: data.userNutritionProfile || null,
            userNutritionPreferences: data.userNutritionPreferences || null,
            userRecommendations: data.userRecommendations,
            userNutritionGoal: data.userNutritionGoal,
            calculated: data.calculated,
        };
    } catch (error) {
        throw handleApiError(error, 'CompleteUserProfile');
    }
};

const getUserNutritionGoalHistory = async (userId: string): Promise<UserNutritionGoal[]> => {
    console.log('service: getUserNutritionGoalHistory');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-goal-history`);

        return data.goals || [];
    } catch (error) {
        throw handleApiError(error, 'GetUserNutritionGoalHistory');
    }
};

const createNutritionGoalEntry = async (
    userId: string,
    goalData: {
        goalCalories: number;
        goalMacros: { Protein: number; Carbs: number; Fat: number };
        tdee: number;
        weightGoal: number;
    },
    adjustmentReason?: string,
    adjustmentNotes?: string,
): Promise<UserNutritionGoal> => {
    console.log('service: createNutritionGoalEntry');
    try {
        const { data } = await authUsersApiClient.post(`/users/${userId}/nutrition-goal-history`, {
            ...goalData,
            adjustmentReason: adjustmentReason || 'MANUAL_UPDATE',
            adjustmentNotes,
        });

        if (!data.goalEntry) {
            throw new Error('Invalid response format');
        }

        return data.goalEntry;
    } catch (error) {
        throw handleApiError(error, 'CreateNutritionGoalEntry');
    }
};

// Nutrition Logs Methods

// Get all nutrition logs for a user (no date filter)
const getAllNutritionLogs = async (userId: string): Promise<UserNutritionLog[]> => {
    console.log('service: getAllNutritionLogs');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-logs`);

        return data.nutritionLogs || [];
    } catch (error) {
        throw handleApiError(error, 'GetAllNutritionLogs');
    }
};

const getBulkNutritionLogs = async (userId: string, dates: string[]): Promise<{ [date: string]: UserNutritionLog | null }> => {
    console.log('service: getBulkNutritionLogs');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-logs/bulk`, {
            params: { dates: dates.join(',') },
        });

        return data.nutritionLogs || {};
    } catch (error) {
        throw handleApiError(error, 'GetBulkNutritionLogs');
    }
};

// Get nutrition logs with optional filters
const getNutritionLogsWithFilters = async (
    userId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    },
): Promise<{ nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any }> => {
    console.log('service: getNutritionLogsWithFilters');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-logs`, {
            params: filters,
        });

        return {
            nutritionLogs: data.nutritionLogs || [],
            count: data.count || 0,
            lastEvaluatedKey: data.lastEvaluatedKey || null,
        };
    } catch (error) {
        throw handleApiError(error, 'GetNutritionLogsWithFilters');
    }
};

// Get nutrition logs for specific dates (batch request)
const getNutritionLogsForDates = async (userId: string, dates: string[]): Promise<{ [date: string]: UserNutritionLog | null }> => {
    console.log('service: getNutritionLogsForDates');
    try {
        if (!userId) throw new Error('No user ID found');

        // TODO: When batch API is ready, replace this with a single batch request
        // For now, make individual requests for each date
        const results: { [date: string]: UserNutritionLog | null } = {};

        await Promise.all(
            dates.map(async (date) => {
                try {
                    // Inline the API call logic instead of calling getNutritionLogs
                    const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-logs`, {
                        params: { date },
                    });
                    results[date] = data.nutritionLog;
                } catch (error) {
                    console.warn(`Failed to load nutrition log for ${date}:`, error);
                    results[date] = null;
                }
            }),
        );

        return results;
    } catch (error) {
        throw handleApiError(error, 'GetNutritionLogsForDates');
    }
};

// Updated existing method to be more explicit
const getNutritionLogForDate = async (userId: string, date: string): Promise<UserNutritionLog | null> => {
    console.log('service: getNutritionLogForDate');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.get(`/users/${userId}/nutrition-logs`, {
            params: { date },
        });

        return data.nutritionLog;
    } catch (error) {
        throw handleApiError(error, 'GetNutritionLogForDate');
    }
};

const addFoodEntry = async (userId: string, date: string, entryData: AddFoodEntryParams): Promise<AddFoodEntryResponse> => {
    console.log('service: addFoodEntry');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.post(`/users/${userId}/nutrition-logs/${date}/meals`, entryData);

        return data;
    } catch (error) {
        throw handleApiError(error, 'AddFoodEntry');
    }
};

const updateFoodEntry = async (
    userId: string,
    date: string,
    mealType: MealType,
    entryKey: string,
    updates: UpdateFoodEntryParams,
): Promise<UpdateFoodEntryResponse> => {
    console.log('service: updateFoodEntry');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.put(`/users/${userId}/nutrition-logs/${date}/meals/${mealType}/entries/${entryKey}`, updates);

        return data;
    } catch (error) {
        throw handleApiError(error, 'UpdateFoodEntry');
    }
};

const deleteFoodEntry = async (userId: string, date: string, mealType: MealType, entryKey: string): Promise<UserNutritionLog> => {
    console.log('service: deleteFoodEntry');
    try {
        if (!userId) throw new Error('No user ID found');

        const { data } = await authUsersApiClient.delete(`/users/${userId}/nutrition-logs/${date}/meals/${mealType}/entries/${entryKey}`);

        return data.nutritionLog;
    } catch (error) {
        throw handleApiError(error, 'DeleteFoodEntry');
    }
};

const deleteSpecificDayLog = async (userId: string, date: string): Promise<void> => {
    console.log('service: deleteSpecificDayLog');
    try {
        if (!userId) throw new Error('No user ID found');

        await authUsersApiClient.delete(`/users/${userId}/nutrition-logs/${date}`);
    } catch (error) {
        throw handleApiError(error, 'DeleteSpecificDayLog');
    }
};

export default {
    // User Profile
    getUser,
    updateUser,
    // onboarding
    completeUserProfile,
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
    // App Settings
    getUserAppSettings,
    updateUserAppSettings,
    // Body Measurements
    getBodyMeasurements,
    logBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
    // Exercise Substitutions
    getUserExerciseSubstitutions,
    createExerciseSubstitution,
    updateExerciseSubstitution,
    deleteExerciseSubstitution,
    // Exercise Set Modifications
    getUserExerciseSetModifications,
    createExerciseSetModification,
    updateExerciseSetModification,
    deleteExerciseSetModification,
    // Nutrition Profile
    getUserNutritionProfile,
    updateUserNutritionProfile,
    // Nutrition Preferences
    getUserNutritionPreferences,
    updateUserNutritionPreferences,
    // Nutrition Goal History
    getUserNutritionGoalHistory,
    createNutritionGoalEntry,
    // Nutrition Logs
    getAllNutritionLogs,
    getBulkNutritionLogs,
    getNutritionLogsWithFilters,
    getNutritionLogForDate,
    getNutritionLogsForDates,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    deleteSpecificDayLog,
};
