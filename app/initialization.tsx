// components/initialization.tsx

import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BasicSplash } from '@/components/base/BasicSplash';
import { RootState, AppDispatch } from '@/store/rootReducer';
import { getActiveProgramAsync, getActiveProgramCurrentDayAsync, getUserProgramProgressAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Redirect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const {
        userProgramProgress,
        userProgramProgressState,
        activeProgramId,
        programs,
        programsState,
        programDays,
        programDaysState,
        activeProgramCurrentDayId,
        error: programError,
    } = useSelector((state: RootState) => state.programs);

    const [splashMinimumTimePassed, setSplashMinimumTimePassed] = useState(false);
    // Set a minimum splash screen display time (e.g., 0.5 seconds)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSplashMinimumTimePassed(true);
        }, 500); // 0.5 seconds
        return () => clearTimeout(timer);
    }, []);

    // fetch program progress
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                await dispatch(getUserProgramProgressAsync()).unwrap();
            } catch (err) {
                console.error('Error fetching user program progress:', err);
            }
        };
        fetchUserData();
    }, [dispatch]);

    // Once program progress is loaded, fetch active program and current day (but only if the response wasn't empty)
    useEffect(() => {
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress.ProgramId) {
            const fetchProgramData = async () => {
                try {
                    dispatch(getActiveProgramAsync()).unwrap();
                    dispatch(getActiveProgramCurrentDayAsync()).unwrap();
                } catch (err) {
                    console.error('Error fetching active program or current day:', err);
                }
            };
            fetchProgramData();
        }
    }, [userProgramProgressState, dispatch]);

    // Get the active program from the normalized state
    const activeProgram = activeProgramId ? programs[activeProgramId] : null;
    const activeProgramState = activeProgramId ? programsState[activeProgramId] : REQUEST_STATE.IDLE;

    // Get the current day from the normalized state
    const activeProgramCurrentDay = activeProgramId && activeProgramCurrentDayId ? programDays[activeProgramId]?.[activeProgramCurrentDayId] : null;
    const activeProgramCurrentDayState =
        activeProgramId && activeProgramCurrentDayId ? programDaysState[activeProgramId]?.[activeProgramCurrentDayId] : REQUEST_STATE.IDLE;

    // Determine if all data is loaded
    const isDataLoaded =
        userProgramProgressState === REQUEST_STATE.FULFILLED &&
        (activeProgramId ? activeProgramState === REQUEST_STATE.FULFILLED && activeProgramCurrentDayState === REQUEST_STATE.FULFILLED : true); // If no activeProgramId, skip activeProgramState checks

    // Show splash screen if data is not loaded or minimum splash time not passed
    if (!splashMinimumTimePassed || !isDataLoaded) {
        return <BasicSplash />;
    }

    // Optionally handle errors
    if (programError) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {programError || 'An unexpected error occurred.'}</Text>
                {/* You can add a retry button here */}
            </SafeAreaView>
        );
    }
    // Once data is loaded, redirect to home
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
