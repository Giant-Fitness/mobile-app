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
    required: boolean; // If false, failure won't block app initialization
    args?: any; // Arguments to pass to the thunk
}

export class InitializationService {
    private dispatch: AppDispatch;

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    // Define data categories with their cache settings
    private criticalData: DataCategory[] = [
        {
            key: 'user',
            thunk: getUserAsync,
            cacheKey: 'user_data',
            ttl: CacheTTL.LONG,
            required: true,
            args: { useCache: true },
        },
        {
            key: 'userFitnessProfile',
            thunk: getUserFitnessProfileAsync,
            cacheKey: 'user_fitness_profile',
            ttl: CacheTTL.LONG,
            required: true,
            args: { useCache: true },
        },
        {
            key: 'userAppSettings',
            thunk: getUserAppSettingsAsync,
            cacheKey: 'user_app_settings',
            ttl: CacheTTL.LONG,
            required: false,
            args: { useCache: true },
        },
    ];

    private secondaryData: DataCategory[] = [
        {
            key: 'programs',
            thunk: getAllProgramsAsync,
            cacheKey: 'all_programs',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            args: { useCache: true },
        },
        {
            key: 'workouts',
            thunk: getAllWorkoutsAsync,
            cacheKey: 'all_workouts',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            args: { useCache: true },
        },
        {
            key: 'exercises',
            thunk: fetchAllExercisesAsync,
            cacheKey: 'all_exercises',
            ttl: CacheTTL.VERY_LONG,
            required: true,
            args: { useCache: true },
        },
        {
            key: 'userRecommendations',
            thunk: getUserRecommendationsAsync,
            cacheKey: 'user_recommendations',
            ttl: CacheTTL.SHORT,
            required: false,
            args: { useCache: true },
        },
        {
            key: 'exerciseSubstitutions',
            thunk: getUserExerciseSubstitutionsAsync,
            cacheKey: 'exercise_substitutions',
            ttl: CacheTTL.VERY_LONG,
            required: false,
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
            args: { useCache: true },
        },
        {
            key: 'trackedLiftsHistory',
            thunk: initializeTrackedLiftsHistoryAsync,
            cacheKey: 'tracked_lifts_history',
            ttl: CacheTTL.SHORT,
            required: false,
            args: { useCache: true },
        },
        {
            key: 'workoutQuote',
            thunk: getWorkoutQuoteAsync,
            cacheKey: 'workout_quote',
            ttl: CacheTTL.SHORT,
            required: false,
            args: { useCache: false },
        },
        {
            key: 'restDayQuote',
            thunk: getRestDayQuoteAsync,
            cacheKey: 'rest_day_quote',
            ttl: CacheTTL.SHORT,
            required: false,
            args: { useCache: false },
        },
    ];

    async checkCacheStatus(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];

        for (const item of allData) {
            const cached = await cacheService.get(item.cacheKey);
            const isExpired = await cacheService.isExpired(item.cacheKey);

            let status: 'fresh' | 'stale' | 'missing';
            if (!cached) {
                status = 'missing';
            } else if (isExpired) {
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
            const results = await this.loadDataCategory(this.criticalData, true);

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
            const results = await this.loadDataCategory(this.secondaryData, true);

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
        this.dispatch(setPhase('background'));
        this.dispatch(setBackgroundSyncState(REQUEST_STATE.PENDING));

        try {
            // Load background data
            await this.loadDataCategory(this.backgroundData, false);

            // Refresh any stale cached data
            await this.refreshStaleData();

            this.dispatch(setBackgroundSyncState(REQUEST_STATE.FULFILLED));
        } catch (error) {
            this.dispatch(setBackgroundSyncState(REQUEST_STATE.REJECTED));
            console.warn('Background sync failed:', error);
        }
    }

    private async loadDataCategory(dataItems: DataCategory[], loadFromCacheFirst: boolean): Promise<{ hasRequiredFailures: boolean }> {
        let hasRequiredFailures = false;

        for (const item of dataItems) {
            try {
                // Call the thunk with cache enabled (thunks now handle cache internally)
                const args = {
                    ...item.args,
                    useCache: loadFromCacheFirst,
                    forceRefresh: false,
                };

                const result = await this.dispatch(item.thunk(args));

                if (item.thunk.fulfilled.match(result)) {
                    this.dispatch(addLoadedItem(item.key));
                    console.log(`Loaded ${item.key} (cache-aware)`);
                } else {
                    throw new Error(`Failed to load ${item.key}`);
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

    private async refreshStaleData(): Promise<void> {
        const allData = [...this.criticalData, ...this.secondaryData, ...this.backgroundData];
        const staleItems = [];

        for (const item of allData) {
            const isExpired = await cacheService.isExpired(item.cacheKey);
            if (isExpired) {
                staleItems.push(item);
            }
        }

        if (staleItems.length > 0) {
            console.log(`Refreshing ${staleItems.length} stale cache items in background`);

            // Refresh stale items with force refresh to bypass cache
            for (const item of staleItems) {
                try {
                    const args = {
                        ...item.args,
                        useCache: true,
                        forceRefresh: true, // This forces API call and updates cache
                    };

                    await this.dispatch(item.thunk(args));
                    console.log(`Refreshed stale data for ${item.key}`);
                } catch (error) {
                    console.warn(`Failed to refresh stale data for ${item.key}:`, error);
                }
            }
        }
    }
}
