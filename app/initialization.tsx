// app/initialization.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Redirect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { getProgramAsync, getAllProgramDaysAsync, getAllProgramsAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { getMultipleWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const { userProgramProgress, userProgramProgressState, error: userError } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);
    const { spotlightWorkouts, spotlightWorkoutsState, error: workoutError } = useSelector((state: RootState) => state.workouts);
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            await dispatch(getUserProgramProgressAsync());
            while (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (userProgramProgress && userProgramProgress.ProgramId) {
                await Promise.all([
                    dispatch(getProgramAsync({ programId: userProgramProgress.ProgramId })),
                    dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId })),
                ]);
            } else {
                await dispatch(getAllProgramsAsync());
            }
            await Promise.all([dispatch(getWorkoutQuoteAsync()), dispatch(getRestDayQuoteAsync()), dispatch(getSpotlightWorkoutsAsync())]);
            setDataLoaded(REQUEST_STATE.FULFILLED);
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, userProgramProgress]);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        fetchData();
    }, [navigation, fetchData]);

    useEffect(() => {
        if (spotlightWorkoutsState === REQUEST_STATE.FULFILLED && spotlightWorkouts) {
            dispatch(getMultipleWorkoutsAsync({ workoutIds: spotlightWorkouts.WorkoutIds }));
        }
    }, [spotlightWorkouts, dispatch]);

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
