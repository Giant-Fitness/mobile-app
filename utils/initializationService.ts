// utils/initializationService.ts

import { AppDispatch } from '@/store/store';
import { cacheService, CacheTTL } from './cache';
import {
    setPhase,
    setCriticalDataState,
    setSecondaryDataState,
    setBackgroundSyncState,
    addLoadedItem,
    addFailedItem,
    setCacheStatus,
    setCriticalError,
} from '@/store/initialization/initializationSlice';
import { REQUEST_STATE } from '@/constants/requestStates';

import {
    getUserAsync,
    getUserFitnessProfileAsync,
    getUserAppSettingsAsync,
    getUserRecommendationsAsync,
    getUserExerciseSubstitutionsAsync,
    getUserExerciseSetModificationsAsync,
    getBodyMeasurementsAsync,
    getSleepMeasurementsAsync,
    getWeightMeasurementsAsync,
    getUserProgramProgressAsync,
} from '@/store/user/thunks';
import { getAllProgramsAsync, getAllProgramDaysAsync } from '@/store/programs/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { fetchAllExercisesAsync } from '@/store/exercises/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';

// Standardized cache keys
const CACHE_KEYS = {
    USER_DATA: 'user_data',
    USER_FITNESS_PROFILE: 'user_fitness_profile',
    USER_PROGRAM_PROGRESS: 'user_program_progress',
    USER_APP_SETTINGS: 'user_app_settings',
    USER_RECOMMENDATIONS: 'user_recommendations',
    EXERCISE_SUBSTITUTIONS: 'exercise_substitutions',
    EXERCISE_SET_MODIFICATIONS: 'exercise_set_modifications',
    WEIGHT_MEASUREMENTS: 'weight_measurements',
    SLEEP_MEASUREMENTS: 'sleep_measurements',
    BODY_MEASUREMENTS: 'body_measurements',
    ALL_PROGRAMS: 'all_programs',
    ALL_WORKOUTS: 'all_workouts',
    ALL_EXERCISES: 'all_exercises',
    PROGRAM_DAYS: (programId: string) => `program_days_${programId}`,
    SPOTLIGHT_WORKOUTS: 'spotlight_workouts',
    TRACKED_LIFTS_HISTORY: 'tracked_lifts_history',
    WORKOUT_QUOTE: 'workout_quote',
    REST_DAY_QUOTE: 'rest_day_quote',
} as const;

export interface DataCategory {
    key: string;
    thunk: any;
    cacheKey: string;
    ttl: CacheTTL;
    required: boolean;
    refreshPriority: 'high' | 'medium' | 'low';
    args?: any;
    conditional?: boolean;
    dependsOn?: string[];
}

export class InitializationService {
    private dispatch: AppDispatch;
    private backgroundRefreshInProgress = false;
    private loadedData: Set<string> = new Set();
    private userProgramId: string | null = null;

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    // Define data categories with consistent cache keys
    private criticalData: DataCategory[] = [
        {
            key: 'user',
            thunk: getUserAsync,
            cacheKey: CACHE_KEYS.USER_DATA,
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'userFitnessProfile',
            thunk: getUserFitnessProfileAsync,
            cacheKey: CACHE_KEYS.USER_FITNESS_PROFILE,
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'userProgramProgress',
            thunk: getUserProgramProgressAsync,
            cacheKey: CACHE_KEYS.USER_PROGRAM_PROGRESS,
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            args: { useCache: true },
        },
    ];

    private secondaryData: DataCategory[] = [
        {
            key: 'userAppSettings',
            thunk: getUserAppSettingsAsync,
            cacheKey: CACHE_KEYS.USER_APP_SETTINGS,
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'programs',
            thunk: getAllProgramsAsync,
            cacheKey: CACHE_KEYS.ALL_PROGRAMS,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'workouts',
            thunk: getAllWorkoutsAsync,
            cacheKey: CACHE_KEYS.ALL_WORKOUTS,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'exercises',
            thunk: fetchAllExercisesAsync,
            cacheKey: CACHE_KEYS.ALL_EXERCISES,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'programDays',
            thunk: getAllProgramDaysAsync,
            cacheKey: 'program_days', // Will be dynamic based on program ID
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            conditional: true,
            dependsOn: ['userProgramProgress'],
            args: { useCache: true },
        },
        {
            key: 'userRecommendations',
            thunk: getUserRecommendationsAsync,
            cacheKey: CACHE_KEYS.USER_RECOMMENDATIONS,
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'exerciseSubstitutions',
            thunk: getUserExerciseSubstitutionsAsync,
            cacheKey: CACHE_KEYS.EXERCISE_SUBSTITUTIONS,
            ttl: CacheTTL.VERY_LONG,
            required: false,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'exerciseSetModifications',
            thunk: getUserExerciseSetModificationsAsync,
            cacheKey: CACHE_KEYS.EXERCISE_SET_MODIFICATIONS,
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userWeightMeasurements',
            thunk: getWeightMeasurementsAsync,
            cacheKey: CACHE_KEYS.WEIGHT_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userSleepMeasurements',
            thunk: getSleepMeasurementsAsync,
            cacheKey: CACHE_KEYS.SLEEP_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userBodyMeasurements',
            thunk: getBodyMeasurementsAsync,
            cacheKey: CACHE_KEYS.BODY_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
    ];

    private backgroundData: DataCategory[] = [
        {
            key: 'spotlightWorkouts',
            thunk: getSpotlightWorkoutsAsync,
            cacheKey: CACHE_KEYS.SPOTLIGHT_WORKOUTS,
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'trackedLiftsHistory',
            thunk: initializeTrackedLiftsHistoryAsync,
            cacheKey: CACHE_KEYS.TRACKED_LIFTS_HISTORY,
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'workoutQuote',
            thunk: getWorkoutQuoteAsync,
            cacheKey: CACHE_KEYS.WORKOUT_QUOTE,
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: false },
        },
        {
            key: 'restDayQuote',
            thunk: getRestDayQuoteAsync,
            cacheKey: CACHE_KEYS.REST_DAY_QUOTE,
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: false },
        },
    ];

    async checkCacheStatus(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];

        for (const item of allData) {
            // Skip conditional items during initial cache check
            if (item.conditional) continue;

            const cacheKey = await this.getDynamicCacheKey(item);
            const cached = await cacheService.get(cacheKey);
            const needsBackgroundRefresh = await cacheService.needsBackgroundRefresh(cacheKey);

            let status: 'fresh' | 'stale' | 'missing';
            if (!cached) {
                status = 'missing';
            } else if (needsBackgroundRefresh) {
                status = 'stale';
            } else {
                status = 'fresh';
            }

            this.dispatch(setCacheStatus({ key: item.key, status }));
        }
    }

    async loadCriticalData(): Promise<boolean> {
        this.dispatch(setPhase('critical'));
        this.dispatch(setCriticalDataState(REQUEST_STATE.PENDING));

        try {
            const results = await this.loadDataCategoryWithCacheFirst(this.criticalData);

            if (results.hasRequiredFailures) {
                this.dispatch(setCriticalDataState(REQUEST_STATE.REJECTED));
                this.dispatch(setCriticalError('Failed to load critical app data'));
                return false;
            }

            this.dispatch(setCriticalDataState(REQUEST_STATE.FULFILLED));
            return true;
        } catch (error) {
            this.dispatch(setCriticalDataState(REQUEST_STATE.REJECTED));
            this.dispatch(setCriticalError(error instanceof Error ? error.message : 'Unknown error'));
            return false;
        }
    }

    async loadSecondaryData(): Promise<boolean> {
        this.dispatch(setPhase('secondary'));
        this.dispatch(setSecondaryDataState(REQUEST_STATE.PENDING));

        try {
            const results = await this.loadDataCategoryWithCacheFirst(this.secondaryData);

            if (results.hasRequiredFailures) {
                this.dispatch(setSecondaryDataState(REQUEST_STATE.REJECTED));
                return false;
            }

            this.dispatch(setSecondaryDataState(REQUEST_STATE.FULFILLED));
            return true;
        } catch (error) {
            this.dispatch(setSecondaryDataState(REQUEST_STATE.REJECTED));
            console.warn('Secondary data load failed:', error);
            return false;
        }
    }

    async startBackgroundSync(): Promise<void> {
        if (this.backgroundRefreshInProgress) {
            console.log('Background refresh already in progress, skipping');
            return;
        }

        this.backgroundRefreshInProgress = true;
        this.dispatch(setPhase('background'));
        this.dispatch(setBackgroundSyncState(REQUEST_STATE.PENDING));

        try {
            console.log('Starting background sync...');

            // Load background data that wasn't loaded yet
            await this.loadDataCategoryWithCacheFirst(this.backgroundData);

            // Refresh data based on priority and TTL
            await this.performSmartBackgroundRefresh();

            this.dispatch(setBackgroundSyncState(REQUEST_STATE.FULFILLED));
            console.log('Background sync completed');
        } catch (error) {
            this.dispatch(setBackgroundSyncState(REQUEST_STATE.REJECTED));
            console.warn('Background sync failed:', error);
        } finally {
            this.backgroundRefreshInProgress = false;
        }
    }

    /**
     * Cache-first loading: Always try cache first, fallback to API only if no cache exists
     */
    private async loadDataCategoryWithCacheFirst(dataItems: DataCategory[]): Promise<{ hasRequiredFailures: boolean }> {
        let hasRequiredFailures = false;

        for (const item of dataItems) {
            // Check if this is a conditional item and if dependencies are met
            if (item.conditional && !(await this.canLoadConditionalItem(item))) {
                console.log(`Skipping conditional item ${item.key} - dependencies not met`);
                continue;
            }

            try {
                // Get dynamic cache key if needed
                const cacheKey = await this.getDynamicCacheKey(item);

                // First, try to get from cache
                const cachedData = await cacheService.get(cacheKey);

                if (cachedData) {
                    console.log(`Using cached data for ${item.key}`);
                    this.dispatch(addLoadedItem(item.key));
                    this.loadedData.add(item.key);
                    continue;
                }

                // Cache miss - fetch from API
                console.log(`Cache miss for ${item.key}, fetching from API`);
                const args = await this.getArgsForItem(item);

                const result = await this.dispatch(item.thunk(args));

                if (item.thunk.fulfilled.match(result)) {
                    this.dispatch(addLoadedItem(item.key));
                    this.loadedData.add(item.key);
                    console.log(`Loaded ${item.key} from API and cached`);
                } else {
                    throw new Error(`Failed to load ${item.key} from API`);
                }
            } catch (error) {
                console.warn(`Failed to load ${item.key}:`, error);
                this.dispatch(addFailedItem(item.key));

                if (item.required) {
                    hasRequiredFailures = true;
                }
            }
        }

        return { hasRequiredFailures };
    }

    /**
     * Check if a conditional item can be loaded based on its dependencies
     */
    private async canLoadConditionalItem(item: DataCategory): Promise<boolean> {
        if (!item.conditional || !item.dependsOn) return true;

        // Check if all dependencies are loaded
        for (const dependency of item.dependsOn) {
            if (!this.loadedData.has(dependency)) {
                return false;
            }
        }

        // Special handling for program days
        if (item.key === 'programDays') {
            const programId = await this.getProgramIdFromCache();
            return programId !== null;
        }

        return true;
    }

    /**
     * Get dynamic cache key for items that depend on other data
     */
    private async getDynamicCacheKey(item: DataCategory): Promise<string> {
        if (item.key === 'programDays') {
            const programId = await this.getProgramIdFromCache();
            return programId ? CACHE_KEYS.PROGRAM_DAYS(programId) : item.cacheKey;
        }
        return item.cacheKey;
    }

    /**
     * Get arguments for API call - Fixed to not override cache-first strategy
     */
    private async getArgsForItem(item: DataCategory): Promise<any> {
        const baseArgs = {
            ...item.args,
            // Don't override the cache-first strategy here
            // Let the individual thunks handle cache logic
        };

        if (item.key === 'programDays') {
            const programId = await this.getProgramIdFromCache();
            if (programId) {
                return { ...baseArgs, programId };
            }
        }

        return baseArgs;
    }

    /**
     * Get program ID from cached user program progress
     */
    private async getProgramIdFromCache(): Promise<string | null> {
        try {
            const cachedProgress = (await cacheService.get(CACHE_KEYS.USER_PROGRAM_PROGRESS)) as any;
            if (cachedProgress && cachedProgress.ProgramId) {
                this.userProgramId = cachedProgress.ProgramId;
                return cachedProgress.ProgramId;
            }
        } catch (error) {
            console.warn('Failed to get program ID from cache:', error);
        }
        return this.userProgramId;
    }

    /**
     * Smart background refresh based on priority and TTL
     */
    private async performSmartBackgroundRefresh(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];

        // Group items by refresh priority
        const highPriorityItems = allData.filter((item) => item.refreshPriority === 'high');
        const mediumPriorityItems = allData.filter((item) => item.refreshPriority === 'medium');
        const lowPriorityItems = allData.filter((item) => item.refreshPriority === 'low');

        // Refresh high priority items that need background refresh
        console.log('Refreshing high priority items...');
        await this.refreshItemsIfNeeded(highPriorityItems, true);

        // Refresh medium priority items if they need it
        console.log('Refreshing medium priority items...');
        await this.refreshItemsIfNeeded(mediumPriorityItems, false);

        // Refresh low priority items only if really stale
        console.log('Refreshing low priority items...');
        await this.refreshItemsIfNeeded(lowPriorityItems, false);
    }

    private async refreshItemsIfNeeded(items: DataCategory[], forceRefresh: boolean): Promise<void> {
        const refreshPromises = items.map(async (item) => {
            try {
                // Check conditional items
                if (await this.canLoadConditionalItem(item)) {
                    const cacheKey = await this.getDynamicCacheKey(item);
                    const needsRefresh = forceRefresh || (await cacheService.needsBackgroundRefresh(cacheKey));

                    if (!needsRefresh) {
                        console.log(`Skipping refresh for ${item.key} - still fresh`);
                        return;
                    }

                    console.log(`Background refreshing ${item.key}...`);

                    const args = {
                        ...item.args,
                        forceRefresh: true, // Force refresh during background sync
                        useCache: true, // Still want to cache the result
                    };

                    // Add dynamic args
                    if (item.key === 'programDays') {
                        const programId = await this.getProgramIdFromCache();
                        if (programId) {
                            args.programId = programId;
                        }
                    }

                    const result = await this.dispatch(item.thunk(args));

                    if (item.thunk.fulfilled.match(result)) {
                        console.log(`Successfully refreshed ${item.key} in background`);
                    } else {
                        console.warn(`Failed to refresh ${item.key} in background`);
                    }
                } else {
                    console.log(`Skipping conditional refresh for ${item.key} - dependencies not met`);
                }
            } catch (error) {
                console.warn(`Error refreshing ${item.key} in background:`, error);
            }
        });

        await Promise.allSettled(refreshPromises);
    }
}
