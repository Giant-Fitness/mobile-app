// hooks/useNutritionDataPool.ts

import { AppDispatch, RootState } from '@/store/store';
import { getNutritionLogsForDatesAsync } from '@/store/user/thunks';
import { UserNutritionLog } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';

const POOL_SIZE = 11; // ±5 days from center = 11 total days
const LOAD_BUFFER = 2; // Load new data when within 2 days of edge

// Helper functions
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

const generateDateRange = (centerDate: Date, totalDays: number): string[] => {
    const halfRange = Math.floor(totalDays / 2);
    const dates: string[] = [];

    for (let i = -halfRange; i <= halfRange; i++) {
        dates.push(formatDateForAPI(addDays(centerDate, i)));
    }

    return dates;
};

interface UseNutritionDataPoolOptions {
    poolSize?: number;
    loadBuffer?: number;
    autoLoad?: boolean;
    useCache?: boolean;
}

interface UseNutritionDataPoolReturn {
    // Get data for a specific date from the pool
    getDataForDate: (date: Date) => UserNutritionLog | null | undefined;

    // Check if data is loaded for a date
    isDateLoaded: (date: Date) => boolean;

    // Check if currently loading
    isLoading: boolean;

    // Error state
    error: string | null;

    // Manually refresh the pool around a new center date
    refreshPool: (centerDate: Date, forceRefresh?: boolean) => Promise<void>;

    // Get pool statistics for debugging
    getPoolStats: () => {
        totalDates: number;
        loadedDates: number;
        centerDate: string;
        dateRange: [string, string];
    };
}

export const useNutritionDataPool = (initialCenterDate: Date, options: UseNutritionDataPoolOptions = {}): UseNutritionDataPoolReturn => {
    const { poolSize = POOL_SIZE, loadBuffer = LOAD_BUFFER, autoLoad = true, useCache = true } = options;

    const dispatch = useDispatch<AppDispatch>();
    const { user, userNutritionLogs, userNutritionLogsState } = useSelector((state: RootState) => state.user);

    const [centerDate, setCenterDate] = useState(initialCenterDate);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOnboardingComplete = Boolean(user?.OnboardingComplete);
    const isMountedRef = useRef(true);

    // Track the current pool range
    const currentPoolDates = useMemo(() => {
        return generateDateRange(centerDate, poolSize);
    }, [centerDate, poolSize]);

    const poolStartDate = currentPoolDates[0];
    const poolEndDate = currentPoolDates[currentPoolDates.length - 1];

    // Function to get data for a specific date
    const getDataForDate = useCallback(
        (date: Date): UserNutritionLog | null | undefined => {
            const dateString = formatDateForAPI(date);
            return userNutritionLogs[dateString];
        },
        [userNutritionLogs],
    );

    // Function to check if data is loaded for a date
    const isDateLoaded = useCallback(
        (date: Date): boolean => {
            const dateString = formatDateForAPI(date);
            return dateString in userNutritionLogs;
        },
        [userNutritionLogs],
    );

    // Function to load data for a range of dates
    const loadDataForDates = useCallback(
        async (dates: string[], forceRefresh: boolean = false): Promise<void> => {
            if (!user?.UserId || !isOnboardingComplete || dates.length === 0) {
                return;
            }

            // Filter out dates that are already loaded unless forcing refresh
            const datesToLoad = forceRefresh ? dates : dates.filter((date) => !(date in userNutritionLogs));

            if (datesToLoad.length === 0) {
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                await dispatch(
                    getNutritionLogsForDatesAsync({
                        dates: datesToLoad,
                        forceRefresh,
                        useCache,
                    }),
                ).unwrap();
            } catch (err) {
                console.error('Failed to load nutrition data pool:', err);
                if (isMountedRef.current) {
                    setError(err instanceof Error ? err.message : 'Failed to load nutrition data');
                }
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [dispatch, user?.UserId, isOnboardingComplete, userNutritionLogs, useCache],
    );

    // Function to refresh the pool around a new center date
    const refreshPool = useCallback(
        async (newCenterDate: Date, forceRefresh: boolean = false): Promise<void> => {
            const newPoolDates = generateDateRange(newCenterDate, poolSize);
            setCenterDate(newCenterDate);
            await loadDataForDates(newPoolDates, forceRefresh);
        },
        [loadDataForDates, poolSize],
    );

    // Function to check if we need to expand the pool (when user swipes near edges)
    const checkAndExpandPool = useCallback(
        async (targetDate: Date): Promise<void> => {
            const targetDateString = formatDateForAPI(targetDate);

            // Check if target date is near the edges of our current pool
            const targetIndex = currentPoolDates.indexOf(targetDateString);

            if (targetIndex === -1) {
                // Target date is outside our pool - need to refresh pool around new center
                await refreshPool(targetDate);
                return;
            }

            // Check if we're within the load buffer of either edge
            const isNearStart = targetIndex < loadBuffer;
            const isNearEnd = targetIndex >= currentPoolDates.length - loadBuffer;

            if (isNearStart || isNearEnd) {
                // Expand the pool by shifting the center date
                let newCenterDate = centerDate;

                if (isNearStart) {
                    newCenterDate = addDays(centerDate, -Math.floor(poolSize / 4));
                } else if (isNearEnd) {
                    newCenterDate = addDays(centerDate, Math.floor(poolSize / 4));
                }

                await refreshPool(newCenterDate);
            }
        },
        [currentPoolDates, loadBuffer, centerDate, poolSize, refreshPool],
    );

    // Initial load when hook mounts or center date changes significantly
    useFocusEffect(
        useCallback(() => {
            isMountedRef.current = true;

            if (autoLoad && user?.UserId && isOnboardingComplete) {
                loadDataForDates(currentPoolDates);
            }

            return () => {
                isMountedRef.current = false;
            };
        }, [autoLoad, user?.UserId, isOnboardingComplete, currentPoolDates, loadDataForDates]),
    );

    // Update center date when initialCenterDate changes (e.g., from date picker)
    useEffect(() => {
        const currentCenterString = formatDateForAPI(centerDate);
        const newCenterString = formatDateForAPI(initialCenterDate);

        if (currentCenterString !== newCenterString) {
            checkAndExpandPool(initialCenterDate);
        }
    }, [initialCenterDate, centerDate, checkAndExpandPool]);

    // Loading state - consider loading if we're fetching or if we don't have key dates
    const effectiveIsLoading = useMemo(() => {
        if (isLoading || userNutritionLogsState === 'PENDING') {
            return true;
        }

        // Check if we have the core dates (center ± 1)
        const coreDates = generateDateRange(centerDate, 3);
        const hasCoreDates = coreDates.every((date) => date in userNutritionLogs);

        return !hasCoreDates;
    }, [isLoading, userNutritionLogsState, centerDate, userNutritionLogs]);

    // Get pool statistics for debugging
    const getPoolStats = useCallback(() => {
        const totalDates = currentPoolDates.length;
        const loadedDates = currentPoolDates.filter((date) => date in userNutritionLogs).length;

        return {
            totalDates,
            loadedDates,
            centerDate: formatDateForAPI(centerDate),
            dateRange: [poolStartDate, poolEndDate] as [string, string],
        };
    }, [currentPoolDates, userNutritionLogs, centerDate, poolStartDate, poolEndDate]);

    return {
        getDataForDate,
        isDateLoaded,
        isLoading: effectiveIsLoading,
        error,
        refreshPool,
        getPoolStats,
    };
};
