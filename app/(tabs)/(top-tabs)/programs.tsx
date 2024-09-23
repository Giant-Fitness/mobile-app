// app/(tabs)/(top-tabs)/programs.tsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProgramProgressAsync } from '@/store/programs/thunks';
import { AppDispatch } from '@/store/store';
import { View, Text } from 'react-native';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/base/BasicSplash';
import ActiveProgramHome from '@/app/programs/active-program-home';
import { selectUserProgramProgress, selectUserProgramProgressLoadingState } from '@/store/programs/selectors';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const userProgramProgress = useSelector(selectUserProgramProgress);
    const userProgramProgressState = useSelector(selectUserProgramProgressLoadingState);

    useEffect(() => {
        dispatch(getUserProgramProgressAsync());
    }, [dispatch]);

    if (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
        return <BasicSplash />;
    }

    if (!userProgramProgress?.ProgramId) {
        return (
            <View>
                <Text>No active program found. Please select a program to start.</Text>
            </View>
        );
    }

    return <ActiveProgramHome />;
}
