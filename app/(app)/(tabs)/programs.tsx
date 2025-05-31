// app/(app)/(tabs)/programs.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import ActiveProgramHome from '@/components/programs/active-program-home';
import InactiveProgramHome from '@/components/programs/inactive-program-home';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData, preloadProgramProgressData } from '@/hooks/useProgramData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export default function ProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const dispatch = useDispatch<AppDispatch>();
    const [forceRefresh, setForceRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
            setRefreshing(true);
            // Set forceRefresh to true to trigger the hook to refresh data
            setForceRefresh(true);
            // Also perform explicit refresh operations
            if (userProgramProgress?.ProgramId) {
                await preloadProgramProgressData(dispatch, userProgramProgress.ProgramId, true);
            }
            setTimeout(() => {
                setRefreshing(false);
            }, 200);
        } catch (err) {
            console.log('Refresh error:', err);
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
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            style={[{ backgroundColor: themeColors.background }]}
            showsVerticalScrollIndicator={false}
            overScrollMode='never'
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[themeColors.iconSelected]} tintColor={themeColors.iconSelected} />
            }
        >
            {userProgramProgress?.ProgramId ? <ActiveProgramHome /> : <InactiveProgramHome />}
        </ScrollView>
    );
}
