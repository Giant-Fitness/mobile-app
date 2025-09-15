// hooks/useNutritionLog.ts

import { AppDispatch, RootState } from '@/store/store';
import { getNutritionLogForDateAsync } from '@/store/user/thunks';
import { UserNutritionLog } from '@/types';
import { useCallback, useMemo } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';

interface UseNutritionLogOptions {
    autoLoad?: boolean;
    useCache?: boolean;
    forceRefresh?: boolean;
}

interface UseNutritionLogReturn {
    nutritionLog: UserNutritionLog | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useNutritionLog = (date: string, options: UseNutritionLogOptions = {}): UseNutritionLogReturn => {
    const { autoLoad = true, useCache = true, forceRefresh = false } = options;

    const dispatch = useDispatch<AppDispatch>();
    const { userNutritionLogs, userNutritionLogsState, error, user } = useSelector((state: RootState) => state.user);

    const isOnboardingComplete = Boolean(user?.OnboardingComplete);

    // Memoized nutrition log for the specific date
    const nutritionLog = useMemo(() => {
        if (!isOnboardingComplete) return null;
        return userNutritionLogs[date] || null;
    }, [userNutritionLogs, date, isOnboardingComplete]);

    // Check if data is already loaded
    const isDataLoaded = useMemo(() => {
        return date in userNutritionLogs;
    }, [userNutritionLogs, date]);

    // Loading state
    const isLoading = useMemo(() => {
        return userNutritionLogsState === 'PENDING' && !isDataLoaded;
    }, [userNutritionLogsState, isDataLoaded]);

    // Refetch function
    const refetch = useCallback(() => {
        if (user?.UserId && isOnboardingComplete) {
            dispatch(
                getNutritionLogForDateAsync({
                    date,
                    forceRefresh: true,
                    useCache,
                }),
            );
        }
    }, [dispatch, date, user?.UserId, isOnboardingComplete, useCache]);

    // Auto-load data when component focuses
    useFocusEffect(
        useCallback(() => {
            if (!autoLoad || !user?.UserId || !isOnboardingComplete) return;

            // Only fetch if not already loaded or if forcing refresh
            if (!isDataLoaded || forceRefresh) {
                dispatch(
                    getNutritionLogForDateAsync({
                        date,
                        useCache,
                        forceRefresh,
                    }),
                );
            }
        }, [dispatch, date, user?.UserId, isOnboardingComplete, autoLoad, isDataLoaded, forceRefresh, useCache]),
    );

    return {
        nutritionLog,
        isLoading,
        error,
        refetch,
    };
};

// Helper hook for multiple dates (for swipe navigation)
export const useNutritionLogsForDates = (dates: string[]): { [date: string]: UserNutritionLog | null } => {
    const { userNutritionLogs } = useSelector((state: RootState) => state.user);

    return useMemo(() => {
        const result: { [date: string]: UserNutritionLog | null } = {};
        dates.forEach((date) => {
            result[date] = userNutritionLogs[date] || null;
        });
        return result;
    }, [userNutritionLogs, dates]);
};
