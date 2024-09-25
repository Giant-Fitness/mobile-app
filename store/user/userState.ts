// store/user/userState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress } from '@/types';

export interface ProgramState {
    userProgramProgress: UserProgramProgress | null;
    userProgramProgressState: REQUEST_STATE;
    error: string | null;
}

export const initialState: ProgramState = {
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    error: null,
};
