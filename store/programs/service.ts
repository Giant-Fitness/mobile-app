// store/programs/service.ts

import { Program, ProgramDay } from '@/types';
import { sampleProgramDays, mockPrograms } from '@/store/programs/mockData';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getAllPrograms = async (): Promise<Program[]> => {
    console.log('service: getAllPrograms');
    await simulateNetworkDelay();
    return mockPrograms;
};

const getProgram = async (programId: string): Promise<Program | undefined> => {
    console.log('service: getProgram');
    await simulateNetworkDelay();
    return mockPrograms.find((program) => program.ProgramId === programId);
};

const getProgramDay = async (programId: string, dayId: string): Promise<ProgramDay | undefined> => {
    console.log('service: getProgramDay');
    await simulateNetworkDelay();
    return sampleProgramDays.find((day) => day.ProgramId === programId && day.DayId === dayId);
};

const getProgramDaysAll = async (programId: string): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysAll');
    await simulateNetworkDelay();
    const allDays = sampleProgramDays.filter((day) => day.ProgramId === programId);
    return allDays;
};

const getProgramDaysFiltered = async (programId: string, dayIds: string[]): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysFiltered');
    await simulateNetworkDelay();
    // get all the days for a program
    const allDays = sampleProgramDays.filter((day) => day.ProgramId === programId);
    // Filter only the days with IDs in dayIds
    const filteredDays = allDays.filter((day) => dayIds.includes(day.DayId));
    // Assuming the result should be sorted by DayId
    return filteredDays.sort((a, b) => parseInt(a.DayId) - parseInt(b.DayId));
};

export default {
    getAllPrograms,
    getProgram,
    getProgramDaysAll,
    getProgramDay,
    getProgramDaysFiltered,
};
