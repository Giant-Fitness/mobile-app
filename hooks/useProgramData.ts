// hooks/useProgramData.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { getAllProgramDaysAsync, getProgramAsync, getProgramDayAsync } from '@/store/programs/thunks';
import { selectQuoteError, selectRestDayQuote, selectRestDayQuoteState, selectWorkoutQuote, selectWorkoutQuoteState } from '@/store/quotes/selectors';
import { getRestDayQuoteAsync, getWorkoutQuoteAsync } from '@/store/quotes/thunks';
import { AppDispatch, RootState } from '@/store/store';
import {
    completeDayAsync,
    endProgramAsync,
    getUserAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    resetProgramAsync,
    startProgramAsync,
    uncompleteDayAsync,
} from '@/store/user/thunks';
import { getDayOfWeek, getNextDayIds, getWeekNumber, groupProgramDaysIntoWeeks, groupWeeksIntoMonths } from '@/utils/calendar';
import { useEffect, useMemo, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

interface PreloadedData {
    months: any[][][];
    currentMonthIndex: number;
}

let preloadedProgressData: { [key: string]: PreloadedData } = {};

export const preloadProgramProgressData = async (dispatch: AppDispatch, programId: string, forceRefresh: boolean = false) => {
    // Load program days with optional force refresh
    const programDaysResult = await dispatch(getAllProgramDaysAsync({ programId, forceRefresh })).unwrap();

    // Process the data we just received
    const programDaysArray = Object.values(programDaysResult);
    const groupedWeeks = groupProgramDaysIntoWeeks(programDaysArray);
    const groupedMonths = groupWeeksIntoMonths(groupedWeeks);

    preloadedProgressData[programId] = {
        months: groupedMonths,
        currentMonthIndex: 0, // Will be updated when actually viewing the progress screen
    };
};

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

interface UseProgramDataOptions {
    fetchAllDays?: boolean;
    forceRefresh?: boolean;
}

export const useProgramData = (
    specificProgramId?: string,
    specificDayId?: string,
    options: UseProgramDataOptions = { fetchAllDays: false, forceRefresh: false }, // Added forceRefresh option
) => {
    const dispatch = useDispatch<AppDispatch>();

    // User and general program selectors
    const user = useSelector((state: RootState) => state.user.user);
    const userState = useSelector((state: RootState) => state.user.userState);
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgressState);
    const userRecommendations = useSelector((state: RootState) => state.user.userRecommendations);
    const userRecommendationsState = useSelector((state: RootState) => state.user.userRecommendationsState);

    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [isCompletingDay, setIsCompletingDay] = useState(false);
    const [isUncompletingDay, setIsUncompletingDay] = useState(false);

    // Program-specific selectors
    const { programs, programsState, programDays, programDaysState, error: programError } = useSelector((state: RootState) => state.programs);

    // Quote selectors
    const workoutQuote = useSelector(selectWorkoutQuote);
    const workoutQuoteState = useSelector(selectWorkoutQuoteState);
    const restDayQuote = useSelector(selectRestDayQuote);
    const restDayQuoteState = useSelector(selectRestDayQuoteState);
    const quoteError = useSelector(selectQuoteError);

    // Computed values
    const activeProgram = useMemo(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        return programId ? programs[programId] : null;
    }, [specificProgramId, userProgramProgress, programs]);

    const activeProgramState = useMemo(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        return programId ? programsState[programId] : REQUEST_STATE.IDLE;
    }, [specificProgramId, userProgramProgress, programsState]);

    const programDay = useMemo(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        const dayId = specificDayId || userProgramProgress?.CurrentDay;
        return programId && dayId ? programDays[programId]?.[dayId] : null;
    }, [specificProgramId, specificDayId, userProgramProgress, programDays]);

    const programDayState = useMemo(() => {
        if (specificProgramId) {
            if (specificDayId) {
                // When a specificProgramId and specificDayId are provided
                return programDaysState[specificProgramId]?.[specificDayId] || REQUEST_STATE.IDLE;
            }
            // When only a specificProgramId is provided, assume programDayState is fulfilled
            return REQUEST_STATE.FULFILLED;
        } else {
            // When no specificProgramId is provided, use user's current program progress
            const programId = userProgramProgress?.ProgramId;
            const dayId = userProgramProgress?.CurrentDay;
            return programId && dayId ? programDaysState[programId]?.[dayId] || REQUEST_STATE.IDLE : REQUEST_STATE.IDLE;
        }
    }, [specificProgramId, specificDayId, userProgramProgress, programDaysState]);

    const activeProgramNextDayIds = useMemo(() => {
        if (!specificDayId && userProgramProgress?.CurrentDay && activeProgram?.Days) {
            return getNextDayIds(userProgramProgress.CurrentDay.toString(), activeProgram.Days, 3);
        }
        return null;
    }, [specificDayId, userProgramProgress, activeProgram]);

    const activeProgramNextDays = useMemo(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        if (programId && activeProgramNextDayIds) {
            return activeProgramNextDayIds.map((dayId) => programDays[programId]?.[dayId]).filter((day) => day !== undefined);
        }
        return [];
    }, [specificProgramId, userProgramProgress, activeProgramNextDayIds, programDays]);

    const activeProgramCurrentDay = useMemo(() => {
        const programId = userProgramProgress?.ProgramId;
        const dayId = userProgramProgress?.CurrentDay;
        if (programId && dayId) {
            return programDays[programId]?.[dayId];
        }
        return null;
    }, [userProgramProgress, programDays]);

    // Effects for data fetching
    useEffect(() => {
        // Use forceRefresh flag for initial data fetch if specified
        if (userState === REQUEST_STATE.IDLE || options.forceRefresh) {
            dispatch(getUserAsync({ forceRefresh: options.forceRefresh }));
        }
    }, [dispatch, userState, options.forceRefresh]);

    useEffect(() => {
        if (user && user.UserId) {
            if (userProgramProgressState === REQUEST_STATE.IDLE || options.forceRefresh) {
                dispatch(getUserProgramProgressAsync({ forceRefresh: options.forceRefresh }));
            }
            if (userRecommendationsState === REQUEST_STATE.IDLE || options.forceRefresh) {
                dispatch(getUserRecommendationsAsync({ forceRefresh: options.forceRefresh }));
            }
        }
    }, [dispatch, user, userProgramProgressState, userRecommendationsState, options.forceRefresh]);

    useEffect(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        const dayId = specificDayId || userProgramProgress?.CurrentDay;
        if (programId) {
            if (activeProgramState === REQUEST_STATE.IDLE || options.forceRefresh) {
                dispatch(getProgramAsync({ programId, forceRefresh: options.forceRefresh }));
            }
            if (dayId && (programDayState === REQUEST_STATE.IDLE || options.forceRefresh)) {
                dispatch(getProgramDayAsync({ programId, dayId, forceRefresh: options.forceRefresh }));
            }

            if ((options.fetchAllDays && Object.keys(programDaysState[programId] || {}).length === 0) || options.forceRefresh) {
                dispatch(getAllProgramDaysAsync({ programId, forceRefresh: options.forceRefresh }));
            }
        }
    }, [
        dispatch,
        specificProgramId,
        specificDayId,
        userProgramProgress,
        activeProgramState,
        programDayState,
        programDaysState,
        options.fetchAllDays,
        options.forceRefresh,
    ]);

    useEffect(() => {
        if (workoutQuoteState !== REQUEST_STATE.FULFILLED || options.forceRefresh) {
            dispatch(getWorkoutQuoteAsync({ forceRefresh: options.forceRefresh }));
        }
        if (restDayQuoteState !== REQUEST_STATE.FULFILLED || options.forceRefresh) {
            dispatch(getRestDayQuoteAsync({ forceRefresh: options.forceRefresh }));
        }
    }, [dispatch, workoutQuoteState, restDayQuoteState, options.forceRefresh]);

    const programCalendarData = useMemo(() => {
        const programId = activeProgram?.ProgramId;
        if (!programId || !programDays[programId]) {
            return {
                months: [],
                initialMonthIndex: 0,
                currentWeek: 1,
            };
        }

        const programDaysArray = Object.values(programDays[programId]);
        if (!programDaysArray.length) {
            return {
                months: [],
                initialMonthIndex: 0,
                currentWeek: 1,
            };
        }

        const groupedWeeks = groupProgramDaysIntoWeeks(programDaysArray);

        const groupedMonths = groupWeeksIntoMonths(groupedWeeks);

        // Calculate initial month index
        let initialMonthIndex = 0;
        if (userProgramProgress?.CurrentDay) {
            initialMonthIndex = Math.floor((userProgramProgress.CurrentDay - 1) / 28);
            initialMonthIndex = Math.min(initialMonthIndex, groupedMonths.length - 1);
        }

        return {
            months: groupedMonths,
            initialMonthIndex,
            currentWeek: userProgramProgress?.CurrentDay ? getWeekNumber(userProgramProgress.CurrentDay) : 1,
        };
    }, [activeProgram, programDays, userProgramProgress]);

    // Wait for data to be loaded before setting month index
    useEffect(() => {
        if (programCalendarData.months.length > 0) {
            setCurrentMonthIndex(programCalendarData.initialMonthIndex);
        }
    }, [programCalendarData]);

    // Compute overall data loaded state
    const dataLoadedState = useMemo(() => {
        // Basic checks for user and program progress
        if (
            userState !== REQUEST_STATE.FULFILLED ||
            userProgramProgressState !== REQUEST_STATE.FULFILLED ||
            userRecommendationsState !== REQUEST_STATE.FULFILLED
        ) {
            return REQUEST_STATE.PENDING;
        }
        // If specificProgramId and specificDayId are provided, check for their respective states
        if (specificProgramId && specificDayId) {
            return activeProgramState === REQUEST_STATE.FULFILLED && programDayState === REQUEST_STATE.FULFILLED
                ? REQUEST_STATE.FULFILLED
                : REQUEST_STATE.PENDING;
        }

        // If specificProgramId is provided without specificDayId
        if (specificProgramId) {
            // Base conditions for dataLoadedState
            let isFulfilled =
                activeProgramState === REQUEST_STATE.FULFILLED &&
                workoutQuoteState === REQUEST_STATE.FULFILLED &&
                restDayQuoteState === REQUEST_STATE.FULFILLED;

            // If fetchAllDays is true, ensure all program days are loaded
            if (options.fetchAllDays) {
                const programId = specificProgramId;
                const allDaysLoaded = programId ? Object.keys(programDaysState[programId] || {}).length >= (activeProgram?.Days || 0) : false;
                isFulfilled = isFulfilled && allDaysLoaded;
            }

            return isFulfilled ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING;
        }

        // If a program is in progress (userProgramProgress.ProgramId exists)
        if (userProgramProgress?.ProgramId) {
            // Base conditions for dataLoadedState
            let isFulfilled =
                activeProgramState === REQUEST_STATE.FULFILLED &&
                programDayState === REQUEST_STATE.FULFILLED &&
                workoutQuoteState === REQUEST_STATE.FULFILLED &&
                restDayQuoteState === REQUEST_STATE.FULFILLED;

            // If fetchAllDays is true, ensure all program days are loaded
            if (options.fetchAllDays) {
                const programId = userProgramProgress.ProgramId;
                const allDaysLoaded = programId ? Object.keys(programDaysState[programId] || {}).length >= (activeProgram?.Days || 0) : false;
                isFulfilled = isFulfilled && allDaysLoaded;
            }

            return isFulfilled ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING;
        }

        // Default to fulfilled if no specific conditions are unmet
        return REQUEST_STATE.FULFILLED;
    }, [
        userState,
        userProgramProgressState,
        userRecommendationsState,
        specificProgramId,
        specificDayId,
        userProgramProgress,
        activeProgramState,
        programDayState,
        workoutQuoteState,
        restDayQuoteState,
        options.fetchAllDays,
        activeProgram?.Days,
        programDaysState,
    ]);

    // Additional computed values
    const currentDayNumber = specificDayId ? parseInt(specificDayId, 10) : userProgramProgress?.CurrentDay;

    const dayOfWeek = userProgramProgress?.CurrentDay ? getDayOfWeek(currentDayNumber) : null;

    const isLastDay = activeProgram && userProgramProgress && activeProgram.Days ? currentDayNumber === activeProgram.Days : false;

    const displayQuote = !isLastDay ? (programDay?.RestDay ? restDayQuote : workoutQuote) : null;

    const isEnrolled = !!userProgramProgress?.ProgramId && userProgramProgress.ProgramId === specificProgramId;

    const isDayCompleted = userProgramProgress?.CompletedDays?.includes(parseInt(specificDayId)) || false;

    const handleCompleteDay = async () => {
        if (specificDayId) {
            setIsCompletingDay(true);
            try {
                await dispatch(completeDayAsync({ dayId: specificDayId })).unwrap();
            } catch (error) {
                console.error('Failed to complete day:', error);
            } finally {
                setIsCompletingDay(false);
            }
        }
    };

    const handleUncompleteDay = async () => {
        if (specificDayId) {
            setIsUncompletingDay(true);
            try {
                await dispatch(uncompleteDayAsync({ dayId: specificDayId })).unwrap();
            } catch (error) {
                console.error('Failed to uncomplete day:', error);
            } finally {
                setIsUncompletingDay(false);
            }
        }
    };

    const endProgram = async () => {
        try {
            // Dispatch the action and wait for it to complete
            await dispatch(endProgramAsync()).unwrap();

            // Force refresh of user program progress state
            // This ensures we have the latest state after ending the program
            await dispatch(getUserProgramProgressAsync({ forceRefresh: true })).unwrap();

            return true;
        } catch (error) {
            console.error('Error ending program:', error);
            return false;
        }
    };

    const startProgram = () => {
        if (specificProgramId) {
            dispatch(startProgramAsync({ programId: specificProgramId }));
            // Fetch all program days when starting a new program
            dispatch(getAllProgramDaysAsync({ programId: specificProgramId }));
        }
    };

    const resetProgram = () => {
        dispatch(resetProgramAsync());
    };

    const hasCompletedWorkoutToday = useMemo(() => {
        // If there's no program progress or LastActivityAt or last action was an uncomplete, return false
        if (!userProgramProgress?.LastActivityAt || userProgramProgress.LastAction === 'uncomplete' || userProgramProgress.LastActionWasAutoComplete)
            return false;

        // If this is day 1, then treat it like no workouts today
        if (userProgramProgress.CurrentDay === 1) {
            return false;
        }

        // Otherwise, check if they've completed a workout today
        return isToday(userProgramProgress.LastActivityAt);
    }, [userProgramProgress, userProgramProgress?.LastActivityAt, userProgramProgress?.CurrentDay]);

    const handleAutoCompleteRestDays = async () => {
        // Use user's current program progress
        if (!userProgramProgress?.LastActivityAt || !userProgramProgress?.ProgramId) {
            return 0;
        }

        try {
            // Get dates at midnight local time to compare calendar days, not time differences
            const lastActive = new Date(userProgramProgress.LastActivityAt);
            const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

            const now = new Date();
            const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Calculate calendar days difference (not 24-hour periods)
            const timeDiffMillis = todayDate.getTime() - lastActiveDate.getTime();
            const calendarDaysPassed = Math.floor(timeDiffMillis / (1000 * 60 * 60 * 24));

            // We need at least 2 calendar days to have passed to skip a rest day
            // Day 1 (Mon): Complete workout
            // Day 2 (Tue): Current day = rest day, don't skip (0-1 days passed)
            // Day 3 (Wed): Should skip Day 2 rest and show Day 3 workout (2+ days passed)
            if (calendarDaysPassed < 2) {
                return 0;
            }

            const programId = userProgramProgress.ProgramId;

            // Load all program days and wait for the result
            const loadedProgramDays = await dispatch(
                getAllProgramDaysAsync({
                    programId,
                    forceRefresh: true,
                }),
            ).unwrap();

            const totalProgramDays = programs[programId]?.Days || 0;
            const currentDay = userProgramProgress.CurrentDay;

            let daysToComplete = [];

            // Start checking from the current day
            let dayToCheck = currentDay;

            // We can auto-complete up to (calendarDaysPassed - 1) days
            // This ensures we don't complete today's day, only past days
            const maxDaysToAutoComplete = calendarDaysPassed - 1;
            let daysChecked = 0;

            // Check consecutive rest days starting from current day
            while (dayToCheck - 1 < totalProgramDays - 1 && daysChecked < maxDaysToAutoComplete) {
                const dayData = loadedProgramDays[dayToCheck - 1];

                // If it's a rest day, mark it for completion
                if (dayData?.RestDay) {
                    daysToComplete.push(dayToCheck);
                    dayToCheck++;
                    daysChecked++;
                } else {
                    // Stop when we hit a workout day
                    break;
                }
            }

            // If we have days to complete, complete the last one
            // The backend will automatically mark in-between days as complete
            if (daysToComplete.length > 0) {
                // Get the last day to complete (highest day number)
                const lastDayToComplete = Math.max(...daysToComplete);

                // Complete only the last day
                await dispatch(completeDayAsync({ dayId: lastDayToComplete.toString(), isAutoComplete: true })).unwrap();

                // Refresh the program progress
                await dispatch(getUserProgramProgressAsync({ forceRefresh: true })).unwrap();
            }

            return daysToComplete.length;
        } catch (error) {
            console.error('Auto-complete rest days failed:', error);
            return 0;
        }
    };

    return {
        user,
        userProgramProgress,
        userRecommendations,
        activeProgram,
        programDay,
        programDayState,
        programDays,
        activeProgramNextDays,
        activeProgramCurrentDay,
        dataLoadedState,
        isLastDay,
        dayOfWeek,
        displayQuote,
        isEnrolled,
        isDayCompleted,
        handleCompleteDay,
        handleUncompleteDay,
        endProgram,
        startProgram,
        resetProgram,
        isCompletingDay,
        isUncompletingDay,
        months: programCalendarData.months,
        currentMonthIndex,
        setCurrentMonthIndex,
        hasCompletedWorkoutToday,
        handleAutoCompleteRestDays,
        currentWeek: programCalendarData.currentWeek,
        error: programError || quoteError,
    };
};
