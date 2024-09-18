// store/programs/service.ts

import { Program, ProgramDay, UserProgramProgress } from '@/type/types';
import { sampleProgramDays, mockPrograms, sampleUserProgress } from '@/store/programs/mockData';

const getUserProgramProgress = async (): Promise<UserProgramProgress> => {
    return sampleUserProgress;
};

const getAllPrograms = async (): Promise<Program[]> => {
    return mockPrograms;
};

const getProgram = async (programId: string): Promise<Program | undefined> => {
    return mockPrograms.find((program) => program.ProgramId === programId);
};

const getProgramDay = async (programId: string, dayId: string): Promise<ProgramDay | undefined> => {
    return sampleProgramDays.find((day) => day.ProgramId === programId && day.DayId === dayId);
};

const getProgramDaysAll = async (programId: string): Promise<ProgramDay[]> => {
    const allDays = sampleProgramDays.filter((day) => day.ProgramId === programId);
    return allDays;
};

const getProgramDaysFiltered = async (programId: string, dayIds: string[]): Promise<ProgramDay[]> => {
    // get all the days for a program
    const allDays = sampleProgramDays.filter((day) => day.ProgramId === programId);

    // Filter only the days with IDs in dayIds
    const filteredDays = allDays.filter((day) => dayIds.includes(day.DayId));

    // Assuming the result should be sorted by DayId
    return filteredDays.sort((a, b) => parseInt(a.DayId) - parseInt(b.DayId));
};

export default {
    getUserProgramProgress,
    getAllPrograms,
    getProgram,
    getProgramDaysAll,
    getProgramDay,
    getProgramDaysFiltered,
};
