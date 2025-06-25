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
import { AppDispatch, RootState } from '@/store/store';
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
    priority: 'critical' | 'high' | 'medium' | 'low';
    args?: any;
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
    private getState?: () => RootState; // Make optional
    private backgroundRefreshInProgress = false;
    private loadedData: Set<string> = new Set();
    private loadedResults: Map<string, any> = new Map(); // Store loaded results
    private userProgramId: string | null = null;
    private isFirstRun = false;

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    /**
     * Set the state getter function after instantiation
     */
    setStateGetter(getState: () => RootState): void {
        this.getState = getState;
    }

    // Flattened data categories with dependency-only sequencing
    private allDataCategories: DataCategory[] = [
        // Critical data
        {
            key: 'user',
            thunk: getUserAsync,
            cacheKey: CACHE_KEYS.USER_DATA,
            ttl: CacheTTL.LONG,
            required: true,
            priority: 'critical',
            args: { useCache: true },
        },
        {
            key: 'userFitnessProfile',
            thunk: getUserFitnessProfileAsync,
            cacheKey: CACHE_KEYS.USER_FITNESS_PROFILE,
            ttl: CacheTTL.LONG,
            required: true,
            priority: 'critical',
            args: { useCache: true },
        },
        {
            key: 'userProgramProgress',
            thunk: getUserProgramProgressAsync,
            cacheKey: CACHE_KEYS.USER_PROGRAM_PROGRESS,
            ttl: CacheTTL.LONG,
            required: true,
            priority: 'critical',
            args: { useCache: true },
        },

        // High priority data (essential for core functionality)
        {
            key: 'programs',
            thunk: getAllProgramsAsync,
            cacheKey: CACHE_KEYS.ALL_PROGRAMS,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            priority: 'high',
            args: { useCache: true },
        },
        {
            key: 'workouts',
            thunk: getAllWorkoutsAsync,
            cacheKey: CACHE_KEYS.ALL_WORKOUTS,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            priority: 'high',
            args: { useCache: true },
        },
        {
            key: 'exercises',
            thunk: fetchAllExercisesAsync,
            cacheKey: CACHE_KEYS.ALL_EXERCISES,
            ttl: CacheTTL.VERY_LONG,
            required: true,
            priority: 'high',
            args: { useCache: true },
        },
        {
            key: 'programDays',
            thunk: getAllProgramDaysAsync,
            cacheKey: 'program_days', // Will be dynamic
            ttl: CacheTTL.LONG,
            required: false, // Changed to false since it depends on having an active program
            priority: 'high',
            dependsOn: ['userProgramProgress'], // Only real dependency
            args: { useCache: true },
        },
        {
            key: 'userRecommendations',
            thunk: getUserRecommendationsAsync,
            cacheKey: CACHE_KEYS.USER_RECOMMENDATIONS,
            ttl: CacheTTL.SHORT,
            required: false,
            priority: 'high',
            args: { useCache: true },
        },

        // Medium priority data
        {
            key: 'userAppSettings',
            thunk: getUserAppSettingsAsync,
            cacheKey: CACHE_KEYS.USER_APP_SETTINGS,
            ttl: CacheTTL.LONG,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'exerciseSetModifications',
            thunk: getUserExerciseSetModificationsAsync,
            cacheKey: CACHE_KEYS.EXERCISE_SET_MODIFICATIONS,
            ttl: CacheTTL.LONG,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userWeightMeasurements',
            thunk: getWeightMeasurementsAsync,
            cacheKey: CACHE_KEYS.WEIGHT_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userSleepMeasurements',
            thunk: getSleepMeasurementsAsync,
            cacheKey: CACHE_KEYS.SLEEP_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'userBodyMeasurements',
            thunk: getBodyMeasurementsAsync,
            cacheKey: CACHE_KEYS.BODY_MEASUREMENTS,
            ttl: CacheTTL.LONG,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'spotlightWorkouts',
            thunk: getSpotlightWorkoutsAsync,
            cacheKey: CACHE_KEYS.SPOTLIGHT_WORKOUTS,
            ttl: CacheTTL.SHORT,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },
        {
            key: 'trackedLiftsHistory',
            thunk: initializeTrackedLiftsHistoryAsync,
            cacheKey: CACHE_KEYS.TRACKED_LIFTS_HISTORY,
            ttl: CacheTTL.SHORT,
            required: false,
            priority: 'medium',
            args: { useCache: true },
        },

        // Low priority data
        {
            key: 'exerciseSubstitutions',
            thunk: getUserExerciseSubstitutionsAsync,
            cacheKey: CACHE_KEYS.EXERCISE_SUBSTITUTIONS,
            ttl: CacheTTL.VERY_LONG,
            required: false,
            priority: 'low',
            args: { useCache: true },
        },
        {
            key: 'workoutQuote',
            thunk: getWorkoutQuoteAsync,
            cacheKey: CACHE_KEYS.WORKOUT_QUOTE,
            ttl: CacheTTL.SHORT,
            required: false,
            priority: 'low',
            args: { useCache: false },
        },
        {
            key: 'restDayQuote',
            thunk: getRestDayQuoteAsync,
            cacheKey: CACHE_KEYS.REST_DAY_QUOTE,
            ttl: CacheTTL.SHORT,
            required: false,
            priority: 'low',
            args: { useCache: false },
        },
    ];

    async checkCacheStatus(): Promise<void> {
        const cacheChecks = this.allDataCategories.map(async (item) => {
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

        // Determine if this is a first run (no critical cache)
        this.isFirstRun = await this.detectFirstRun();
        console.log(`First run detected: ${this.isFirstRun}`);
    }

    /**
     * NEW: Main initialization method that chooses strategy based on cache status
     */
    async initializeApp(): Promise<boolean> {
        try {
            if (this.isFirstRun) {
                console.log('Using first-run initialization strategy (maximum parallelization)');
                return await this.initializeFirstRun();
            } else {
                console.log('Using cache-aware initialization strategy');
                return await this.initializeCacheAware();
            }
        } catch (error) {
            console.error('Initialization failed:', error);
            this.dispatch(setCriticalError(error instanceof Error ? error.message : 'Unknown error'));
            return false;
        }
    }

    /**
     * First-run strategy: Maximum parallelization since no cache exists
     */
    private async initializeFirstRun(): Promise<boolean> {
        this.dispatch(setPhase('critical'));
        this.dispatch(setCriticalDataState(REQUEST_STATE.PENDING));

        // On first run, load everything possible in parallel
        // Only respect true dependencies, not artificial phase boundaries
        const results = await this.loadAllDataWithMaxParallelization();

        if (results.hasRequiredFailures) {
            this.dispatch(setCriticalDataState(REQUEST_STATE.REJECTED));
            this.dispatch(setCriticalError('Failed to load required app data'));
            return false;
        }

        this.dispatch(setCriticalDataState(REQUEST_STATE.FULFILLED));
        this.dispatch(setSecondaryDataState(REQUEST_STATE.FULFILLED));
        this.dispatch(setBackgroundSyncState(REQUEST_STATE.FULFILLED));

        return true;
    }

    /**
     * Cache-aware strategy: Respect cache and load in phases
     */
    private async initializeCacheAware(): Promise<boolean> {
        // Load critical data first
        this.dispatch(setPhase('critical'));
        this.dispatch(setCriticalDataState(REQUEST_STATE.PENDING));

        const criticalItems = this.allDataCategories.filter((item) => item.priority === 'critical');
        const criticalResults = await this.loadDataCategoryWithParallelization(criticalItems);

        if (criticalResults.hasRequiredFailures) {
            this.dispatch(setCriticalDataState(REQUEST_STATE.REJECTED));
            this.dispatch(setCriticalError('Failed to load critical app data'));
            return false;
        }

        this.dispatch(setCriticalDataState(REQUEST_STATE.FULFILLED));

        // Load secondary data
        this.dispatch(setPhase('secondary'));
        this.dispatch(setSecondaryDataState(REQUEST_STATE.PENDING));

        const secondaryItems = this.allDataCategories.filter((item) => item.priority === 'high' || item.priority === 'medium');
        const secondaryResults = await this.loadDataCategoryWithParallelization(secondaryItems);

        if (secondaryResults.hasRequiredFailures) {
            this.dispatch(setSecondaryDataState(REQUEST_STATE.REJECTED));
            return false;
        }

        this.dispatch(setSecondaryDataState(REQUEST_STATE.FULFILLED));

        // Start background loading
        setTimeout(() => this.startBackgroundSync(), 100);

        return true;
    }

    /**
     * NEW: Load all data with maximum parallelization for first run
     */
    private async loadAllDataWithMaxParallelization(): Promise<{ hasRequiredFailures: boolean }> {
        const loadResults: LoadResult[] = [];
        const processedItems = new Set<string>();

        // Separate items by dependency requirements
        const independentItems = this.allDataCategories.filter((item) => !item.dependsOn?.length);
        const dependentItems = this.allDataCategories.filter((item) => item.dependsOn?.length);

        console.log(`First run: Loading ${independentItems.length} independent items in parallel`);

        // Load ALL independent items in parallel (regardless of priority)
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

        // Process dependent items in waves
        let remainingDependentItems = [...dependentItems];
        let maxIterations = 10;
        let iteration = 0;

        while (remainingDependentItems.length > 0 && iteration < maxIterations) {
            iteration++;
            const readyItems: DataCategory[] = [];
            const stillWaitingItems: DataCategory[] = [];

            for (const item of remainingDependentItems) {
                const canLoad = await this.canLoadItem(item, processedItems);
                if (canLoad) {
                    readyItems.push(item);
                } else {
                    stillWaitingItems.push(item);
                }
            }

            if (readyItems.length === 0) {
                // Log remaining items that couldn't be loaded
                console.log(`Cannot load remaining items due to missing dependencies:`, 
                    stillWaitingItems.map(item => ({
                        key: item.key,
                        dependsOn: item.dependsOn,
                        reason: this.getCannotLoadReason(item)
                    }))
                );
                break;
            }

            console.log(`First run: Loading ${readyItems.length} dependent items in parallel (iteration ${iteration})`);

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

        const hasRequiredFailures = loadResults.some((result) => !result.success && result.required);

        // Log detailed results for first run
        const successCount = loadResults.filter((r) => r.success).length;
        const failureCount = loadResults.filter((r) => !r.success).length;
        console.log(`First run complete: ${successCount} successful, ${failureCount} failed`);

        return { hasRequiredFailures };
    }

    /**
     * Enhanced dependency checking that considers actual data availability
     */
    private async canLoadItem(item: DataCategory, processedItems: Set<string>): Promise<boolean> {
        // Check basic dependencies
        const basicDepsOk = item.dependsOn?.every((dep) => processedItems.has(dep)) ?? true;
        if (!basicDepsOk) {
            return false;
        }

        // Special handling for programDays - check if user actually has an active program
        if (item.key === 'programDays') {
            const programId = await this.getCurrentProgramId();
            if (!programId) {
                console.log(`Cannot load programDays - no active program found`);
                return false;
            }
        }

        return true;
    }

    /**
     * Get reason why an item cannot be loaded (for debugging)
     */
    private getCannotLoadReason(item: DataCategory): string {
        if (item.key === 'programDays') {
            return 'No active program found';
        }
        return `Missing dependencies: ${item.dependsOn?.join(', ')}`;
    }

    /**
     * Get current program ID from state or cache
     */
    private async getCurrentProgramId(): Promise<string | null> {
        try {
            // First try to get from Redux state if available
            if (this.getState) {
                const state = this.getState();
                const programProgress = state.user?.userProgramProgress;
                if (programProgress?.ProgramId) {
                    this.userProgramId = programProgress.ProgramId;
                    return programProgress.ProgramId;
                }
            }

            // Fallback to cache
            const cachedProgress = (await cacheService.get(CACHE_KEYS.USER_PROGRAM_PROGRESS)) as any;
            if (cachedProgress?.ProgramId) {
                this.userProgramId = cachedProgress.ProgramId;
                return cachedProgress.ProgramId;
            }

            return null;
        } catch (error) {
            console.warn('Failed to get current program ID:', error);
            return null;
        }
    }

    /**
     * Existing method - updated to use new canLoadItem logic
     */
    private async loadDataCategoryWithParallelization(dataItems: DataCategory[]): Promise<{ hasRequiredFailures: boolean }> {
        const loadResults: LoadResult[] = [];
        const processedItems = new Set<string>();

        const independentItems = dataItems.filter((item) => !item.dependsOn?.length);
        const dependentItems = dataItems.filter((item) => item.dependsOn?.length);

        console.log(`Loading ${independentItems.length} independent items in parallel`);

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

        // Process dependent items
        let remainingDependentItems = [...dependentItems];
        let maxIterations = 10;
        let iteration = 0;

        while (remainingDependentItems.length > 0 && iteration < maxIterations) {
            iteration++;
            const readyItems: DataCategory[] = [];
            const stillWaitingItems: DataCategory[] = [];

            for (const item of remainingDependentItems) {
                const canLoad = await this.canLoadItem(item, processedItems);
                if (canLoad) {
                    readyItems.push(item);
                } else {
                    stillWaitingItems.push(item);
                }
            }

            if (readyItems.length === 0) break;

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

        const hasRequiredFailures = loadResults.some((result) => !result.success && result.required);
        return { hasRequiredFailures };
    }

    /**
     * Detect if this is a first run (majority of critical data missing)
     */
    private async detectFirstRun(): Promise<boolean> {
        try {
            const criticalCacheKeys = [
                CACHE_KEYS.USER_FITNESS_PROFILE,
                CACHE_KEYS.USER_PROGRAM_PROGRESS,
                CACHE_KEYS.ALL_PROGRAMS,
                CACHE_KEYS.ALL_WORKOUTS,
                CACHE_KEYS.ALL_EXERCISES,
            ];

            let cachedCount = 0;
            for (const key of criticalCacheKeys) {
                const cached = await cacheService.get(key);
                if (cached) {
                    cachedCount++;
                }
            }

            // If less than 50% of critical data is cached, consider it a first run
            const isFirstRun = cachedCount < criticalCacheKeys.length * 0.5;

            console.log(`First run detection: ${cachedCount}/${criticalCacheKeys.length} items cached -> ${isFirstRun ? 'FIRST RUN' : 'CACHED RUN'}`);

            return isFirstRun;
        } catch (error) {
            console.warn('Error detecting first run:', error);
            return true; // Assume first run on error to use maximum parallelization
        }
    }

    async startBackgroundSync(): Promise<void> {
        if (this.backgroundRefreshInProgress) return;

        this.backgroundRefreshInProgress = true;
        this.dispatch(setPhase('background'));
        this.dispatch(setBackgroundSyncState(REQUEST_STATE.PENDING));

        try {
            // Load any remaining low priority items
            const lowPriorityItems = this.allDataCategories.filter((item) => item.priority === 'low');
            await this.loadDataCategoryWithParallelization(lowPriorityItems);

            // Refresh stale data
            await this.performSmartBackgroundRefresh();

            this.dispatch(setBackgroundSyncState(REQUEST_STATE.FULFILLED));
        } catch (error) {
            this.dispatch(setBackgroundSyncState(REQUEST_STATE.REJECTED));
            console.warn('Background sync failed:', error);
        } finally {
            this.backgroundRefreshInProgress = false;
        }
    }

    private async loadSingleItem(item: DataCategory): Promise<LoadResult> {
        try {
            const cacheKey = await this.getDynamicCacheKey(item);
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                console.log(`Using cached data for ${item.key}`);
                this.dispatch(addLoadedItem(item.key));
                this.loadedData.add(item.key);
                return { key: item.key, success: true, required: item.required };
            }

            console.log(`Cache miss for ${item.key}, fetching from API`);
            const args = await this.getArgsForItem(item);
            
            // Skip loading if args indicate this item shouldn't be loaded
            if (args === null) {
                console.log(`Skipping ${item.key} - conditions not met`);
                return { key: item.key, success: false, required: item.required };
            }

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

    private async getDynamicCacheKey(item: DataCategory): Promise<string> {
        if (item.key === 'programDays') {
            const programId = await this.getCurrentProgramId();
            return programId ? CACHE_KEYS.PROGRAM_DAYS(programId) : item.cacheKey;
        }
        return item.cacheKey;
    }

    private async getArgsForItem(item: DataCategory): Promise<any> {
        const baseArgs = { ...item.args };

        if (item.key === 'programDays') {
            const programId = await this.getCurrentProgramId();
            if (!programId) {
                return null; // Signal that this item shouldn't be loaded
            }
            return { ...baseArgs, programId };
        }

        return baseArgs;
    }

    private async performSmartBackgroundRefresh(): Promise<void> {
        const allData = this.allDataCategories;
        
        // Group items by refresh priority
        const highPriorityItems = allData.filter((item) => item.priority === 'high');
        const mediumPriorityItems = allData.filter((item) => item.priority === 'medium');
        const lowPriorityItems = allData.filter((item) => item.priority === 'low');
        
        // Refresh all priority groups in parallel (within each group, items refresh in parallel too)
        console.log('🔄 Starting parallel background refresh...');
        await Promise.allSettled([
            this.refreshItemsIfNeeded(highPriorityItems, true),
            this.refreshItemsIfNeeded(mediumPriorityItems, false),
            this.refreshItemsIfNeeded(lowPriorityItems, false),
        ]);
        console.log('✅ Smart background refresh completed');
    }
    
    private async refreshItemsIfNeeded(items: DataCategory[], forceRefresh: boolean): Promise<void> {
        const refreshPromises = items.map(async (item) => {
            try {
                // Check conditional items
                if (await this.canLoadConditionalItem(item)) {
                    const cacheKey = await this.getDynamicCacheKey(item);
                    const needsRefresh = forceRefresh || (await cacheService.needsBackgroundRefresh(cacheKey));
                    
                    if (!needsRefresh) {
                        console.log(`⏭️  Skipping refresh for ${item.key} - still fresh`);
                        return;
                    }
                    
                    console.log(`🔄 Background refreshing ${item.key}...`);
                    const args = {
                        ...item.args,
                        forceRefresh: true,
                        useCache: true,
                    };
                    
                    // Add dynamic args
                    if (item.key === 'programDays') {
                        const programId = await this.getCurrentProgramId();
                        if (programId) {
                            args.programId = programId;
                        } else {
                            console.log(`⏭️  Skipping refresh for ${item.key} - no active program`);
                            return;
                        }
                    }
                    
                    const result = await this.dispatch(item.thunk(args));
                    
                    if (item.thunk.fulfilled.match(result)) {
                        console.log(`✅ Successfully refreshed ${item.key} in background`);
                    } else {
                        console.warn(`⚠️  Failed to refresh ${item.key} in background`);
                    }
                } else {
                    console.log(`⏭️  Skipping conditional refresh for ${item.key} - dependencies not met`);
                }
            } catch (error) {
                console.warn(`❌ Error refreshing ${item.key} in background:`, error);
            }
        });
        
        await Promise.allSettled(refreshPromises);
    }
    
    private async canLoadConditionalItem(item: DataCategory): Promise<boolean> {
        // Handle conditional loading logic
        if (item.key === 'programDays') {
            const programId = await this.getCurrentProgramId();
            return !!programId;
        }
        
        // Add other conditional checks as needed
        // For example, you might want to check if user has certain features enabled
        // or if specific data exists before trying to load dependent data
        
        return true; // Default to true for non-conditional items
    }
}
