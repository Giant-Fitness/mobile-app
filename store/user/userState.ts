// store/user/userState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { UserProgramProgress, User, UserRecommendations } from '@/types';

export interface UserState {
    user: User | null;
    userState: REQUEST_STATE;
    userRecommendations: UserRecommendations | null;
    userRecommendationsState: REQUEST_STATE;
    userProgramProgress: UserProgramProgress | null;
    userProgramProgressState: REQUEST_STATE;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    userState: REQUEST_STATE.IDLE,
    userRecommendations: null,
    userRecommendationsState: REQUEST_STATE.IDLE,
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    error: null,
};
