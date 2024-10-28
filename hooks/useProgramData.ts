// hooks/useProgramData.ts

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    getUserAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    completeDayAsync,
    uncompleteDayAsync,
    endProgramAsync,
    startProgramAsync,
    resetProgramAsync,
} from '@/store/user/thunks';
import { getProgramAsync, getAllProgramDaysAsync, getProgramDayAsync, getMultipleProgramDaysAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { selectWorkoutQuote, selectWorkoutQuoteState, selectRestDayQuote, selectRestDayQuoteState, selectQuoteError } from '@/store/quotes/selectors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { getWeekNumber, getNextDayIds, getDayOfWeek } from '@/utils/calendar';

interface UseProgramDataOptions {
    fetchAllDays?: boolean;
}

export const useProgramData = (
    specificProgramId?: string,
    specificDayId?: string,
    options: UseProgramDataOptions = { fetchAllDays: false }, // Default to false
) => {
    const dispatch = useDispatch<AppDispatch>();

    // User and general program selectors
    const user = useSelector((state: RootState) => state.user.user);
    const userState = useSelector((state: RootState) => state.user.userState);
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgressState);
    const userRecommendations = useSelector((state: RootState) => state.user.userRecommendations);
    const userRecommendationsState = useSelector((state: RootState) => state.user.userRecommendationsState);

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
            return getNextDayIds(userProgramProgress.CurrentDay, activeProgram.Days, 3);
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

    // Effects for data fetching
    useEffect(() => {
        if (userState === REQUEST_STATE.IDLE) {
            dispatch(getUserAsync());
        }
    }, [dispatch, userState]);

    useEffect(() => {
        if (user && user.UserId && userProgramProgressState === REQUEST_STATE.IDLE) {
            dispatch(getUserProgramProgressAsync(user.UserId));
        }
        if (user && user.UserId && userRecommendationsState === REQUEST_STATE.IDLE) {
            dispatch(getUserRecommendationsAsync(user.UserId));
        }
    }, [dispatch, user, userProgramProgressState, userRecommendationsState]);

    useEffect(() => {
        const programId = specificProgramId || userProgramProgress?.ProgramId;
        const dayId = specificDayId || userProgramProgress?.CurrentDay;

        if (programId) {
            if (activeProgramState === REQUEST_STATE.IDLE) {
                dispatch(getProgramAsync({ programId }));
            }
            if (dayId && programDayState === REQUEST_STATE.IDLE) {
                dispatch(getProgramDayAsync({ programId, dayId }));
            }

            if (options.fetchAllDays && Object.keys(programDaysState[programId] || {}).length === 0) {
                dispatch(getAllProgramDaysAsync({ programId }));
            }
        }
    }, [dispatch, specificProgramId, specificDayId, userProgramProgress, activeProgramState, programDayState, programDaysState, options.fetchAllDays]);

    useEffect(() => {
        if (workoutQuoteState !== REQUEST_STATE.FULFILLED) {
            dispatch(getWorkoutQuoteAsync());
        }
        if (restDayQuoteState !== REQUEST_STATE.FULFILLED) {
            dispatch(getRestDayQuoteAsync());
        }
    }, [dispatch, workoutQuoteState, restDayQuoteState]);

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
        specificProgramId,
        specificDayId,
        userProgramProgress,
        activeProgramState,
        programDayState,
        workoutQuoteState,
        restDayQuoteState,
        options.fetchAllDays, // Include options.fetchAllDays in dependencies
        activeProgram?.Days, // Include activeProgram?.Days if it's used in the computation
        programDaysState, // If necessary
    ]);

    // Additional computed values
    const currentDayNumber = specificDayId ? parseInt(specificDayId, 10) : parseInt(userProgramProgress?.CurrentDay || '0', 10);

    const currentWeek = userProgramProgress?.CurrentDay ? getWeekNumber(currentDayNumber) : null;

    const dayOfWeek = userProgramProgress?.CurrentDay ? getDayOfWeek(currentDayNumber) : null;

    const isLastDay = activeProgram && userProgramProgress && activeProgram.Days ? currentDayNumber === activeProgram.Days : false;

    const displayQuote = !isLastDay ? (programDay?.RestDay ? restDayQuote : workoutQuote) : null;

    const isEnrolled = !!userProgramProgress?.ProgramId && userProgramProgress.ProgramId === specificProgramId;

    const isDayCompleted = userProgramProgress?.CompletedDays?.includes(specificDayId) || false;

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

    const endProgram = () => {
        dispatch(endProgramAsync());
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

    return {
        user,
        userProgramProgress,
        userRecommendations,
        activeProgram,
        programDay,
        programDayState,
        programDays,
        activeProgramNextDays,
        dataLoadedState,
        isLastDay,
        currentWeek,
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
        error: programError || quoteError,
    };
};
