// app/initialization.tsx

import React, { useEffect, useCallback } from 'react';
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
import { getAllWorkoutsAsync } from '@/store/workouts/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const { userProgramProgress, userProgramProgressState, error: userError } = useSelector((state: RootState) => state.user);
    const { error: programError } = useSelector((state: RootState) => state.programs);

    const fetchData = useCallback(async () => {
        try {
            await dispatch(getUserProgramProgressAsync());

            while (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (userProgramProgress && Object.keys(userProgramProgress).length > 0) {
                await Promise.all([
                    dispatch(getProgramAsync({ programId: userProgramProgress.ProgramId })),
                    dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId })),
                ]);
            } else {
                await dispatch(getAllProgramsAsync());
            }
            await Promise.all([dispatch(getWorkoutQuoteAsync()), dispatch(getRestDayQuoteAsync()), dispatch(getAllWorkoutsAsync())]);
            return REQUEST_STATE.FULFILLED;
        } catch (error) {
            console.error('Error fetching data:', error);
            return REQUEST_STATE.REJECTED;
        }
    }, [dispatch, userProgramProgress]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: userProgramProgressState,
    });

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        fetchData();
    }, [navigation, fetchData]);

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={userProgramProgressState === REQUEST_STATE.FULFILLED} />;
    }

    if (userError || programError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {userError || programError || 'An unexpected error occurred.'}</Text>
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
