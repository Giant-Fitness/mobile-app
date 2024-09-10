// store/programs/service.ts

import { Program, ProgramDay, UserWorkoutPlanProgress } from '@/store/types';
import { sampleProgramDays, mockPrograms, sampleUserProgress } from '@/store/programs/mockData';

const getAllPrograms = async (): Promise<Program[]> => {
    return mockPrograms;
};

const getCurrentDay = async (): Promise<ProgramDay> => {
    return sampleProgramDays.find((day) => day.WorkoutDayId === '22');
};

const getDaysByIds = async (planId: string, dayIds: string[]): Promise<ProgramDay[]> => {
    // Step 1: Filter days by the given planId
    const allDays = sampleProgramDays.filter((day) => day.WorkoutPlanId === planId);

    // Filter only the days with IDs in dayIds
    const filteredDays = allDays.filter((day) => dayIds.includes(day.WorkoutDayId));

    // Assuming the result should be sorted by WorkoutDayId
    return filteredDays.sort((a, b) => parseInt(a.WorkoutDayId) - parseInt(b.WorkoutDayId));
};

const getNextDays = async (planId: string, currentDayId: string, numDays: number): Promise<ProgramDay[]> => {
    // Fetch all days for the given plan
    const allDays = await getAllProgramDays(planId);

    // Get the IDs of the next 'numDays' days
    const dayIdsToFetch = Array.from({ length: numDays }, (_, i) => (parseInt(currentDayId) + i + 1).toString());

    // Use getDaysByIds to fetch the specific days
    return await getDaysByIds(planId, dayIdsToFetch);
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
