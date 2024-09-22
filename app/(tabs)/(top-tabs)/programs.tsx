// app/(tabs)/(top-tabs)/programs.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProgramProgressAsync } from '@/store/programs/thunks';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { View, Text } from 'react-native';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/base/BasicSplash';

import ActiveProgramHome from '@/app/programs/active-program-home';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();

    const userProgramProgress = useSelector((state: RootState) => state.programs.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.programs.userProgramProgressState);

    useEffect(() => {
        dispatch(getUserProgramProgressAsync());
    }, [dispatch]);

    if (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
        return <BasicSplash />;
    } else if (userProgramProgressState === REQUEST_STATE.FULFILLED && !userProgramProgress) {
        console.log('User program progress is empty or null');
    }

    return <ActiveProgramHome />;
}
