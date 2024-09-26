// app/(tabs)/(top-tabs)/programs.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { View, Text } from 'react-native';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/base/BasicSplash';
import ActiveProgramHome from '@/app/programs/active-program-home';
import BrowseProgramsScreen from '@/app/programs/browse-programs';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();

    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgressState);

    useEffect(() => {
        if (userProgramProgressState === REQUEST_STATE.IDLE) {
            dispatch(getUserProgramProgressAsync());
        }
    }, [dispatch, userProgramProgressState]);

    if (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
        return <BasicSplash />;
    }

    return userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <BrowseProgramsScreen />;
}
