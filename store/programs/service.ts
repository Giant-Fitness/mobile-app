// store/programs/service.ts

import { Program, ProgramDay, UserWorkoutPlanProgress } from '@/store/types';
import { sampleProgramDays, mockPrograms, sampleUserProgress } from '@/store/programs/mockData';

const getAllPrograms = async (): Promise<Program[]> => {
    return mockPrograms;
};

const getCurrentDay = async (): Promise<ProgramDay> => {
    return sampleProgramDays.find((day) => day.WorkoutDayId === '22');
};

const getNextDays = async (planId: string, startDayId: string, numDays: int): Promise<ProgramDay[]> => {
    // Step 1: Filter days by the given planId
    const filteredDays = sampleProgramDays.filter((day) => day.WorkoutPlanId === planId);

    // Step 2: Find the starting index for the given startingDayId
    const startIndex = filteredDays.findIndex((day) => day.WorkoutDayId === startDayId);

    // Step 3: If the startIndex is found, slice the array to get the desired number of days
    if (startIndex !== -1) {
        return filteredDays.slice(startIndex, startIndex + numDays);
    }

    // Return an empty array if startingDayId is not found
    return [];

    return sampleProgramDays;
};

const getAllProgramDays = async (planId: string): Promise<ProgramDay[]> => {
    return sampleProgramDays;
};

const getActiveProgramMeta = async (): Promise<ProgramDay[]> => {
    return mockPrograms.find((program) => program.WorkoutPlanId === 'plan1');
};

const getUserPlanProgress = async (): Promise<UserWorkoutPlanProgress> => {
    return sampleUserProgress;
};

export default {
    getAllPrograms,
    getCurrentDay,
    getNextDays,
    getAllProgramDays,
    getActiveProgramMeta,
    getUserPlanProgress,
};
