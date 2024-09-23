import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BasicSplash } from '@/components/base/BasicSplash';
import { AppDispatch } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Redirect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import {
    getUserProgramProgressAsync,
    getActiveProgramAsync,
    getActiveProgramCurrentDayAsync,
    getActiveProgramNextDaysAsync,
    getAllProgramsAsync,
} from '@/store/programs/thunks';
import {
    selectUserProgramProgress,
    selectUserProgramProgressLoadingState,
    selectActiveProgramLoadingState,
    selectActiveProgramCurrentDayLoadingState,
    selectActiveProgramNextDaysLoadingState,
    selectProgramsLoadingState,
    selectProgramsError,
} from '@/store/programs/selectors';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const [splashMinimumTimePassed, setSplashMinimumTimePassed] = useState(false);

    const userProgramProgress = useSelector(selectUserProgramProgress);
    const userProgramProgressState = useSelector(selectUserProgramProgressLoadingState);
    const activeProgramState = useSelector(selectActiveProgramLoadingState);
    const activeProgramCurrentDayState = useSelector(selectActiveProgramCurrentDayLoadingState);
    const activeProgramNextDaysState = useSelector(selectActiveProgramNextDaysLoadingState);
    const allProgramsState = useSelector(selectProgramsLoadingState);
    const programError = useSelector(selectProgramsError);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const timer = setTimeout(() => setSplashMinimumTimePassed(true), 500);
        return () => clearTimeout(timer);
    }, [navigation]);

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getUserProgramProgressAsync());
            await dispatch(getAllProgramsAsync());

            // Only fetch active program data if the user is on a program
            if (userProgramProgress && Object.keys(userProgramProgress).length > 0) {
                await Promise.all([
                    dispatch(getActiveProgramAsync()),
                    dispatch(getActiveProgramCurrentDayAsync()),
                    dispatch(getActiveProgramNextDaysAsync({ numDays: 3 })),
                ]);
            }
        };
        fetchData();
    }, [dispatch, userProgramProgress]);

    const isDataLoaded =
        userProgramProgressState === REQUEST_STATE.FULFILLED &&
        allProgramsState === REQUEST_STATE.FULFILLED &&
        (Object.keys(userProgramProgress || {}).length === 0 ||
            (activeProgramState === REQUEST_STATE.FULFILLED &&
                activeProgramCurrentDayState === REQUEST_STATE.FULFILLED &&
                activeProgramNextDaysState === REQUEST_STATE.FULFILLED));

    if (!splashMinimumTimePassed || !isDataLoaded) {
        return <BasicSplash />;
    }

    if (programError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {programError || 'An unexpected error occurred.'}</Text>
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
