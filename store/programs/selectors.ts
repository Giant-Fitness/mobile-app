// store/programs/selectors.ts

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { ProgramState } from '@/store/programs/programsState';
import { Program, ProgramDay } from '@/types';
import { REQUEST_STATE } from '@/constants/requestStates';

const selectProgramsState = (state: RootState): ProgramState => state.programs;

export const selectUserProgramProgress = createSelector(
    [selectProgramsState],
    (programsState) => programsState.userProgramProgress
);

export const selectAllPrograms = createSelector(
    [selectProgramsState],
    (programsState) => Object.values(programsState.programs)
);

export const selectProgramById = (programId: string) =>
    createSelector([selectProgramsState], (programsState) => programsState.programs[programId]);

export const selectActiveProgram = createSelector(
    [selectProgramsState],
    (programsState) =>
        programsState.activeProgramId ? programsState.programs[programsState.activeProgramId] : null
);

export const selectSelectedProgram = createSelector(
    [selectProgramsState],
    (programsState) =>
        programsState.selectedProgramId ? programsState.programs[programsState.selectedProgramId] : null
);

export const selectProgramDayById = (programId: string, dayId: string) =>
    createSelector(
        [selectProgramsState],
        (programsState) => programsState.programDays[programId]?.[dayId]
    );

export const selectActiveProgramCurrentDay = createSelector(
    [selectProgramsState],
    (programsState) => {
        const { activeProgramId, activeProgramCurrentDayId, programDays } = programsState;
        return activeProgramId && activeProgramCurrentDayId
            ? programDays[activeProgramId]?.[activeProgramCurrentDayId]
            : null;
    }
);

export const selectActiveProgramNextDays = createSelector(
    [selectProgramsState],
    (programsState) => {
        const { activeProgramId, activeProgramNextDayIds, programDays } = programsState;
        return activeProgramId
            ? activeProgramNextDayIds.map(dayId => programDays[activeProgramId]?.[dayId]).filter(Boolean)
            : [];
    }
);

export const selectProgramsLoadingState = createSelector(
    [selectProgramsState],
    (programsState) => programsState.allProgramsState
);

export const selectProgramLoadingState = (programId: string) =>
    createSelector(
        [selectProgramsState],
        (programsState) => programsState.programsState[programId] || REQUEST_STATE.IDLE
    );

export const selectProgramDayLoadingState = (programId: string, dayId: string) =>
    createSelector(
        [selectProgramsState],
        (programsState) => programsState.programDaysState[programId]?.[dayId] || REQUEST_STATE.IDLE
    );

export const selectProgramsError = createSelector(
    [selectProgramsState],
    (programsState) => programsState.error
);

export const selectProgramDaysError = createSelector(
    [selectProgramsState],
    (programsState) => programsState.programDaysError
);

export const selectUserProgramProgressLoadingState = createSelector(
    [selectProgramsState],
    (programsState) => programsState.userProgramProgressState
);