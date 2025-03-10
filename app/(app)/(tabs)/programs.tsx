// app/(app)/(tabs)/programs.tsx

import React, { useEffect, useState } from 'react';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import ActiveProgramHome from '@/components/programs/active-program-home';
import InactiveProgramHome from '@/components/programs/inactive-program-home';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData, preloadProgramProgressData } from '@/hooks/useProgramData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import PullToRefresh from '@/components/base/PullToRefresh';

export default function ProgramsScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const [forceRefresh, setForceRefresh] = useState(false);

    // Use the hook with forceRefresh state
    const { userProgramProgress, dataLoadedState } = useProgramData(undefined, undefined, {
        fetchAllDays: true,
        forceRefresh: forceRefresh,
    });

    // Reset forceRefresh after it's been consumed
    useEffect(() => {
        if (forceRefresh) {
            setForceRefresh(false);
        }
    }, [forceRefresh]);

    const handleRefresh = async () => {
        try {
            // Set forceRefresh to true to trigger the hook to refresh data
            setForceRefresh(true);

            // Also perform explicit refresh operations
            if (userProgramProgress?.ProgramId) {
                await preloadProgramProgressData(dispatch, userProgramProgress.ProgramId, true);
            }
        } catch (error) {
            console.error('Error during refresh:', error);
        }
    };

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

    return (
        <PullToRefresh onRefresh={handleRefresh} useNativeScrollView={true}>
            {userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <InactiveProgramHome />}
        </PullToRefresh>
    );
}
