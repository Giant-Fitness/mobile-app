// app/(app)/(tabs)/programs.tsx

import React, { useEffect } from 'react';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import ActiveProgramHome from '@/components/programs/active-program-home';
import InactiveProgramHome from '@/components/programs/inactive-program-home';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData, preloadProgramProgressData } from '@/hooks/useProgramData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const { userProgramProgress, dataLoadedState } = useProgramData();

    // Start preloading progress data as soon as we enter the programs tab
    useEffect(() => {
        if (userProgramProgress?.ProgramId) {
            preloadProgramProgressData(dispatch, userProgramProgress.ProgramId);
        }
    }, [userProgramProgress?.ProgramId]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={dataLoadedState === REQUEST_STATE.FULFILLED} />;
    }

    return userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <InactiveProgramHome />;
}
