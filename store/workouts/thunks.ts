// store/workouts/thunks.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { RootState } from '@/store/store';
import WorkoutService from '@/store/workouts/service';
import { Workout, WorkoutRecommendations } from '@/types';
import { cacheService, CacheTTL } from '@/utils/cache';

import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllWorkoutsAsync = createAsyncThunk<Workout[], { forceRefresh?: boolean; useCache?: boolean } | void>(
    'workouts/getAllWorkouts',
    async (args = {}, { getState }) => {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        // If workouts are already loaded and not forcing refresh, return them
        if (state.workouts.allWorkoutsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return Object.values(state.workouts.workouts);
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<Workout[]>('all_workouts');
            const isExpired = await cacheService.isExpired('all_workouts');

            if (cached && !isExpired) {
                console.log('Loaded workouts from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading workouts from API');
        const workouts = await WorkoutService.getAllWorkouts();

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('all_workouts', workouts, CacheTTL.VERY_LONG);
        }

        return workouts;
    },
);

export const getWorkoutAsync = createAsyncThunk<Workout | undefined, { workoutId: string; forceRefresh?: boolean; useCache?: boolean }, { state: RootState }>(
    'workouts/getWorkout',
    async ({ workoutId, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingWorkout = state.workouts.workouts[workoutId];

        // If already exists and not forcing refresh, return it
        if (existingWorkout && !forceRefresh) {
            return existingWorkout;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `workout_${workoutId}`;
            const cached = await cacheService.get<Workout>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log(`Loaded workout ${workoutId} from cache`);
                return cached;
            }
        }

        // Load from API
        console.log(`Loading workout ${workoutId} from API`);
        const workout = await WorkoutService.getWorkout(workoutId);
        if (!workout) {
            return rejectWithValue('Workout not found.');
        }

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `workout_${workoutId}`;
            await cacheService.set(cacheKey, workout, CacheTTL.VERY_LONG);
        }

        return workout;
    },
);

export const getMultipleWorkoutsAsync = createAsyncThunk<Workout[], { workoutIds: string[]; forceRefresh?: boolean; useCache?: boolean }, { state: RootState }>(
    'workouts/getMultipleWorkouts',
    async ({ workoutIds, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
        const state = getState();

        // If not forcing refresh, check for existing workouts in Redux first
        if (!forceRefresh) {
            const existingWorkouts = workoutIds.map((workoutId) => state.workouts.workouts[workoutId]).filter((workout) => workout !== undefined);
            if (existingWorkouts.length === workoutIds.length) {
                // If all workouts exist in the state, return them
                return existingWorkouts;
            }
        }

        // Check cache for missing workouts
        const missingWorkoutIds = forceRefresh ? workoutIds : workoutIds.filter((workoutId) => !state.workouts.workouts[workoutId]);
        const cachedWorkouts: Workout[] = [];
        const uncachedWorkoutIds: string[] = [];

        if (useCache && !forceRefresh) {
            for (const workoutId of missingWorkoutIds) {
                const cacheKey = `workout_${workoutId}`;
                const cached = await cacheService.get<Workout>(cacheKey);
                const isExpired = await cacheService.isExpired(cacheKey);

                if (cached && !isExpired) {
                    cachedWorkouts.push(cached);
                    console.log(`Loaded workout ${workoutId} from cache`);
                } else {
                    uncachedWorkoutIds.push(workoutId);
                }
            }
        } else {
            uncachedWorkoutIds.push(...missingWorkoutIds);
        }

        // Fetch uncached workouts from API
        let fetchedWorkouts: Workout[] = [];
        if (uncachedWorkoutIds.length > 0) {
            try {
                console.log(`Loading workouts from API: ${uncachedWorkoutIds.join(', ')}`);
                fetchedWorkouts = await WorkoutService.getWorkouts(uncachedWorkoutIds);

                // Cache the fetched workouts if useCache is enabled
                if (useCache) {
                    for (const workout of fetchedWorkouts) {
                        const cacheKey = `workout_${workout.WorkoutId}`;
                        await cacheService.set(cacheKey, workout, CacheTTL.VERY_LONG);
                    }
                }
            } catch (error) {
                console.log(error);
                return rejectWithValue('Error fetching workouts.');
            }
        }

        // Combine existing (from Redux), cached, and newly fetched workouts
        const existingWorkouts = forceRefresh
            ? []
            : (workoutIds.map((workoutId) => state.workouts.workouts[workoutId]).filter((workout) => workout !== undefined) as Workout[]);
        const allWorkouts = [...existingWorkouts, ...cachedWorkouts, ...fetchedWorkouts];

        if (allWorkouts.length === 0) {
            return rejectWithValue('Workouts not found.');
        }

        return allWorkouts;
    },
);

export const getSpotlightWorkoutsAsync = createAsyncThunk<WorkoutRecommendations, { forceRefresh?: boolean; useCache?: boolean } | void>(
    'workouts/getSpotlightWorkouts',
    async (args = {}, { getState }) => {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};
        const state = getState() as RootState;

        // If workout recommendations are already loaded and not forcing refresh, return them
        if (state.workouts.spotlightWorkoutsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return state.workouts.spotlightWorkouts;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<WorkoutRecommendations>('spotlight_workouts');
            const isExpired = await cacheService.isExpired('spotlight_workouts');

            if (cached && !isExpired) {
                console.log('Loaded spotlight workouts from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading spotlight workouts from API');
        const spotlightWorkouts = await WorkoutService.getSpotlightWorkouts();

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('spotlight_workouts', spotlightWorkouts, CacheTTL.SHORT);
        }

        return spotlightWorkouts;
    },
);
