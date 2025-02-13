// app/(app)/initialization.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { router } from 'expo-router';
import { getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import {
    getSleepMeasurementsAsync,
    getUserAppSettingsAsync,
    getUserAsync,
    getUserFitnessProfileAsync,
    getUserProgramProgressAsync,
    getUserRecommendationsAsync,
    getWeightMeasurementsAsync,
} from '@/store/user/thunks';
import { getAllWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { BasicSplash } from '@/components/base/BasicSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, userState, userProgramProgress, userProgramProgressState, error: userError } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);
    const { error: workoutError } = useSelector((state: RootState) => state.workouts);
    const { error: exerciseError } = useSelector((state: RootState) => state.exerciseProgress);

    const [dataLoaded, setDataLoaded] = useState<keyof typeof REQUEST_STATE>(REQUEST_STATE.PENDING);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const fetchUserData = useCallback(async () => {
        try {
            await dispatch(getUserAsync());
            while (userState !== REQUEST_STATE.FULFILLED) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            console.log('Error fetching user data:', error);
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
                dispatch(initializeTrackedLiftsHistoryAsync()),
                dispatch(getSleepMeasurementsAsync()),
                dispatch(getUserAppSettingsAsync()),
                dispatch(getAllWorkoutsAsync()),
            ]);

            setDataLoaded(REQUEST_STATE.FULFILLED);
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            console.log('Error fetching other data:', error);
            setDataLoaded(REQUEST_STATE.REJECTED);
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, user]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsRetrying(false);
                const userDataState = await fetchUserData();
                if (userDataState === REQUEST_STATE.FULFILLED) {
                    await fetchOtherData();
                } else {
                    setDataLoaded(REQUEST_STATE.REJECTED);
                }
            } catch (error) {
                console.log('Initialization error:', error);
                setDataLoaded(REQUEST_STATE.REJECTED);
            }
        };

        initializeData();
    }, [fetchUserData, fetchOtherData, retryAttempt]);

    useEffect(() => {
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress?.ProgramId) {
            dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId }));
        }
    }, [userProgramProgress, dispatch, userProgramProgressState]);

    const { showSplash } = useSplashScreen({
        dataLoadedState: dataLoaded,
    });

    useEffect(() => {
        if (dataLoaded === REQUEST_STATE.FULFILLED && !showSplash && !userError && !programError && !workoutError && !exerciseError) {
            router.replace('/(app)/(tabs)/home');
        }
    }, [dataLoaded, showSplash, userError, programError, workoutError, exerciseError]);

    const handleRetry = () => {
        setIsRetrying(true);
        setDataLoaded(REQUEST_STATE.PENDING);
        setRetryAttempt((prev) => prev + 1);
    };

    if (showSplash && dataLoaded !== REQUEST_STATE.REJECTED) {
        return <BasicSplash isDataLoaded={dataLoaded === REQUEST_STATE.FULFILLED} showLoadingText={false} />;
    }

    const hasError = dataLoaded === REQUEST_STATE.REJECTED || userError || programError || workoutError || exerciseError;

    if (hasError) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Connection Error
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>
                        We couldn&apos;t connect to our servers. Please check your internet connection and try again.
                    </ThemedText>
                    <View style={styles.buttonContainer}>
                        <PrimaryButton size='MD' text='Retry' onPress={handleRetry} loading={isRetrying} style={styles.retryButton} />
                    </View>

                    {__DEV__ && (
                        <View style={styles.devErrorDetails}>
                            <ThemedText type='caption' style={styles.devErrorTitle}>
                                Error Details (Dev Only):
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                {userError || programError || workoutError || exerciseError || 'Unknown error occurred'}
                            </ThemedText>
                        </View>
                    )}
                </View>
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
    },
    errorContainer: {
        width: '70%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorTitle: {
        marginBottom: Spaces.MD,
        textAlign: 'center',
    },
    errorMessage: {
        textAlign: 'center',
        marginBottom: Spaces.LG,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: Spaces.LG,
    },
    retryButton: {
        width: '60%',
        alignSelf: 'center',
    },
    devErrorDetails: {
        marginTop: Spaces.LG,
    },
    devErrorTitle: {},
    devErrorText: {},
});

export default Initialization;
