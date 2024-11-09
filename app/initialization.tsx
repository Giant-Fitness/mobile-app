// app/initialization.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { AppDispatch, RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Redirect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import {
    getUserAsync,
    getUserFitnessProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
} from '@/store/user/thunks';
import { getAllWorkoutsAsync, getMultipleWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const {
        user,
        userState,
        userProgramProgress,
        userProgramProgressState,
        userWeightMeasurements,
        error: userError,
    } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);
    const { spotlightWorkouts, spotlightWorkoutsState, error: workoutError } = useSelector((state: RootState) => state.workouts);
    const [dataLoaded, setDataLoaded] = useState(REQUEST_STATE.PENDING);

    useEffect(() => {
        // Hide header immediately on mount
        const hideHeader = () => {
            navigation.setOptions({
                headerShown: false,
                // Add any other header options you want to override
            });
        };

        // Run immediately and after a small delay to ensure it takes effect
        hideHeader();
        const timer = setTimeout(hideHeader, 1);

        return () => {
            clearTimeout(timer);
            // Optionally restore header on unmount if needed
            navigation.setOptions({ headerShown: true });
        };
    }, [navigation]);

    const fetchUserData = useCallback(async () => {
        try {
            await dispatch(getUserAsync());
            while (userState !== REQUEST_STATE.FULFILLED) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
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
    }, [navigation, fetchUserData, fetchOtherData]);

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

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoaded,
    });

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    if (userError || programError || workoutError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {userError || programError || workoutError || 'An unexpected error occurred.'}</Text>
            </SafeAreaView>
        );
    }

    return <Redirect href='/(tabs)/home' />;
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
