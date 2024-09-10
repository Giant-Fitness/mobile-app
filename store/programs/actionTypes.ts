// store/programs/actionTypes.ts

export const actionTypes = {
    GET_ALL_PROGRAMS: 'programs/getAllPrograms',
    GET_NEXT_DAYS: 'programs/getNextDays',
    GET_CURRENT_DAY: 'programs/getCurrentDay',
    GET_ALL_PROGRAM_DAYS: 'programs/getAllProgramDays',
    GET_ACTIVE_PROGRAM_META: 'programs/getActiveProgramMeta',
    GET_USER_PLAN_PROGRESS: 'programs/getUserPlanProgress',
} as const;
