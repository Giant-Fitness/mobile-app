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
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { fetchAllExercisesAsync } from '@/store/exercises/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';

export interface DataCategory {
    key: string;
    thunk: any;
    cacheKey: string;
    ttl: CacheTTL;
    required: boolean;
    refreshPriority: 'high' | 'medium' | 'low'; // Background refresh priority
    args?: any;
}

export class InitializationService {
    private dispatch: AppDispatch;
    private backgroundRefreshInProgress = false;

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    // Define data categories with refresh priorities
    private criticalData: DataCategory[] = [
        {
            key: 'user',
            thunk: getUserAsync,
            cacheKey: 'user_data',
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'userFitnessProfile',
            thunk: getUserFitnessProfileAsync,
            cacheKey: 'user_fitness_profile',
            ttl: CacheTTL.LONG,
            required: true,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'userProgramProgress',
            thunk: getUserProgramProgressAsync,
            cacheKey: 'user_program_progress',
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
            cacheKey: 'user_app_settings',
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'programs',
            thunk: getAllProgramsAsync,
            cacheKey: 'all_programs',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low', // Static catalog data
            args: { useCache: true },
        },
        {
            key: 'workouts',
            thunk: getAllWorkoutsAsync,
            cacheKey: 'all_workouts',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'exercises',
            thunk: fetchAllExercisesAsync,
            cacheKey: 'all_exercises',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'userRecommendations',
            thunk: getUserRecommendationsAsync,
            cacheKey: 'user_recommendations',
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high', // User-specific, changes frequently
            args: { useCache: true },
        },
        {
            key: 'exerciseSubstitutions',
            thunk: getUserExerciseSubstitutionsAsync,
            cacheKey: 'exercise_substitutions',
            ttl: CacheTTL.VERY_LONG,
            required: false,
            refreshPriority: 'low',
            args: { useCache: true },
        },
        {
            key: 'exerciseSetModifications',
            thunk: getUserExerciseSetModificationsAsync,
            cacheKey: 'exercise_set_modifications',
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userWeightMeasurements',
            thunk: getWeightMeasurementsAsync,
            cacheKey: 'weight_measurements',
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userSleepMeasurements',
            thunk: getSleepMeasurementsAsync,
            cacheKey: 'sleep_measurements',
            ttl: CacheTTL.LONG,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userBodyMeasurements',
            thunk: getBodyMeasurementsAsync,
            cacheKey: 'body_measurements',
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
            cacheKey: 'spotlight_workouts',
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'trackedLiftsHistory',
            thunk: initializeTrackedLiftsHistoryAsync,
            cacheKey: 'tracked_lifts_history',
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: true },
        },
        {
            key: 'workoutQuote',
            thunk: getWorkoutQuoteAsync,
            cacheKey: 'workout_quote',
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high', // Always get fresh quotes
            args: { useCache: false }, // Quotes should always be fresh
        },
        {
            key: 'restDayQuote',
            thunk: getRestDayQuoteAsync,
            cacheKey: 'rest_day_quote',
            ttl: CacheTTL.SHORT,
            required: false,
            refreshPriority: 'high',
            args: { useCache: false },
        },
    ];

    async checkCacheStatus(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];

        for (const item of allData) {
            const cached = await cacheService.get(item.cacheKey);
            const needsBackgroundRefresh = await cacheService.needsBackgroundRefresh(item.cacheKey);

            let status: 'fresh' | 'stale' | 'missing';
            if (!cached) {
                status = 'missing';
            } else if (needsBackgroundRefresh) {
                status = 'stale'; // Will be refreshed in background, but still usable
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
            try {
                // First, try to get from cache
                const cachedData = await cacheService.get(item.cacheKey);

                if (cachedData) {
                    // Cache hit - use cached data immediately
                    console.log(`Using cached data for ${item.key}`);
                    this.dispatch(addLoadedItem(item.key));
                    continue;
                }

                // Cache miss - fetch from API
                console.log(`Cache miss for ${item.key}, fetching from API`);
                const args = {
                    ...item.args,
                    useCache: true, // This will cache the result
                    forceRefresh: false,
                };

                const result = await this.dispatch(item.thunk(args));

                if (item.thunk.fulfilled.match(result)) {
                    this.dispatch(addLoadedItem(item.key));
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
        await this.refreshItemsIfNeeded(highPriorityItems, true); // Always refresh high priority

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
                const needsRefresh = forceRefresh || (await cacheService.needsBackgroundRefresh(item.cacheKey));

                if (!needsRefresh) {
                    console.log(`Skipping refresh for ${item.key} - still fresh`);
                    return;
                }

                console.log(`Background refreshing ${item.key}...`);

                const args = {
                    ...item.args,
                    useCache: true,
                    forceRefresh: true, // Force API call to update cache
                };

                const result = await this.dispatch(item.thunk(args));

                if (item.thunk.fulfilled.match(result)) {
                    console.log(`Successfully refreshed ${item.key} in background`);
                } else {
                    console.warn(`Failed to refresh ${item.key} in background`);
                }
            } catch (error) {
                console.warn(`Error refreshing ${item.key} in background:`, error);
            }
        });

        // Wait for all refreshes to complete (with timeout)
        await Promise.allSettled(refreshPromises);
    }
}
