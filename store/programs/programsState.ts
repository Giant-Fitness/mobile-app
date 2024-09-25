// store/programs/programsState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Program, ProgramDay, UserProgramProgress } from '@/types';

export interface ProgramState {
    userProgramProgress: UserProgramProgress | null;
    userProgramProgressState: REQUEST_STATE;
    programs: Record<string, Program>;
    programsState: Record<string, REQUEST_STATE>;
    allProgramsState: REQUEST_STATE;
    programDays: Record<string, Record<string, ProgramDay>>;
    programDaysState: Record<string, Record<string, REQUEST_STATE>>;
    error: string | null;
}

export const initialState: ProgramState = {
    userProgramProgress: null,
    userProgramProgressState: REQUEST_STATE.IDLE,
    programs: {},
    programsState: {},
    allProgramsState: REQUEST_STATE.IDLE,
    programDays: {},
    programDaysState: {},
    error: null,
};
