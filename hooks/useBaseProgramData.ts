// hooks/useBaseProgramData.ts

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';

// Base hook for shared program data logic
export const useBaseProgramData = () => {
    const { user, userState, userProgramProgress, userProgramProgressState } = useSelector((state: RootState) => state.user);

    // Basic loading state that both active and inactive programs need
    const baseLoadingState = useMemo(() => {
        return userState === REQUEST_STATE.FULFILLED && userProgramProgressState === REQUEST_STATE.FULFILLED ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING;
    }, [userState, userProgramProgressState]);

    const hasActiveProgram = !!userProgramProgress?.ProgramId;

    return {
        user,
        userState,
        userProgramProgress,
        baseLoadingState,
        hasActiveProgram,
    };
};
