import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BasicSplash } from '@/components/base/BasicSplash';
import { AppDispatch, RootState } from '@/store/rootReducer';
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

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const [splashMinimumTimePassed, setSplashMinimumTimePassed] = useState(false);
    const [activeProgramLoaded, setActiveProgramLoaded] = useState(false);

    const { userProgramProgress, userProgramProgressState, error: programError } = useSelector((state: RootState) => state.programs);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const timer = setTimeout(() => setSplashMinimumTimePassed(true), 500);
        return () => clearTimeout(timer);
    }, [navigation]);

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getUserProgramProgressAsync());

            // Only fetch active program data if the user is on a program
            if (userProgramProgress && Object.keys(userProgramProgress).length > 0) {
                await Promise.all([
                    dispatch(getActiveProgramAsync()),
                    dispatch(getActiveProgramCurrentDayAsync()),
                    dispatch(getActiveProgramNextDaysAsync({ numDays: 3 })),
                ]);
            } else {
                await dispatch(getAllProgramsAsync());
            }

            setActiveProgramLoaded(true);
        };
        fetchData();
    }, [dispatch]);

    const isDataLoaded = userProgramProgressState === REQUEST_STATE.FULFILLED && activeProgramLoaded;

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
    // return (
    //     <SafeAreaView style={styles.container}>
    //         <Text style={styles.errorText}>{userProgramProgress.ProgramId}</Text>
    //     </SafeAreaView>
    // );
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
