// store/user/thunks.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService } from '@/lib/cache/cacheService';
import { appSettingsOfflineService } from '@/lib/storage/app-settings/AppSettingsOfflineService';
import { bodyMeasurementOfflineService } from '@/lib/storage/body-measurements/BodyMeasurementOfflineService';
import { exerciseSetModificationOfflineService } from '@/lib/storage/exercise-set-modifications/ExerciseSetModificationOfflineService';
import { exerciseSubstitutionOfflineService } from '@/lib/storage/exercise-substitutions/ExerciseSubstitutionOfflineService';
import { fitnessProfileOfflineService } from '@/lib/storage/fitness-profile/FitnessProfileOfflineService';
import { programProgressOfflineService } from '@/lib/storage/program-progress/ProgramProgressOfflineService';
import { weightMeasurementOfflineService } from '@/lib/storage/weight-measurements/WeightMeasurementOfflineService';
import { networkStateManager } from '@/lib/sync/NetworkStateManager';
import { RootState } from '@/store/store';
import UserService from '@/store/user/service';
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
    UserMacroTarget,
    UserNutritionGoal,
    UserNutritionLog,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';

import { createAsyncThunk } from '@reduxjs/toolkit';

const TESTING = {
    SIMULATE_WEIGHT_FAILURE: __DEV__ && false,
    SIMULATE_SLEEP_FAILURE: __DEV__ && false,
    SIMULATE_BODY_FAILURE: __DEV__ && false,
    SIMULATE_DELAYS: __DEV__ && false,
    DELAY_MS: 3000,
};

export const getUserAsync = createAsyncThunk<User, { forceRefresh?: boolean; useCache?: boolean } | void>('user/getUser', async (args = {}, { getState }) => {
    const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
    const state = getState() as RootState;

    if (state.user.user && !forceRefresh) {
        return state.user.user;
    }

    // Try cache first if enabled and not forcing refresh
    if (useCache && !forceRefresh) {
        const cached = await cacheService.get<User>('user_data');

        if (cached) {
            console.log('Loaded user data from cache');
            return cached;
        }
    }

    // Load from API
    console.log('Loading user data from API');
    const user = await UserService.getUser();

    // Cache the result if useCache is enabled
    if (useCache) {
        await cacheService.set('user_data', user);
    }

    return user;
});

export const updateUserAsync = createAsyncThunk<
    User,
    Partial<User>,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateUser', async (updates, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        // Update the user
        const updatedUser = await UserService.updateUser(updates);

        // Invalidate user cache after update
        if (userId) {
            await cacheService.remove('user_data');
        }

        return updatedUser;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update user',
        });
    }
});

/**
 * Get user fitness profile (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getUserFitnessProfileAsync = createAsyncThunk<
    UserFitnessProfile,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserFitnessProfile', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading fitness profile from SQLite...');
        const localProfile = await fitnessProfileOfflineService.getProfileForUser(userId);

        if (localProfile) {
            console.log('Found fitness profile in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background fitness profile sync...');
                        const serverProfile = await UserService.getUserFitnessProfile(userId);
                        await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);
                    } catch (error) {
                        console.warn('Background fitness profile sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing fitness profile from server...');
                    const serverProfile = await UserService.getUserFitnessProfile(userId);
                    await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);

                    // Reload from SQLite to get merged data
                    const refreshedProfile = await fitnessProfileOfflineService.getProfileForUser(userId);
                    return refreshedProfile ? refreshedProfile.data : localProfile.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localProfile.data;
        }

        // No local profile found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local fitness profile found, fetching from server...');
            const serverProfile = await UserService.getUserFitnessProfile(userId);

            // Store in SQLite for future offline use
            await fitnessProfileOfflineService.mergeServerData(userId, serverProfile);

            return serverProfile;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No fitness profile available offline' });
    } catch (error) {
        console.error('Failed to get fitness profile:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch fitness profile',
        });
    }
});

/**
 * Update user fitness profile (offline-first with optimistic update)
 */
export const updateUserFitnessProfileAsync = createAsyncThunk<
    { user: User; userRecommendations: UserRecommendations; userFitnessProfile: UserFitnessProfile },
    { userFitnessProfile: UserFitnessProfile },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateFitnessProfile', async ({ userFitnessProfile }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    if (!networkStateManager.isOnline()) {
        return rejectWithValue({
            errorMessage: 'Internet connection required to update fitness profile',
        });
    }

    try {
        const serverResult = await UserService.updateUserFitnessProfile(userId, userFitnessProfile);

        // Cache the fresh data we just received
        await Promise.all([cacheService.set('user_data', serverResult.user), cacheService.set('user_recommendations', serverResult.userRecommendations)]);

        return serverResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update fitness profile',
        });
    }
});

export const getUserRecommendationsAsync = createAsyncThunk<
    UserRecommendations,
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserRecommendations', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;
        const userId = state.user.user?.UserId;

        // Check if user ID exists
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached recommendations if available and not forcing refresh
        if (state.user.userRecommendations && !forceRefresh) {
            return state.user.userRecommendations;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_recommendations`;
            const cached = await cacheService.get<UserRecommendations>(cacheKey);

            if (cached) {
                console.log('Loaded user recommendations from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading user recommendations from API');
        const userRecommendations = await UserService.getUserRecommendations(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_recommendations`;
            await cacheService.set(cacheKey, userRecommendations);
        }

        return userRecommendations;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch user recommendations',
        });
    }
});

// Helper functions to match backend logic exactly while handling string/number conversion
const completeUpToDay = (existingCompletedDays: string[], dayId: string): string[] => {
    // Convert strings to numbers for calculation
    const dayNumber = parseInt(dayId, 10);
    const existingNumbers = existingCompletedDays.map((d) => parseInt(d, 10));

    // Complete all days up to and including the specified day
    const allDaysUpTo = Array.from({ length: dayNumber }, (_, i) => i + 1);
    const completedSet = new Set([...existingNumbers, ...allDaysUpTo]);

    // Convert back to strings and return sorted
    return Array.from(completedSet)
        .sort((a, b) => a - b)
        .map((d) => d.toString());
};

const calculateNewCurrentDay = (updatedCompletedDays: string[], dayId: string, totalDays: number): number => {
    const dayNumber = parseInt(dayId, 10);
    const completedNumbers = updatedCompletedDays.map((d) => parseInt(d, 10));

    // If completing the last day, current day stays at total days
    if (dayNumber === totalDays) {
        return totalDays;
    }

    // Otherwise, find the next uncompleted day
    for (let i = dayNumber + 1; i <= totalDays; i++) {
        if (!completedNumbers.includes(i)) {
            return i;
        }
    }

    // If all subsequent days are completed, return the day after the last day
    return dayNumber + 1;
};

/**
 * Get user program progress (offline-first)
 */
export const getUserProgramProgressAsync = createAsyncThunk<
    UserProgramProgress,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserProgramProgress', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading program progress from SQLite...');
        const localProgress = await programProgressOfflineService.getProgressForUser(userId);

        if (localProgress) {
            console.log('Found program progress in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background program progress sync...');
                        const serverProgress = await UserService.getUserProgramProgress(userId);
                        await programProgressOfflineService.mergeServerData(userId, serverProgress);
                    } catch (error) {
                        console.warn('Background program progress sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing program progress from server...');
                    const serverProgress = await UserService.getUserProgramProgress(userId);
                    await programProgressOfflineService.mergeServerData(userId, serverProgress);

                    // Reload from SQLite to get merged data
                    const refreshedProgress = await programProgressOfflineService.getProgressForUser(userId);
                    return refreshedProgress ? refreshedProgress.data : localProgress.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localProgress.data;
        }

        // No local progress found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local program progress found, fetching from server...');
            const serverProgress = await UserService.getUserProgramProgress(userId);

            // Store in SQLite for future offline use
            await programProgressOfflineService.mergeServerData(userId, serverProgress);

            return serverProgress;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No program progress available offline' });
    } catch (error) {
        console.error('Failed to get program progress:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch program progress',
        });
    }
});

/**
 * Start program (offline-first with optimistic update)
 */
export const startProgramAsync = createAsyncThunk<
    UserProgramProgress,
    { programId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/startProgram', async ({ programId }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Create optimistic local record immediately
        console.log('Creating program progress locally...');
        const now = new Date().toISOString();
        const optimisticProgress = await programProgressOfflineService.upsertProgress({
            userId,
            data: {
                ProgramId: programId,
                CurrentDay: 1,
                CompletedDays: [],
                StartedAt: now,
                LastActivityAt: now,
                LastAction: 'start',
                LastActionWasAutoComplete: false,
            },
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing program start to server...');
                const serverResult = await UserService.startProgram(userId, programId);

                // Update local record as synced
                await programProgressOfflineService.updateSyncStatus(optimisticProgress.localId, 'synced', {});

                console.log('Program start successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync program start to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await programProgressOfflineService.updateSyncStatus(optimisticProgress.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('Program started offline (will sync when online)');
        return optimisticProgress.data;
    } catch (error) {
        console.error('Failed to start program:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to start program',
        });
    }
});

/**
 * Complete day (offline-first with optimistic update matching backend logic)
 */
export const completeDayAsync = createAsyncThunk<
    UserProgramProgress | null,
    { dayId: string; isAutoComplete?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeDay', async ({ dayId, isAutoComplete = false }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Get current progress from SQLite
        const currentProgress = await programProgressOfflineService.getProgressForUser(userId);

        if (!currentProgress) {
            return rejectWithValue({ errorMessage: 'No active program progress found' });
        }

        // Get the program to know total days (you might need to get this from Redux state or cache)
        // For now, assuming we have it or using a high number as fallback
        const programState = state.programs.programs[currentProgress.data.ProgramId];
        const totalDays = programState?.Days || 999; // Fallback to high number

        // Apply backend logic exactly: complete all days up to and including dayId
        console.log('Completing day locally with backend logic...');
        const now = new Date().toISOString();
        const updatedCompletedDays = completeUpToDay(currentProgress.data.CompletedDays, dayId);
        const newCurrentDay = calculateNewCurrentDay(updatedCompletedDays, dayId, totalDays);

        await programProgressOfflineService.update(currentProgress.localId, {
            CurrentDay: newCurrentDay,
            CompletedDays: updatedCompletedDays,
            LastActivityAt: now,
            LastAction: 'complete',
            LastActionWasAutoComplete: isAutoComplete,
        });

        // Get updated progress from SQLite
        const updatedProgress = await programProgressOfflineService.getById(currentProgress.localId);
        if (!updatedProgress) {
            throw new Error('Failed to retrieve updated progress');
        }

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing day completion to server...');
                const serverResult = await UserService.completeDay(userId, dayId, isAutoComplete);

                // Update local record as synced
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'synced', {});

                console.log('Day completion successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync day completion to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('Day completed offline (will sync when online)');
        return updatedProgress.data;
    } catch (error) {
        console.error('Failed to complete day:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to complete day',
        });
    }
});

/**
 * Uncomplete day (offline-first with optimistic update matching backend logic)
 */
export const uncompleteDayAsync = createAsyncThunk<
    UserProgramProgress,
    { dayId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/uncompleteDay', async ({ dayId }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Get current progress from SQLite
        const currentProgress = await programProgressOfflineService.getProgressForUser(userId);

        if (!currentProgress) {
            return rejectWithValue({ errorMessage: 'No active program progress found' });
        }

        // Convert dayId to number for backend logic
        const dayNumber = parseInt(dayId, 10);

        // Apply backend logic exactly: filter out the specified day and any days after it
        console.log('Uncompleting day locally with backend logic...');
        const now = new Date().toISOString();
        const updatedCompletedDays = currentProgress.data.CompletedDays.map((d) => parseInt(d, 10)) // Convert to numbers for comparison
            .filter((day) => day < dayNumber)
            .sort((a, b) => a - b)
            .map((d) => d.toString()); // Convert back to strings

        await programProgressOfflineService.update(currentProgress.localId, {
            CurrentDay: dayNumber, // Backend sets newCurrentDay = dayId
            CompletedDays: updatedCompletedDays,
            LastActivityAt: now,
            LastAction: 'uncomplete',
            LastActionWasAutoComplete: false,
        });

        // Get updated progress from SQLite
        const updatedProgress = await programProgressOfflineService.getById(currentProgress.localId);
        if (!updatedProgress) {
            throw new Error('Failed to retrieve updated progress');
        }

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing day uncompletion to server...');
                const serverResult = await UserService.uncompleteDay(userId, dayId);

                // Update local record as synced
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'synced', {});

                console.log('Day uncompletion successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync day uncompletion to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('Day uncompleted offline (will sync when online)');
        return updatedProgress.data;
    } catch (error) {
        console.error('Failed to uncomplete day:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to uncomplete day',
        });
    }
});

/**
 * End program (offline-first with optimistic update)
 */
export const endProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/endProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Get current progress from SQLite
        const currentProgress = await programProgressOfflineService.getProgressForUser(userId);

        if (!currentProgress) {
            return rejectWithValue({ errorMessage: 'No active program progress found' });
        }

        // Update optimistically in SQLite to mark as ended
        console.log('Ending program locally...');
        const now = new Date().toISOString();

        await programProgressOfflineService.update(currentProgress.localId, {
            LastActivityAt: now,
            LastAction: 'end',
            LastActionWasAutoComplete: false,
        });

        // Get updated progress from SQLite
        const updatedProgress = await programProgressOfflineService.getById(currentProgress.localId);
        if (!updatedProgress) {
            throw new Error('Failed to retrieve updated progress');
        }

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing program end to server...');
                const serverResult = await UserService.endProgram(userId);

                // Delete local record since program is ended
                if (!serverResult || !serverResult.ProgramId) {
                    await programProgressOfflineService.delete(currentProgress.localId);
                    console.log('Program ended and local record deleted');
                    return null; // Return null to indicate no active program
                }

                // Update local record as synced (shouldn't happen, but just in case)
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'synced', {});

                console.log('Program end successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync program end to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('Program ended offline (will sync when online)');
        return updatedProgress.data;
    } catch (error) {
        console.error('Failed to end program:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to end program',
        });
    }
});

/**
 * Reset program (offline-first with optimistic update matching backend logic)
 */
export const resetProgramAsync = createAsyncThunk<UserProgramProgress, void>('user/resetProgram', async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Get current progress from SQLite
        const currentProgress = await programProgressOfflineService.getProgressForUser(userId);

        if (!currentProgress) {
            return rejectWithValue({ errorMessage: 'No active program progress found' });
        }

        // Apply backend logic exactly: reset to day 1 with empty completed days
        console.log('Resetting program locally with backend logic...');
        const now = new Date().toISOString();

        await programProgressOfflineService.update(currentProgress.localId, {
            CurrentDay: 1,
            CompletedDays: [],
            LastActivityAt: now,
            LastAction: 'uncomplete', // Backend uses 'uncomplete' for reset
            LastActionWasAutoComplete: false,
        });

        // Get updated progress from SQLite
        const updatedProgress = await programProgressOfflineService.getById(currentProgress.localId);
        if (!updatedProgress) {
            throw new Error('Failed to retrieve updated progress');
        }

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing program reset to server...');
                const serverResult = await UserService.resetProgram(userId);

                // Update local record as synced
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'synced', {});

                console.log('Program reset successfully synced to server');
                return serverResult;
            } catch (syncError) {
                console.warn('Failed to sync program reset to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await programProgressOfflineService.updateSyncStatus(currentProgress.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('Program reset offline (will sync when online)');
        return updatedProgress.data;
    } catch (error) {
        console.error('Failed to reset program:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to reset program',
        });
    }
});

/**
 * Get user app settings (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getUserAppSettingsAsync = createAsyncThunk<
    UserAppSettings,
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserAppSettings', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading app settings from SQLite...');
        const localSettings = await appSettingsOfflineService.getSettingsForUser(userId);

        if (localSettings) {
            console.log('Found app settings in SQLite');

            // Background server sync (non-blocking) unless force refresh
            if (networkStateManager.isOnline() && !forceRefresh) {
                setTimeout(async () => {
                    try {
                        console.log('Triggering background app settings sync...');
                        const serverSettings = await UserService.getUserAppSettings(userId);
                        await appSettingsOfflineService.mergeServerData(userId, serverSettings);
                    } catch (error) {
                        console.warn('Background app settings sync failed:', error);
                    }
                }, 100);
            }

            // Force refresh: synchronous server sync
            if (forceRefresh && networkStateManager.isOnline()) {
                try {
                    console.log('Force refreshing app settings from server...');
                    const serverSettings = await UserService.getUserAppSettings(userId);
                    await appSettingsOfflineService.mergeServerData(userId, serverSettings);

                    // Reload from SQLite to get merged data
                    const refreshedSettings = await appSettingsOfflineService.getSettingsForUser(userId);
                    return refreshedSettings ? refreshedSettings.data : localSettings.data;
                } catch (error) {
                    console.warn('Force refresh failed, using local data:', error);
                }
            }

            return localSettings.data;
        }

        // No local settings found - try server
        if (networkStateManager.isOnline()) {
            console.log('No local app settings found, fetching from server...');
            const serverSettings = await UserService.getUserAppSettings(userId);

            // Store in SQLite for future offline use
            await appSettingsOfflineService.mergeServerData(userId, serverSettings);

            return serverSettings;
        }

        // Offline and no local data
        return rejectWithValue({ errorMessage: 'No app settings available offline' });
    } catch (error) {
        console.error('Failed to get app settings:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch app settings',
        });
    }
});

/**
 * Update user app settings (offline-first with optimistic update)
 */
export const updateUserAppSettingsAsync = createAsyncThunk<
    { userAppSettings: UserAppSettings },
    { userAppSettings: UserAppSettings },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateUserAppSettings', async ({ userAppSettings }, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.user.user?.UserId;

    if (!userId) {
        return rejectWithValue({ errorMessage: 'User ID not available' });
    }

    try {
        // Optimistically update local SQLite immediately
        console.log('Updating app settings locally...');
        const updatedSettings = await appSettingsOfflineService.upsertSettings({
            userId,
            data: {
                UnitsOfMeasurement: userAppSettings.UnitsOfMeasurement,
            },
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing app settings to server...');
                const serverResult = await UserService.updateUserAppSettings(userId, userAppSettings);

                // Update local record as synced
                await appSettingsOfflineService.updateSyncStatus(updatedSettings.localId, 'synced', {
                    serverTimestamp: new Date().toISOString(),
                });

                console.log('App settings successfully synced to server');
                const normalizedResult: { userAppSettings: UserAppSettings } = (serverResult as any)?.userAppSettings
                    ? (serverResult as any)
                    : { userAppSettings: serverResult as UserAppSettings };
                return normalizedResult;
            } catch (syncError) {
                console.warn('Failed to sync app settings to server, will retry later:', syncError);

                // Mark as failed but don't fail the whole operation since we have local data
                await appSettingsOfflineService.updateSyncStatus(updatedSettings.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return optimistic result based on local update
        console.log('App settings updated offline (will sync when online)');
        return {
            userAppSettings: updatedSettings.data,
        };
    } catch (error) {
        console.error('Failed to update app settings:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update app settings',
        });
    }
});

/**
 * Get user exercise substitutions (offline-first with filtering)
 */
export const getUserExerciseSubstitutionsAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { params?: GetSubstitutionsParams; forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserExerciseSubstitutions', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { params, forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading exercise substitutions from SQLite...');
        const localSubstitutions = await exerciseSubstitutionOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            programId: params?.programId,
            includeTemporary: params?.includeTemporary,
            date: params?.date,
        });

        // Convert to API format
        const substitutions: UserExerciseSubstitution[] = localSubstitutions.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background exercise substitutions sync...');
                    const serverSubstitutions = await UserService.getUserExerciseSubstitutions(userId, params);
                    await exerciseSubstitutionOfflineService.mergeServerData(userId, serverSubstitutions);
                } catch (error) {
                    console.warn('Background exercise substitutions sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing exercise substitutions from server...');
                const serverSubstitutions = await UserService.getUserExerciseSubstitutions(userId, params);
                await exerciseSubstitutionOfflineService.mergeServerData(userId, serverSubstitutions);

                // Reload from SQLite to get merged data
                const refreshedSubstitutions = await exerciseSubstitutionOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    programId: params?.programId,
                    includeTemporary: params?.includeTemporary,
                    date: params?.date,
                });

                return refreshedSubstitutions.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${substitutions.length} exercise substitutions from offline storage`);
        return substitutions;
    } catch (error) {
        console.error('Failed to get exercise substitutions:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise substitutions',
        });
    }
});

/**
 * Create exercise substitution (offline-first with optimistic update)
 */
export const createExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    CreateSubstitutionParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createExerciseSubstitution', async (substitutionData, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create optimistically in SQLite
        console.log('Creating exercise substitution locally...');
        const now = new Date().toISOString();

        await exerciseSubstitutionOfflineService.create({
            userId,
            data: {
                originalExerciseId: substitutionData.originalExerciseId,
                substituteExerciseId: substitutionData.substituteExerciseId,
                programId: substitutionData.programId || null,
                isTemporary: substitutionData.isTemporary || false,
                temporaryDate: substitutionData.temporaryDate || null,
            },
            timestamp: now,
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing substitution creation to server...');
                await UserService.createExerciseSubstitution(userId, substitutionData);

                // Refresh from server to get all substitutions with server IDs
                const serverSubstitutions = await UserService.getUserExerciseSubstitutions(userId);
                await exerciseSubstitutionOfflineService.mergeServerData(userId, serverSubstitutions);

                console.log('Substitution creation successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync substitution creation to server, will retry later:', syncError);
                // Local data remains, will retry via sync queue
            }
        }

        // Return updated list from SQLite
        const updatedSubstitutions = await exerciseSubstitutionOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log('Exercise substitution created offline (will sync when online)');
        return updatedSubstitutions.map((local) => local.data);
    } catch (error) {
        console.error('Failed to create exercise substitution:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create exercise substitution',
        });
    }
});

/**
 * Update exercise substitution (offline-first with optimistic update)
 */
export const updateExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { substitutionId: string; updates: UpdateSubstitutionParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateExerciseSubstitution', async ({ substitutionId, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by SubstitutionId
        const localRecord = await exerciseSubstitutionOfflineService.getBySubstitutionId(userId, substitutionId);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Exercise substitution not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating exercise substitution locally...');
        await exerciseSubstitutionOfflineService.update(localRecord.localId, {
            substituteExerciseId: updates.substituteExerciseId,
            isTemporary: updates.isTemporary,
            temporaryDate: updates.temporaryDate,
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing substitution update to server...');
                await UserService.updateExerciseSubstitution(userId, substitutionId, updates);

                // Mark as synced
                await exerciseSubstitutionOfflineService.updateSyncStatus(localRecord.localId, 'synced', {});

                console.log('Substitution update successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync substitution update to server, will retry later:', syncError);

                // Mark as failed
                await exerciseSubstitutionOfflineService.updateSyncStatus(localRecord.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return updated list from SQLite
        const updatedSubstitutions = await exerciseSubstitutionOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log('Exercise substitution updated offline');
        return updatedSubstitutions.map((local) => local.data);
    } catch (error) {
        console.error('Failed to update exercise substitution:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update exercise substitution',
        });
    }
});

/**
 * Delete exercise substitution (offline-first with optimistic update)
 */
export const deleteExerciseSubstitutionAsync = createAsyncThunk<
    UserExerciseSubstitution[],
    { substitutionId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteExerciseSubstitution', async ({ substitutionId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by SubstitutionId
        const localRecord = await exerciseSubstitutionOfflineService.getBySubstitutionId(userId, substitutionId);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Exercise substitution not found' });
        }

        // Delete from local storage (optimistic update)
        // The service handles queueing for server deletion if needed
        console.log('Deleting exercise substitution from local storage...');
        await exerciseSubstitutionOfflineService.delete(localRecord.localId);

        // Try to sync deletion to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing substitution deletion to server...');
                await UserService.deleteExerciseSubstitution(userId, substitutionId);

                console.log('Substitution deletion successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync substitution deletion to server:', syncError);
                // Deletion already happened locally, might need manual resolution if sync fails
            }
        }

        // Return updated list from SQLite
        const updatedSubstitutions = await exerciseSubstitutionOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log(`Exercise substitution deleted offline (${updatedSubstitutions.length} remaining)`);
        return updatedSubstitutions.map((local) => local.data);
    } catch (error) {
        console.error('Failed to delete exercise substitution:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise substitution',
        });
    }
});

/**
 * Get weight measurements (offline-first)
 * Loads immediately from SQLite, triggers background server sync
 */
export const getWeightMeasurementsAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getWeightMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading weight measurements from SQLite...');
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        // Convert to API format
        const measurements: UserWeightMeasurement[] = localMeasurements.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background weight measurements sync...');
                    const serverMeasurements = await UserService.getWeightMeasurements(userId);
                    await weightMeasurementOfflineService.mergeServerData(userId, serverMeasurements);
                } catch (error) {
                    console.warn('Background weight measurements sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing weight measurements from server...');
                const serverMeasurements = await UserService.getWeightMeasurements(userId);
                await weightMeasurementOfflineService.mergeServerData(userId, serverMeasurements);

                // Reload from SQLite to get merged data
                const refreshedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    orderBy: 'DESC',
                });

                return refreshedMeasurements.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${measurements.length} weight measurements from offline storage`);
        return measurements;
    } catch (error) {
        console.log(error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to load weight measurements',
        });
    }
});

/**
 * Log weight measurement (offline-first with smart duplicate handling)
 * Automatically switches to update mode if entry already exists for the date
 */
export const logWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { weight: number; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logWeightMeasurement', async ({ weight, measurementTimestamp }, { getState, rejectWithValue, dispatch }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const timestamp = measurementTimestamp ?? new Date().toISOString();

        // Check if there's already an entry for this date
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);

        // Look for existing entry using date comparison
        const dateToCheck = new Date(timestamp);
        const dateString = dateToCheck.toISOString().split('T')[0]; // YYYY-MM-DD format

        const existingEntry = localMeasurements.find((m) => {
            // Method 1: Check if timestamps start with same date
            if (m.data.MeasurementTimestamp.startsWith(dateString)) return true;

            // Method 2: Compare normalized dates (start of day)
            const existingDate = new Date(m.data.MeasurementTimestamp);
            existingDate.setHours(0, 0, 0, 0);
            dateToCheck.setHours(0, 0, 0, 0);

            return existingDate.getTime() === dateToCheck.getTime();
        });

        if (existingEntry) {
            // Entry already exists - automatically switch to update mode
            console.log(`Weight entry already exists for ${dateString}, updating instead`);
            const measurements = dispatch(
                updateWeightMeasurementAsync({
                    timestamp: existingEntry.data.MeasurementTimestamp,
                    weight,
                }),
            ).unwrap();
            return measurements;
        }

        // No existing entry found - proceed with create
        console.log('Creating new weight measurement...');
        await weightMeasurementOfflineService.create({
            userId,
            data: {
                weight,
                measurementTimestamp: timestamp,
            },
            timestamp,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Weight measurement logged offline (${measurements.length} total measurements)`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log weight measurement',
        });
    }
});

/**
 * Update weight measurement (offline-first with optimistic update)
 */
export const updateWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { timestamp: string; weight: number },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateWeightMeasurement', async ({ timestamp, weight }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Weight measurement not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating weight measurement locally...');
        await weightMeasurementOfflineService.update(localRecord.localId, {
            weight,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log('Weight measurement updated offline');
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update weight measurement',
        });
    }
});

/**
 * Delete weight measurement (offline-first with optimistic update)
 */
export const deleteWeightMeasurementAsync = createAsyncThunk<
    UserWeightMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteWeightMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await weightMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Weight measurement not found' });
        }

        // Delete from local storage (optimistic update)
        // The service handles queueing for server deletion if needed
        console.log('Deleting weight measurement from local storage...');
        await weightMeasurementOfflineService.delete(localRecord.localId);

        // Return updated measurements from SQLite
        const updatedMeasurements = await weightMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurements: UserWeightMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Weight measurement deleted offline (${measurements.length} remaining)`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete weight measurement',
        });
    }
});

// READ - Get sleep measurements (with caching)
export const getSleepMeasurementsAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getSleepMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        // 🧪 TESTING: Add delays/failures
        if (TESTING.SIMULATE_DELAYS) {
            await new Promise((resolve) => setTimeout(resolve, TESTING.DELAY_MS));
        }
        if (TESTING.SIMULATE_SLEEP_FAILURE) {
            throw new Error('Simulated sleep measurements failure');
        }
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        if (state.user.userSleepMeasurements.length > 0 && state.user.userSleepMeasurementsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userSleepMeasurements;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<UserSleepMeasurement[]>('sleep_measurements');

            if (cached) {
                console.log('Loaded sleep measurements from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading sleep measurements from API');
        const measurements = await UserService.getSleepMeasurements(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('sleep_measurements', measurements);
        }

        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch sleep measurements',
        });
    }
});

// CREATE - Log sleep measurement (invalidate cache)
export const logSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    {
        durationInMinutes?: number;
        sleepTime?: string;
        wakeTime?: string;
        measurementTimestamp?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logSleepMeasurement', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;
        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const { measurementTimestamp, ...sleepParams } = params;
        const timestamp = measurementTimestamp ?? new Date().toISOString();
        await UserService.logSleepMeasurement(userId, sleepParams, timestamp);

        // Invalidate cache after creating new measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log sleep measurement',
        });
    }
});

// UPDATE - Update sleep measurement (invalidate cache)
export const updateSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    {
        timestamp: string;
        durationInMinutes?: number;
        sleepTime?: string;
        wakeTime?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateSleepMeasurement', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const { timestamp, ...sleepParams } = params;
        await UserService.updateSleepMeasurement(userId, timestamp, sleepParams);

        // Invalidate cache after updating measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update sleep measurement',
        });
    }
});

// DELETE - Delete sleep measurement (invalidate cache)
export const deleteSleepMeasurementAsync = createAsyncThunk<
    UserSleepMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteSleepMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        await UserService.deleteSleepMeasurement(userId, timestamp);

        // Invalidate cache after deleting measurement
        await cacheService.remove('sleep_measurements');

        return await UserService.getSleepMeasurements(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete sleep measurement',
        });
    }
});

/**
 * Get body measurements (offline-first)
 * Loads immediately from SQLite, triggers background server sync if online
 */
export const getBodyMeasurementsAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getBodyMeasurements', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        console.log('Loading body measurements from SQLite...');

        // Always load from SQLite first (offline-first approach)
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        // Convert to API format
        const measurements: UserBodyMeasurement[] = localMeasurements.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background body measurements sync...');
                    const serverMeasurements = await UserService.getBodyMeasurements(userId);
                    await bodyMeasurementOfflineService.mergeServerData(userId, serverMeasurements);
                } catch (error) {
                    console.warn('Background body measurements sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing body measurements from server...');
                const serverMeasurements = await UserService.getBodyMeasurements(userId);
                await bodyMeasurementOfflineService.mergeServerData(userId, serverMeasurements);

                // Reload from SQLite to get merged data
                const refreshedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    orderBy: 'DESC',
                });

                return refreshedMeasurements.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${measurements.length} body measurements from offline storage`);
        return measurements;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to load body measurements',
        });
    }
});

/**
 * Log body measurement (offline-first with smart duplicate handling)
 * Automatically switches to update mode if entry already exists for the date
 */
export const logBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { measurements: Record<string, number>; measurementTimestamp?: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/logBodyMeasurement', async ({ measurements, measurementTimestamp }, { getState, rejectWithValue, dispatch }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        const timestamp = measurementTimestamp ?? new Date().toISOString();

        // Check if there's already an entry for this date
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);

        // Look for existing entry using date comparison
        const dateToCheck = new Date(timestamp);
        const dateString = dateToCheck.toISOString().split('T')[0]; // YYYY-MM-DD format

        const existingEntry = localMeasurements.find((m) => {
            // Method 1: Check if timestamps start with same date
            if (m.data.MeasurementTimestamp.startsWith(dateString)) return true;

            // Method 2: Compare normalized dates (start of day)
            const existingDate = new Date(m.data.MeasurementTimestamp);
            existingDate.setHours(0, 0, 0, 0);
            dateToCheck.setHours(0, 0, 0, 0);

            return existingDate.getTime() === dateToCheck.getTime();
        });

        if (existingEntry) {
            // Entry already exists - automatically switch to update mode
            console.log(`Body measurement entry already exists for ${dateString}, updating instead`);
            return await dispatch(
                updateBodyMeasurementAsync({
                    timestamp: existingEntry.data.MeasurementTimestamp,
                    measurements,
                }),
            ).unwrap();
        }

        // No existing entry found - proceed with create
        console.log('Creating new body measurement...');
        await bodyMeasurementOfflineService.create({
            userId,
            data: {
                measurements,
                measurementTimestamp: timestamp,
            },
            timestamp,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Body measurement logged offline (${measurementsResult.length} total measurements)`);
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to log body measurement',
        });
    }
});

/**
 * Update body measurement (offline-first with optimistic update)
 */
export const updateBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { timestamp: string; measurements: Record<string, number> },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateBodyMeasurement', async ({ timestamp, measurements }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Body measurement not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating body measurement locally...');
        await bodyMeasurementOfflineService.update(localRecord.localId, {
            measurements,
        });

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log('Body measurement updated offline');
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update body measurement',
        });
    }
});

/**
 * Delete body measurement (offline-first with optimistic update)
 */
export const deleteBodyMeasurementAsync = createAsyncThunk<
    UserBodyMeasurement[],
    { timestamp: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteBodyMeasurement', async ({ timestamp }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by timestamp
        const localMeasurements = await bodyMeasurementOfflineService.getRecords(userId);
        const localRecord = localMeasurements.find((m) => m.data.MeasurementTimestamp === timestamp);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Body measurement not found' });
        }

        // Delete from local storage (optimistic update)
        // The service handles queueing for server deletion if needed
        console.log('Deleting body measurement from local storage...');
        await bodyMeasurementOfflineService.delete(localRecord.localId);

        // Return updated measurements from SQLite
        const updatedMeasurements = await bodyMeasurementOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            orderBy: 'DESC',
        });

        const measurementsResult: UserBodyMeasurement[] = updatedMeasurements.map((local) => local.data);

        console.log(`Body measurement deleted offline (${measurementsResult.length} remaining)`);
        return measurementsResult;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete body measurement',
        });
    }
});

/**
 * Get user exercise set modifications (offline-first with filtering)
 */
export const getUserExerciseSetModificationsAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { params?: GetSetModificationsParams; forceRefresh?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserExerciseSetModifications', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { params, forceRefresh = false } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Always load from SQLite first (offline-first)
        console.log('Loading exercise set modifications from SQLite...');
        const localModifications = await exerciseSetModificationOfflineService.getRecords(userId, {
            includeLocalOnly: true,
            programId: params?.programId,
            includeTemporary: params?.includeTemporary,
            date: params?.date,
        });

        // Convert to API format
        const modifications: UserExerciseSetModification[] = localModifications.map((local) => local.data);

        // Background server sync (non-blocking) unless force refresh
        if (networkStateManager.isOnline() && !forceRefresh) {
            setTimeout(async () => {
                try {
                    console.log('Triggering background exercise set modifications sync...');
                    const serverModifications = await UserService.getUserExerciseSetModifications(userId, params);
                    await exerciseSetModificationOfflineService.mergeServerData(userId, serverModifications);
                } catch (error) {
                    console.warn('Background exercise set modifications sync failed:', error);
                }
            }, 100);
        }

        // Force refresh: synchronous server sync
        if (forceRefresh && networkStateManager.isOnline()) {
            try {
                console.log('Force refreshing exercise set modifications from server...');
                const serverModifications = await UserService.getUserExerciseSetModifications(userId, params);
                await exerciseSetModificationOfflineService.mergeServerData(userId, serverModifications);

                // Reload from SQLite to get merged data
                const refreshedModifications = await exerciseSetModificationOfflineService.getRecords(userId, {
                    includeLocalOnly: true,
                    programId: params?.programId,
                    includeTemporary: params?.includeTemporary,
                    date: params?.date,
                });

                return refreshedModifications.map((local) => local.data);
            } catch (error) {
                console.warn('Force refresh failed, using local data:', error);
            }
        }

        console.log(`Loaded ${modifications.length} exercise set modifications from offline storage`);
        return modifications;
    } catch (error) {
        console.error('Failed to get exercise set modifications:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch exercise set modifications',
        });
    }
});

/**
 * Create exercise set modification (offline-first with optimistic update)
 */
export const createExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    CreateSetModificationParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createExerciseSetModification', async (modificationData, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create optimistically in SQLite
        console.log('Creating exercise set modification locally...');
        const now = new Date().toISOString();

        await exerciseSetModificationOfflineService.create({
            userId,
            data: {
                exerciseId: modificationData.exerciseId,
                programId: modificationData.programId,
                originalSets: modificationData.originalSets,
                additionalSets: modificationData.additionalSets,
                isTemporary: modificationData.isTemporary || false,
                temporaryDate: modificationData.temporaryDate || null,
            },
            timestamp: now,
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing modification creation to server...');
                await UserService.createExerciseSetModification(userId, modificationData);

                // Refresh from server to get all modifications with server IDs
                const serverModifications = await UserService.getUserExerciseSetModifications(userId);
                await exerciseSetModificationOfflineService.mergeServerData(userId, serverModifications);

                console.log('Modification creation successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync modification creation to server, will retry later:', syncError);
                // Local data remains, will retry via sync queue
            }
        }

        // Return updated list from SQLite
        const updatedModifications = await exerciseSetModificationOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log('Exercise set modification created offline (will sync when online)');
        return updatedModifications.map((local) => local.data);
    } catch (error) {
        console.error('Failed to create exercise set modification:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create exercise set modification',
        });
    }
});

/**
 * Update exercise set modification (offline-first with optimistic update)
 */
export const updateExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { modificationId: string; updates: UpdateSetModificationParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateExerciseSetModification', async ({ modificationId, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by ModificationId
        const localRecord = await exerciseSetModificationOfflineService.getByModificationId(userId, modificationId);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Exercise set modification not found' });
        }

        // Update immediately in SQLite (optimistic update)
        console.log('Updating exercise set modification locally...');
        await exerciseSetModificationOfflineService.update(localRecord.localId, {
            additionalSets: updates.additionalSets,
            isTemporary: updates.isTemporary,
            temporaryDate: updates.temporaryDate,
        });

        // Try to sync to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing modification update to server...');
                await UserService.updateExerciseSetModification(userId, modificationId, updates);

                // Mark as synced
                await exerciseSetModificationOfflineService.updateSyncStatus(localRecord.localId, 'synced', {});

                console.log('Modification update successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync modification update to server, will retry later:', syncError);

                // Mark as failed
                await exerciseSetModificationOfflineService.updateSyncStatus(localRecord.localId, 'failed', {
                    errorMessage: syncError instanceof Error ? syncError.message : 'Sync failed',
                    incrementRetry: true,
                });
            }
        }

        // Return updated list from SQLite
        const updatedModifications = await exerciseSetModificationOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log('Exercise set modification updated offline');
        return updatedModifications.map((local) => local.data);
    } catch (error) {
        console.error('Failed to update exercise set modification:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update exercise set modification',
        });
    }
});

/**
 * Delete exercise set modification (offline-first with optimistic update)
 */
export const deleteExerciseSetModificationAsync = createAsyncThunk<
    UserExerciseSetModification[],
    { modificationId: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteExerciseSetModification', async ({ modificationId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Find local record by ModificationId
        const localRecord = await exerciseSetModificationOfflineService.getByModificationId(userId, modificationId);

        if (!localRecord) {
            return rejectWithValue({ errorMessage: 'Exercise set modification not found' });
        }

        // Delete from local storage (optimistic update)
        console.log('Deleting exercise set modification from local storage...');
        await exerciseSetModificationOfflineService.delete(localRecord.localId);

        // Try to sync deletion to server immediately if online
        if (networkStateManager.isOnline()) {
            try {
                console.log('Syncing modification deletion to server...');
                await UserService.deleteExerciseSetModification(userId, modificationId);

                console.log('Modification deletion successfully synced to server');
            } catch (syncError) {
                console.warn('Failed to sync modification deletion to server:', syncError);
                // Deletion already happened locally
            }
        }

        // Return updated list from SQLite
        const updatedModifications = await exerciseSetModificationOfflineService.getRecords(userId, {
            includeLocalOnly: true,
        });

        console.log(`Exercise set modification deleted offline (${updatedModifications.length} remaining)`);
        return updatedModifications.map((local) => local.data);
    } catch (error) {
        console.error('Failed to delete exercise set modification:', error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete exercise set modification',
        });
    }
});

export const completeUserProfileAsync = createAsyncThunk<
    CompleteProfileResponse,
    CompleteProfileParams,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/completeProfile', async (profileData, { rejectWithValue }) => {
    try {
        const result = await UserService.completeUserProfile(profileData);

        // Clear cache
        await Promise.all([
            cacheService.remove('user_recommendations'),
            cacheService.remove('user_nutrition_goals'),
            cacheService.remove('user_macro_targets'),
        ]);

        return result;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to complete user profile',
        });
    }
});

// Get User Nutrition Goals
export const getUserNutritionGoalsAsync = createAsyncThunk<
    UserNutritionGoal[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserNutritionGoals', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached goals if available and not forcing refresh
        if (state.user.userNutritionGoals.length > 0 && state.user.userNutritionGoalsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userNutritionGoals;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_nutrition_goals`;
            const cached = await cacheService.get<UserNutritionGoal[]>(cacheKey);

            if (cached) {
                console.log('Loaded nutrition goals from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading nutrition goals from API');
        const goals = await UserService.getUserNutritionGoals(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_nutrition_goals`;
            await cacheService.set(cacheKey, goals);
        }

        return goals;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition goals',
        });
    }
});

// Create Nutrition Goal
export const createNutritionGoalAsync = createAsyncThunk<
    UserNutritionGoal[],
    {
        goalData: {
            primaryNutritionGoal: string;
            targetWeight: number;
            weightChangeRate: number;
            startingWeight: number;
            activityLevel: string;
        };
        adjustmentReason?: string;
        adjustmentNotes?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/createNutritionGoal', async ({ goalData, adjustmentReason, adjustmentNotes }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create the new goal
        await UserService.createNutritionGoal(userId, goalData, adjustmentReason, adjustmentNotes);

        // Invalidate cache after creation
        const cacheKey = `user_nutrition_goals`;
        await cacheService.remove(cacheKey);

        // Refresh and return all goals
        return await UserService.getUserNutritionGoals(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to create nutrition goal',
        });
    }
});

// Update Nutrition Goal
export const updateNutritionGoalAsync = createAsyncThunk<
    UserNutritionGoal[],
    {
        goalData: {
            primaryNutritionGoal?: string;
            targetWeight?: number;
            weightChangeRate?: number;
            activityLevel?: string;
        };
        adjustmentReason?: string;
        adjustmentNotes?: string;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateNutritionGoal', async ({ goalData, adjustmentReason, adjustmentNotes }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Update the active goal (creates a new entry with updated values)
        await UserService.updateNutritionGoal(userId, goalData, adjustmentReason, adjustmentNotes);

        // Invalidate cache after update
        const cacheKey = `user_nutrition_goals`;
        await cacheService.remove(cacheKey);

        // Refresh and return all goals
        return await UserService.getUserNutritionGoals(userId);
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update nutrition goal',
        });
    }
});

// Get User Macro Targets
export const getUserMacroTargetsAsync = createAsyncThunk<
    UserMacroTarget[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getUserMacroTargets', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Return cached targets if available and not forcing refresh
        if (state.user.userMacroTargets.length > 0 && state.user.userMacroTargetsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.user.userMacroTargets;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `user_macro_targets`;
            const cached = await cacheService.get<UserMacroTarget[]>(cacheKey);

            if (cached) {
                console.log('Loaded macro targets from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading macro targets from API');
        const targets = await UserService.getUserMacroTargets(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `user_macro_targets`;
            await cacheService.set(cacheKey, targets);
        }

        return targets;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch macro targets',
        });
    }
});

// Nutrition Logs Thunks

// 1. Get ALL nutrition logs for a user (no date filter)
export const getAllNutritionLogsAsync = createAsyncThunk<
    UserNutritionLog[],
    { forceRefresh?: boolean; useCache?: boolean } | void,
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getAllNutritionLogs', async (args = {}, { getState, rejectWithValue }) => {
    try {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Check if we have a comprehensive set of logs and not forcing refresh
        if (!forceRefresh && Object.keys(state.user.userNutritionLogs).length > 0) {
            console.log('Using existing nutrition logs from Redux state');
            return Object.values(state.user.userNutritionLogs).filter(Boolean) as UserNutritionLog[];
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `all_nutrition_logs`;
            const cached = await cacheService.get<UserNutritionLog[]>(cacheKey);

            if (cached) {
                console.log('Loaded all nutrition logs from cache');
                return cached;
            }
        }
        console.log('Loading all nutrition logs from API');
        const nutritionLogs = await UserService.getAllNutritionLogs(userId);

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `all_nutrition_logs`;
            await cacheService.set(cacheKey, nutritionLogs);
        }

        return nutritionLogs;
    } catch (error) {
        console.log(error);
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch all nutrition logs',
        });
    }
});

// 2. Get nutrition logs with filters (date range, limit, etc.)
export const getNutritionLogsWithFiltersAsync = createAsyncThunk<
    { nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any },
    {
        filters?: { startDate?: string; endDate?: string; limit?: number };
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogsWithFilters', async ({ filters, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Create cache key based on filters
        const cacheKey = `nutrition_logs_filtered_${JSON.stringify(filters || {})}`;

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<{ nutritionLogs: UserNutritionLog[]; count: number; lastEvaluatedKey?: any }>(cacheKey);

            if (cached) {
                console.log('Loaded filtered nutrition logs from cache');
                return cached;
            }
        }

        console.log('Loading filtered nutrition logs from API');
        const result = await UserService.getNutritionLogsWithFilters(userId, filters);

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set(cacheKey, result);
        }

        return result;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch filtered nutrition logs',
        });
    }
});

// 3. Get nutrition logs for multiple specific dates (optimized for your swipe feature)
export const getNutritionLogsForDatesAsync = createAsyncThunk<
    { [date: string]: UserNutritionLog | null },
    {
        dates: string[];
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogsForDates', async ({ dates, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Filter out dates that are already loaded unless forcing refresh
        const datesToLoad = forceRefresh ? dates : dates.filter((date) => !(date in state.user.userNutritionLogs));

        if (datesToLoad.length === 0 && !forceRefresh) {
            const result: { [date: string]: UserNutritionLog | null } = {};
            dates.forEach((date) => {
                result[date] = state.user.userNutritionLogs[date] || null;
            });
            return result;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cachedResults: { [date: string]: UserNutritionLog | null } = {};
            const uncachedDates: string[] = [];

            for (const date of datesToLoad) {
                const cacheKey = `nutrition_logs_${date}`;
                const cached = await cacheService.get<UserNutritionLog>(cacheKey);

                if (cached !== null) {
                    cachedResults[date] = cached;
                } else {
                    uncachedDates.push(date);
                }
            }

            // If we have some cached data, include it in the final result
            if (Object.keys(cachedResults).length > 0) {
                console.log(`Loaded ${Object.keys(cachedResults).length} nutrition logs from cache`);
            }

            // Only fetch uncached dates
            if (uncachedDates.length > 0) {
                console.log(`Loading ${uncachedDates.length} nutrition logs from API`);

                // Use the new bulk API for efficiency
                const apiResults = await UserService.getBulkNutritionLogs(userId, uncachedDates);

                // Cache the API results if useCache is enabled
                if (useCache) {
                    for (const [date, nutritionLog] of Object.entries(apiResults)) {
                        const cacheKey = `nutrition_logs_${date}`;
                        await cacheService.set(cacheKey, nutritionLog);
                    }
                }

                // Merge cached and API results
                const mergedResults = { ...cachedResults, ...apiResults };

                // If we had some dates already loaded in Redux, merge them too
                if (!forceRefresh) {
                    const fullResults: { [date: string]: UserNutritionLog | null } = {};
                    dates.forEach((date) => {
                        fullResults[date] = mergedResults[date] !== undefined ? mergedResults[date] : state.user.userNutritionLogs[date] || null;
                    });
                    return fullResults;
                }

                return mergedResults;
            }

            // Only cached results, merge with any existing Redux data
            if (!forceRefresh) {
                const fullResults: { [date: string]: UserNutritionLog | null } = {};
                dates.forEach((date) => {
                    fullResults[date] = cachedResults[date] !== undefined ? cachedResults[date] : state.user.userNutritionLogs[date] || null;
                });
                return fullResults;
            }

            return cachedResults;
        }

        console.log(`Loading ${datesToLoad.length} nutrition logs from API`);

        // Use the new bulk API instead of the old individual method
        const results = await UserService.getBulkNutritionLogs(userId, datesToLoad);

        // Cache the results if useCache is enabled
        if (useCache) {
            for (const [date, nutritionLog] of Object.entries(results)) {
                const cacheKey = `nutrition_logs_${date}`;
                await cacheService.set(cacheKey, nutritionLog);
            }
        }

        // If we had some dates already loaded, merge them
        if (!forceRefresh) {
            const fullResults: { [date: string]: UserNutritionLog | null } = {};
            dates.forEach((date) => {
                fullResults[date] = results[date] !== undefined ? results[date] : state.user.userNutritionLogs[date] || null;
            });
            return fullResults;
        }

        return results;
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition logs for dates',
        });
    }
});

// 4. Updated single date thunk (keeping backward compatibility)
export const getNutritionLogForDateAsync = createAsyncThunk<
    { date: string; nutritionLog: UserNutritionLog | null },
    { date: string; forceRefresh?: boolean; useCache?: boolean },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/getNutritionLogForDate', async ({ date, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Check Redux state first (unless forcing refresh)
        if (!forceRefresh && state.user.userNutritionLogs[date] !== undefined) {
            console.log(`Loaded nutrition log for ${date} from Redux state`);
            return { date, nutritionLog: state.user.userNutritionLogs[date] };
        }

        // Check cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `nutrition_logs_${date}`;
            const cached = await cacheService.get<UserNutritionLog>(cacheKey);

            if (cached !== null) {
                console.log(`Loaded nutrition log for ${date} from cache`);
                return { date, nutritionLog: cached };
            }
        }

        console.log(`Loading nutrition log for ${date} from API`);
        const nutritionLog = await UserService.getNutritionLogForDate(userId, date);

        // Cache the result if useCache is enabled (cache null values too!)
        if (useCache) {
            const cacheKey = `nutrition_logs_${date}`;
            await cacheService.set(cacheKey, nutritionLog);
        }

        return { date, nutritionLog };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch nutrition log for date',
        });
    }
});

// 5. Helper thunk for your food log screen (optimized for swipe navigation)
export const loadNutritionLogsForSwipeNavigationAsync = createAsyncThunk<
    { [date: string]: UserNutritionLog | null },
    {
        centerDate: Date;
        forceRefresh?: boolean;
        useCache?: boolean;
    },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/loadNutritionLogsForSwipeNavigation', async ({ centerDate, forceRefresh = false, useCache = true }, { dispatch }) => {
    // Format dates for the sliding window (previous, current, next)
    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const dates = [
        formatDateForAPI(addDays(centerDate, -1)), // previous
        formatDateForAPI(centerDate), // current
        formatDateForAPI(addDays(centerDate, 1)), // next
    ];

    // Reuse the existing getNutritionLogsForDatesAsync thunk
    const result = await dispatch(
        getNutritionLogsForDatesAsync({
            dates,
            forceRefresh,
            useCache,
        }),
    ).unwrap();

    return result;
});

export const addFoodEntryAsync = createAsyncThunk<
    AddFoodEntryResponse & { date: string },
    { date: string; entryData: AddFoodEntryParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/addFoodEntry', async ({ date, entryData }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Add the food entry
        const result = await UserService.addFoodEntry(userId, date, entryData);

        // Invalidate cache after adding entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { ...result, date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to add food entry',
        });
    }
});

export const updateFoodEntryAsync = createAsyncThunk<
    UpdateFoodEntryResponse & { date: string },
    { date: string; mealType: MealType; entryKey: string; updates: UpdateFoodEntryParams },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/updateFoodEntry', async ({ date, mealType, entryKey, updates }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Update the food entry
        const result = await UserService.updateFoodEntry(userId, date, mealType, entryKey, updates);

        // Invalidate cache after updating entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { ...result, date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to update food entry',
        });
    }
});

export const deleteFoodEntryAsync = createAsyncThunk<
    { date: string; nutritionLog: UserNutritionLog },
    { date: string; mealType: MealType; entryKey: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteFoodEntry', async ({ date, mealType, entryKey }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the food entry
        const nutritionLog = await UserService.deleteFoodEntry(userId, date, mealType, entryKey);

        // Invalidate cache after deleting entry
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { date, nutritionLog };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete food entry',
        });
    }
});

export const deleteSpecificDayLogAsync = createAsyncThunk<
    { date: string },
    { date: string },
    {
        state: RootState;
        rejectValue: { errorMessage: string };
    }
>('user/deleteSpecificDayLog', async ({ date }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const userId = state.user.user?.UserId;

        if (!userId) {
            return rejectWithValue({ errorMessage: 'User ID not available' });
        }

        // Delete the entire day's log
        await UserService.deleteSpecificDayLog(userId, date);

        // Invalidate cache after deleting day log
        const cacheKey = `nutrition_logs_${date}`;
        await cacheService.remove(cacheKey);

        return { date };
    } catch (error) {
        return rejectWithValue({
            errorMessage: error instanceof Error ? error.message : 'Failed to delete day log',
        });
    }
});
