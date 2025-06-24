// utils/initializationService.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';
import { fetchAllExercisesAsync } from '@/store/exercises/thunks';
import {
    addFailedItem,
    addLoadedItem,
    setBackgroundSyncState,
    setCacheStatus,
    setCriticalDataState,
    setCriticalError,
    setPhase,
    setSecondaryDataState,
} from '@/store/initialization/initializationSlice';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getRestDayQuoteAsync, getWorkoutQuoteAsync } from '@/store/quotes/thunks';
import { AppDispatch } from '@/store/store';
import {
    getBodyMeasurementsAsync,
    getSleepMeasurementsAsync,
    getUserAppSettingsAsync,
    getUserAsync,
    getUserExerciseSetModificationsAsync,
    getUserExerciseSubstitutionsAsync,
    getUserFitnessProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
} from '@/store/user/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';

import { cacheService, CacheTTL } from './cache';

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

interface LoadResult {
    key: string;
    success: boolean;
    error?: Error;
    required: boolean;
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

        // Check cache status for all items in parallel
        const cacheChecks = allData.map(async (item) => {
            // Skip conditional items during initial cache check
            if (item.conditional) return;

            try {
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
            } catch (error) {
                console.warn(`Error checking cache status for ${item.key}:`, error);
            }
        });

        await Promise.allSettled(cacheChecks);
    }

    async loadCriticalData(): Promise<boolean> {
        this.dispatch(setPhase('critical'));
        this.dispatch(setCriticalDataState(REQUEST_STATE.PENDING));

        try {
            const results = await this.loadDataCategoryWithParallelization(this.criticalData);

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
            const results = await this.loadDataCategoryWithParallelization(this.secondaryData);

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

            // Load background data that wasn't loaded yet (in parallel)
            await this.loadDataCategoryWithParallelization(this.backgroundData);

            // Refresh data based on priority and TTL (in parallel)
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
     * NEW: Load data with parallelization, respecting dependencies
     */
    private async loadDataCategoryWithParallelization(dataItems: DataCategory[]): Promise<{ hasRequiredFailures: boolean }> {
        const loadResults: LoadResult[] = [];
        const processedItems = new Set<string>();

        // Separate independent items from dependent items
        const independentItems = dataItems.filter((item) => !item.conditional && !item.dependsOn);
        const dependentItems = dataItems.filter((item) => item.conditional || item.dependsOn);

        console.log(`Loading ${independentItems.length} independent items in parallel, ${dependentItems.length} dependent items sequentially`);

        // Load all independent items in parallel
        if (independentItems.length > 0) {
            const independentPromises = independentItems.map((item) => this.loadSingleItem(item));
            const independentResults = await Promise.allSettled(independentPromises);

            independentResults.forEach((result, index) => {
                const item = independentItems[index];
                if (result.status === 'fulfilled') {
                    loadResults.push(result.value);
                    if (result.value.success) {
                        processedItems.add(item.key);
                    }
                } else {
                    loadResults.push({
                        key: item.key,
                        success: false,
                        error: result.reason,
                        required: item.required,
                    });
                }
            });
        }

        // Process dependent items in waves (items that depend on newly loaded items)
        let remainingDependentItems = [...dependentItems];
        let maxIterations = 10; // Prevent infinite loops
        let iteration = 0;

        while (remainingDependentItems.length > 0 && iteration < maxIterations) {
            iteration++;
            const readyItems: DataCategory[] = [];
            const stillWaitingItems: DataCategory[] = [];

            // Check which dependent items are now ready to load
            for (const item of remainingDependentItems) {
                if (await this.canLoadConditionalItem(item)) {
                    readyItems.push(item);
                } else {
                    stillWaitingItems.push(item);
                }
            }

            if (readyItems.length === 0) {
                // No more items can be loaded - log what's still waiting
                console.warn(
                    'Remaining dependent items cannot be loaded:',
                    stillWaitingItems.map((item) => `${item.key} (depends on: ${item.dependsOn?.join(', ')})`),
                );
                break;
            }

            // Load ready dependent items in parallel
            console.log(`Loading ${readyItems.length} dependent items in parallel (iteration ${iteration})`);
            const dependentPromises = readyItems.map((item) => this.loadSingleItem(item));
            const dependentResults = await Promise.allSettled(dependentPromises);

            dependentResults.forEach((result, index) => {
                const item = readyItems[index];
                if (result.status === 'fulfilled') {
                    loadResults.push(result.value);
                    if (result.value.success) {
                        processedItems.add(item.key);
                    }
                } else {
                    loadResults.push({
                        key: item.key,
                        success: false,
                        error: result.reason,
                        required: item.required,
                    });
                }
            });

            remainingDependentItems = stillWaitingItems;
        }

        // Check for required failures
        const hasRequiredFailures = loadResults.some((result) => !result.success && result.required);

        // Log summary
        const successCount = loadResults.filter((r) => r.success).length;
        const failureCount = loadResults.filter((r) => !r.success).length;
        console.log(`Load summary: ${successCount} successful, ${failureCount} failed`);

        if (failureCount > 0) {
            const failedItems = loadResults.filter((r) => !r.success);
            console.warn(
                'Failed items:',
                failedItems.map((r) => r.key),
            );
        }

        return { hasRequiredFailures };
    }

    /**
     * Load a single data item with proper error handling
     */
    private async loadSingleItem(item: DataCategory): Promise<LoadResult> {
        try {
            // Get dynamic cache key if needed
            const cacheKey = await this.getDynamicCacheKey(item);

            // First, try to get from cache
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                console.log(`Using cached data for ${item.key}`);
                this.dispatch(addLoadedItem(item.key));
                this.loadedData.add(item.key);
                return { key: item.key, success: true, required: item.required };
            }

            // Cache miss - fetch from API
            console.log(`Cache miss for ${item.key}, fetching from API`);
            const args = await this.getArgsForItem(item);

            const result = await this.dispatch(item.thunk(args));

            if (item.thunk.fulfilled.match(result)) {
                this.dispatch(addLoadedItem(item.key));
                this.loadedData.add(item.key);
                console.log(`Loaded ${item.key} from API and cached`);
                return { key: item.key, success: true, required: item.required };
            } else {
                throw new Error(`Failed to load ${item.key} from API`);
            }
        } catch (error) {
            console.warn(`Failed to load ${item.key}:`, error);
            this.dispatch(addFailedItem(item.key));
            return {
                key: item.key,
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                required: item.required,
            };
        }
    }

    /**
     * Check if a conditional item can be loaded based on its dependencies
     */
    private async canLoadConditionalItem(item: DataCategory): Promise<boolean> {
        if (!item.conditional && !item.dependsOn) return true;

        // Check if all dependencies are loaded
        if (item.dependsOn) {
            for (const dependency of item.dependsOn) {
                if (!this.loadedData.has(dependency)) {
                    return false;
                }
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
     * Get arguments for API call
     */
    private async getArgsForItem(item: DataCategory): Promise<any> {
        const baseArgs = {
            ...item.args,
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
     * Smart background refresh with parallelization
     */
    private async performSmartBackgroundRefresh(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];

        // Group items by refresh priority
        const highPriorityItems = allData.filter((item) => item.refreshPriority === 'high');
        const mediumPriorityItems = allData.filter((item) => item.refreshPriority === 'medium');
        const lowPriorityItems = allData.filter((item) => item.refreshPriority === 'low');

        // Refresh all priority groups in parallel (within each group, items refresh in parallel too)
        console.log('Starting parallel background refresh...');
        await Promise.allSettled([
            this.refreshItemsIfNeeded(highPriorityItems, true),
            this.refreshItemsIfNeeded(mediumPriorityItems, false),
            this.refreshItemsIfNeeded(lowPriorityItems, false),
        ]);
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
                        forceRefresh: true,
                        useCache: true,
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
