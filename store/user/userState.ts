// store/user/userState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import {
    UserProgramProgress,
    User,
    UserRecommendations,
    UserFitnessProfile,
    UserWeightMeasurement,
    UserSleepMeasurement,
    UserAppSettings,
    UserBodyMeasurement,
} from '@/types';

export interface UserState {
    user: User | null;
    userState: REQUEST_STATE;
    userFitnessProfile: UserFitnessProfile | null;
    userFitnessProfileState: REQUEST_STATE;
    userRecommendations: UserRecommendations | null;
    userRecommendationsState: REQUEST_STATE;
    userProgramProgress: UserProgramProgress | null;
    userProgramProgressState: REQUEST_STATE;
    userWeightMeasurements: UserWeightMeasurement[];
    userWeightMeasurementsState: REQUEST_STATE;
    userSleepMeasurements: UserSleepMeasurement[];
    userSleepMeasurementsState: REQUEST_STATE;
    userAppSettings: UserAppSettings | null;
    userAppSettingsState: REQUEST_STATE;
    userBodyMeasurements: UserBodyMeasurement[];
    userBodyMeasurementsState: REQUEST_STATE;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    userState: REQUEST_STATE.IDLE,
    userFitnessProfile: null,
    userFitnessProfileState: REQUEST_STATE.IDLE,
    userRecommendations: null,
    userRecommendationsState: REQUEST_STATE.IDLE,
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    userWeightMeasurements: [],
    userWeightMeasurementsState: REQUEST_STATE.IDLE,
    userSleepMeasurements: [],
    userSleepMeasurementsState: REQUEST_STATE.IDLE,
    userAppSettings: null,
    userAppSettingsState: REQUEST_STATE.IDLE,
    userBodyMeasurements: [],
    userBodyMeasurementsState: REQUEST_STATE.IDLE,
    error: null,
};
