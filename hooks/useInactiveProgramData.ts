// hooks/useInactiveProgramData.ts

import { useEffect, useMemo } from 'react';
import { useBaseProgramData } from './useBaseProgramData';
import { getUserRecommendationsAsync } from '@/store/user/thunks';
import { getProgramAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

export const useInactiveProgramData = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, baseLoadingState, hasActiveProgram } = useBaseProgramData();

    const { userRecommendations, userRecommendationsState } = useSelector((state: RootState) => state.user);
    const { programs } = useSelector((state: RootState) => state.programs);

    // Only fetch recommendations if user has completed onboarding
    const isOnboardingComplete = user?.OnboardingStatus?.fitness === true;

    useEffect(() => {
        const loadRecommendations = async () => {
            if (isOnboardingComplete && !hasActiveProgram && userRecommendationsState !== REQUEST_STATE.FULFILLED) {
                await dispatch(getUserRecommendationsAsync());

                // Only fetch recommended program details if we have a recommendation
                if (userRecommendations?.RecommendedProgramID) {
                    await dispatch(
                        getProgramAsync({
                            programId: userRecommendations.RecommendedProgramID,
                        }),
                    );
                }
            }
        };

        loadRecommendations();
    }, [dispatch, isOnboardingComplete, hasActiveProgram, userRecommendationsState]);

    const recommendedProgram = useMemo(() => {
        if (isOnboardingComplete && userRecommendations?.RecommendedProgramID) {
            return programs[userRecommendations.RecommendedProgramID];
        }
        return null;
    }, [isOnboardingComplete, userRecommendations, programs]);

    // Don't wait for recommendations to show the screen
    const dataLoadedState = baseLoadingState;

    return {
        isOnboardingComplete,
        recommendedProgram,
        dataLoadedState,
    };
};
