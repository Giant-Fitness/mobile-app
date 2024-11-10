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
import { DebugOverlay } from '@/components/debug/DebugOverlay';

interface ErrorState {
    source: string;
    message: string;
}

const Initialization: React.FC = () => {
    const [lastAction, setLastAction] = useState<string>('Starting Initialization');
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const {
        user,
        userState,
        userProgramProgress,
        userProgramProgressState,
        userWeightMeasurements,
    } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);
    const { spotlightWorkouts, spotlightWorkoutsState, error: workoutError } = useSelector(
        (state: RootState) => state.workouts
    );
    const [dataLoaded, setDataLoaded] = useState(REQUEST_STATE.PENDING);
    const [error, setError] = useState<ErrorState | null>(null);

    useEffect(() => {
        const hideHeader = () => {
            navigation.setOptions({
                headerShown: false,
            });
        };

        hideHeader();
        const timer = setTimeout(hideHeader, 1);

        return () => {
            clearTimeout(timer);
            navigation.setOptions({ headerShown: true });
        };
    }, [navigation]);

    const fetchUserData = useCallback(async () => {
        try {
            setLastAction('Fetching User Data');
            const result = await dispatch(getUserAsync()).unwrap();
            if (!result) {
                throw new Error('Failed to fetch user data');
            }
            setLastAction('User Data Fetched');
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            setLastAction(`User Data Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setError({
                source: 'User Data',
                message: error instanceof Error ? error.message : 'Failed to fetch user data'
            });
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch]);

    const fetchOtherData = useCallback(async () => {
        try {
            if (!user?.UserId) {
                throw new Error('User ID not available');
            }

            setLastAction('Fetching Additional Data');
            const promises = [
                dispatch(getUserFitnessProfileAsync()).unwrap(),
                dispatch(getUserProgramProgressAsync()).unwrap(),
                dispatch(getUserRecommendationsAsync()).unwrap(),
                dispatch(getWorkoutQuoteAsync()).unwrap(),
                dispatch(getRestDayQuoteAsync()).unwrap(),
                dispatch(getSpotlightWorkoutsAsync()).unwrap(),
                dispatch(getAllProgramsAsync()).unwrap(),
                dispatch(getWeightMeasurementsAsync()).unwrap(),
            ];

            await Promise.all(promises);
            setLastAction('Additional Data Fetched');
            setDataLoaded(REQUEST_STATE.FULFILLED);
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            setLastAction(`Additional Data Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setError({
                source: 'Additional Data',
                message: error instanceof Error ? error.message : 'Failed to fetch additional data'
            });
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, user]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const userDataState = await fetchUserData();
                if (userDataState === REQUEST_STATE.FULFILLED) {
                    await fetchOtherData();
                }
            } catch (error) {
                setError({
                    source: 'Initialization',
                    message: error instanceof Error ? error.message : 'Failed to initialize app'
                });
            }
        };
        initializeData();
    }, [fetchUserData, fetchOtherData]);

    useEffect(() => {
        if (spotlightWorkoutsState === REQUEST_STATE.FULFILLED && spotlightWorkouts) {
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

    if (error || programError || workoutError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorSource}>
                    Error in: {error?.source || (programError ? 'Programs' : 'Workouts')}
                </Text>
                <Text style={styles.errorText}>
                    {error?.message || programError || workoutError || 'An unexpected error occurred.'}
                </Text>
            </SafeAreaView>
        );
    }

    const debugItems = [
        { label: 'Last Action', value: lastAction },
        { label: 'Data Loaded State', value: dataLoaded },
        { label: 'Error', value: error || 'None' },
        { label: 'User', value: user?.UserId || 'None' },
        { label: 'Program Progress', value: userProgramProgress?.ProgramId || 'None' },
        { label: 'Spotlight Workouts', value: spotlightWorkouts ? 'Loaded' : 'None' }
    ];

    const baseScreen = (
        <>
            {showSplash ? (
                <DumbbellSplash isDataLoaded={false} />
            ) : error || programError || workoutError ? (
                <SafeAreaView style={styles.container}>
                    <Text style={styles.errorSource}>
                        Error in: {error?.source || (programError ? 'Programs' : 'Workouts')}
                    </Text>
                    <Text style={styles.errorText}>
                        {error?.message || programError || workoutError || 'An unexpected error occurred.'}
                    </Text>
                </SafeAreaView>
            ) : (
                <Redirect href='/(tabs)/home' />
            )}
            {__DEV__ && <DebugOverlay items={debugItems} />}
        </>
    );
    return baseScreen;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorSource: {
        color: '#666',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Initialization;
