// app/(tabs)/(top-tabs)/programs.tsx

import React from 'react';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import ActiveProgramHome from '@/components/programs/active-program-home';
import BrowseProgramsScreen from '@/app/programs/browse-programs';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData } from '@/hooks/useProgramData';

export default function ProgramsScreen() {
    const { userProgramProgress, dataLoadedState } = useProgramData();

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={dataLoadedState === REQUEST_STATE.FULFILLED} />;
    }

    return userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <BrowseProgramsScreen />;
}
