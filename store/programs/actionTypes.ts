// store/programs/actionTypes.ts

export const actionTypes = {
    GET_USER_PROGRAM_PROGRESS: 'programs/getUserProgramProgress',
    GET_ALL_PROGRAMS: 'programs/getAllPrograms',
    GET_PROGRAM: 'programs/getProgram',
    GET_PROGRAM_DAY: 'programs/getProgramDay',
    GET_ALL_PROGRAM_DAYS: 'programs/getAllProgramDays',
    GET_ACTIVE_PROGRAM: 'programs/getActiveProgram',
    GET_ACTIVE_PROGRAM_CURRENT_DAY: 'programs/getActiveProgramCurrentDay',
    GET_ACTIVE_PROGRAM_NEXT_DAYS: 'programs/getActiveProgramNextDays',
} as const;
