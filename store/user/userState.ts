// store/user/userState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import {
    User,
    UserAppSettings,
    UserBodyMeasurement,
    UserExerciseSetModification,
    UserExerciseSubstitution,
    UserFitnessProfile,
    UserNutritionGoal,
    UserNutritionLog,
    UserNutritionProfile,
    UserProgramProgress,
    UserRecommendations,
    UserSleepMeasurement,
    UserWeightMeasurement,
} from '@/types';

export interface UserState {
    user: User | null;
    userState: REQUEST_STATE;
    userFitnessProfile: UserFitnessProfile | null;
    userFitnessProfileState: REQUEST_STATE;
    userNutritionProfile: UserNutritionProfile | null;
    userNutritionProfileState: REQUEST_STATE;
    userNutritionGoalHistory: UserNutritionGoal[];
    userNutritionGoalHistoryState: REQUEST_STATE;
    userNutritionLogs: { [date: string]: UserNutritionLog | null };
    userNutritionLogsState: REQUEST_STATE;
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
    userExerciseSubstitutions: UserExerciseSubstitution[];
    userExerciseSubstitutionsState: REQUEST_STATE;
    userExerciseSetModifications: UserExerciseSetModification[];
    userExerciseSetModificationsState: REQUEST_STATE;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    userState: REQUEST_STATE.IDLE,
    userFitnessProfile: null,
    userFitnessProfileState: REQUEST_STATE.IDLE,
    userNutritionProfile: null,
    userNutritionProfileState: REQUEST_STATE.IDLE,
    userNutritionGoalHistory: [],
    userNutritionGoalHistoryState: REQUEST_STATE.IDLE,
    userNutritionLogs: {},
    userNutritionLogsState: REQUEST_STATE.IDLE,
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
    userExerciseSubstitutions: [],
    userExerciseSubstitutionsState: REQUEST_STATE.IDLE,
    userExerciseSetModifications: [],
    userExerciseSetModificationsState: REQUEST_STATE.IDLE,
    error: null,
};
