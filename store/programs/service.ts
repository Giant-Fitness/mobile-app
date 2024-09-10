// store/programs/service.ts

import { Program, ProgramDay } from '@/store/types';
import { sampleProgramDays, mockPrograms } from '@/store/programs/mockData';

const getAllPrograms = async (): Promise<Program[]> => {
    return mockPrograms;
};

const getCurrentAndNextDays = async (): Promise<ProgramDay[]> => {
    return sampleProgramDays;
};

const getAllProgramDays = async (planId: string): Promise<ProgramDay[]> => {
    return sampleProgramDays;
};

export default {
    getAllPrograms,
    getCurrentAndNextDays,
    getAllProgramDays,
};
