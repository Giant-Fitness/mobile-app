// app/(tabs)/(top-tabs)/programs.tsx

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import ActiveProgramHome from '@/app/programs/active-program-home';
import BrowseProgramsScreen from '@/app/programs/browse-programs';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { REQUEST_STATE } from '@/constants/requestStates';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgressState);

    const fetchData = useCallback(async () => {
        if (userProgramProgressState !== REQUEST_STATE.FULFILLED) {
            await dispatch(getUserProgramProgressAsync());
        }
    }, [dispatch, userProgramProgressState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: userProgramProgressState,
    });

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (showSplash || userProgramProgressState !== REQUEST_STATE.FULFILLED) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={userProgramProgressState === REQUEST_STATE.FULFILLED} />;
    }

    return userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <BrowseProgramsScreen />;
}
