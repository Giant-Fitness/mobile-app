// store/programs/programsState.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { Program, ProgramDay } from '@/types';

export interface ProgramState {
    programs: Record<string, Program>;
    programsState: Record<string, REQUEST_STATE>;
    allProgramsState: REQUEST_STATE;
    programDays: Record<string, Record<string, ProgramDay>>;
    programDaysState: Record<string, Record<string, REQUEST_STATE>>;
    error: string | null;
}

export const initialState: ProgramState = {
    programs: {},
    programsState: {},
    allProgramsState: REQUEST_STATE.IDLE,
    programDays: {},
    programDaysState: {},
    error: null,
};
