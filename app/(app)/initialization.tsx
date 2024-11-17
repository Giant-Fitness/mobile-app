// app/(app)/initialization.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { router } from 'expo-router';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import {
    getUserAsync,
    getUserFitnessProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
} from '@/store/user/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { BasicSplash } from '@/components/base/BasicSplash';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, userState, userProgramProgress, userProgramProgressState, error: userError } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);
    const { spotlightWorkouts, spotlightWorkoutsState, error: workoutError } = useSelector((state: RootState) => state.workouts);
    const [dataLoaded, setDataLoaded] = useState<keyof typeof REQUEST_STATE>(REQUEST_STATE.PENDING);

    const fetchUserData = useCallback(async () => {
        try {
            await dispatch(getUserAsync());
            while (userState !== REQUEST_STATE.FULFILLED) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            console.log(error);
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, user]);

    const fetchOtherData = useCallback(async () => {
        try {
            if (!user || !user.UserId) {
                throw new Error('User data not available');
            }

            await Promise.all([
                dispatch(getUserFitnessProfileAsync()),
                dispatch(getUserProgramProgressAsync()),
                dispatch(getUserRecommendationsAsync()),
                dispatch(getWorkoutQuoteAsync()),
                dispatch(getRestDayQuoteAsync()),
                dispatch(getSpotlightWorkoutsAsync()),
                dispatch(getAllProgramsAsync()),
                dispatch(getWeightMeasurementsAsync()),
            ]);

            setDataLoaded(REQUEST_STATE.FULFILLED);
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            console.log(error);
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, user]);

    useEffect(() => {
        const initializeData = async () => {
            const userDataState = await fetchUserData();
            if (userDataState === REQUEST_STATE.FULFILLED) {
                await fetchOtherData();
            }
        };
        initializeData();
    }, [fetchUserData, fetchOtherData]);

    useEffect(() => {
        if (spotlightWorkoutsState === REQUEST_STATE.FULFILLED && spotlightWorkouts) {
            // dispatch(getMultipleWorkoutsAsync({ workoutIds: spotlightWorkouts.WorkoutIds }));
            dispatch(getAllWorkoutsAsync());
        }
    }, [spotlightWorkouts, dispatch]);

    useEffect(() => {
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress?.ProgramId) {
            dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId }));
        }
    }, [userProgramProgress, dispatch]);

    const { showSplash } = useSplashScreen({
        dataLoadedState: dataLoaded,
    });

    useEffect(() => {
        if (dataLoaded === REQUEST_STATE.FULFILLED && !showSplash && !userError && !programError && !workoutError) {
            router.replace('/(app)/(tabs)/home');
        }
    }, [dataLoaded, showSplash, userError, programError, workoutError]);

    if (showSplash) {
        return <BasicSplash isDataLoaded={dataLoaded === REQUEST_STATE.FULFILLED} showLoadingText={false} />;
    }

    if (userError || programError || workoutError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {userError || programError || workoutError || 'An unexpected error occurred.'}</Text>
            </SafeAreaView>
        );
    }

    return <></>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Initialization;
